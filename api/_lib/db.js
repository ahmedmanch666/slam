const { createClient } = require('@libsql/client');

// Turso Database Connection
let _db = null;
let _initialized = false;

function getDb() {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log('Connecting to Turso...', { urlExists: !!url, tokenExists: !!authToken });

  if (!url) {
    console.error('Missing TURSO_DATABASE_URL environment variable');
    throw new Error('Database not configured: Missing TURSO_DATABASE_URL');
  }

  _db = createClient({
    url,
    authToken
  });

  return _db;
}

// Initialize database schema
async function initDb() {
  if (_initialized) return;

  try {
    const db = getDb();

    // Create users table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at INTEGER DEFAULT (unixepoch() * 1000)
        )
      `);

    // Create refresh_tokens table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          revoked INTEGER DEFAULT 0,
          created_at INTEGER DEFAULT (unixepoch() * 1000),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

    // Create companies table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          phone2 TEXT,
          email TEXT,
          address TEXT,
          notes TEXT,
          sector TEXT,
          created_at INTEGER DEFAULT (unixepoch() * 1000),
          updated_at INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

    // Migration: Add missing columns if they don't exist
    try { await db.execute('ALTER TABLE companies ADD COLUMN sector TEXT'); } catch { }
    try { await db.execute('ALTER TABLE companies ADD COLUMN phone2 TEXT'); } catch { }

    // Create contacts table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS contacts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          company_id TEXT,
          name TEXT NOT NULL,
          position TEXT,
          phone TEXT,
          email TEXT,
          notes TEXT,
          created_at INTEGER DEFAULT (unixepoch() * 1000),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

    // Create tenders table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS tenders (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          company_id TEXT,
          title TEXT NOT NULL,
          type TEXT,
          status TEXT,
          value REAL,
          submission_date INTEGER,
          notes TEXT,
          created_at INTEGER DEFAULT (unixepoch() * 1000),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

    // Create contracts table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS contracts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          company_id TEXT,
          tender_id TEXT,
          title TEXT NOT NULL,
          status TEXT,
          value REAL,
          start_date INTEGER,
          end_date INTEGER,
          notes TEXT,
          created_at INTEGER DEFAULT (unixepoch() * 1000),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

    // Create tasks table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          related_type TEXT,
          related_id TEXT,
          title TEXT NOT NULL,
          priority TEXT,
          status TEXT,
          due_date INTEGER,
          notes TEXT,
          created_at INTEGER DEFAULT (unixepoch() * 1000),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

    // Create followups table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS followups (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          related_type TEXT,
          related_id TEXT,
          type TEXT,
          date INTEGER,
          notes TEXT,
          created_at INTEGER DEFAULT (unixepoch() * 1000),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

    // Create indexes for faster lookups
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_tenders_user ON tenders(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_contracts_user ON contracts(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id)`);

    _initialized = true;
    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    throw err;
  }
}

// User operations
async function findUserByEmail(email) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  return result.rows[0] || null;
}

async function findUserById(id) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
}

async function createUser({ id, email, password_hash, role }) {
  const db = getDb();
  await db.execute({
    sql: 'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
    args: [id, email, password_hash, role]
  });
}

async function countUsers() {
  const db = getDb();
  const result = await db.execute('SELECT COUNT(*) as count FROM users');
  return result.rows[0]?.count || 0;
}

// Refresh token operations
async function saveRefreshToken({ token, user_id, expires_at }) {
  const db = getDb();
  await db.execute({
    sql: 'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, user_id, expires_at]
  });
}

async function findRefreshToken(token) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM refresh_tokens WHERE token = ?',
    args: [token]
  });
  return result.rows[0] || null;
}

async function revokeRefreshToken(token) {
  const db = getDb();
  await db.execute({
    sql: 'UPDATE refresh_tokens SET revoked = 1 WHERE token = ?',
    args: [token]
  });
}

// Helper to get current timestamp
function now() {
  return Date.now();
}

module.exports = {
  getDb,
  initDb,
  findUserByEmail,
  findUserById,
  createUser,
  countUsers,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  now
};
