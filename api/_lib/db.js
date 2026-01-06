const mysql = require('mysql2/promise');

// MySQL Database Connection Pool
let _pool = null;
let _initialized = false;

function getPool() {
  if (_pool) return _pool;

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  console.log('Connecting to MySQL...', { host, user, database, hasPassword: !!password });

  if (!host || !user || !database) {
    console.error('Missing MySQL configuration');
    throw new Error('Database not configured: Missing MySQL environment variables');
  }

  _pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  return _pool;
}

// Initialize database schema
async function initDb() {
  if (_initialized) return;

  try {
    const pool = getPool();

    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000)
      )
    `);

    // Create refresh_tokens table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(500) UNIQUE NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        expires_at BIGINT NOT NULL,
        revoked TINYINT DEFAULT 0,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create companies table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        phone2 VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        notes TEXT,
        sector VARCHAR(100),
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        updated_at BIGINT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create tenders table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tenders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        company_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        status VARCHAR(50),
        value DECIMAL(15,2),
        submission_date BIGINT,
        notes TEXT,
        sample_date BIGINT,
        proof_date BIGINT,
        delivery_duration VARCHAR(100),
        vat_status VARCHAR(50),
        gm_instructions TEXT,
        dm_instructions TEXT,
        include_vat TINYINT DEFAULT 0,
        include_insurance TINYINT DEFAULT 0,
        include_withholding TINYINT DEFAULT 0,
        vat_amount DECIMAL(15,2),
        withholding_amount DECIMAL(15,2),
        insurance_amount DECIMAL(15,2),
        total_value DECIMAL(15,2),
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create contracts table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contracts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        company_id VARCHAR(36),
        tender_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        status VARCHAR(50),
        value DECIMAL(15,2),
        start_date BIGINT,
        end_date BIGINT,
        notes TEXT,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create tasks table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        related_type VARCHAR(50),
        related_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        priority VARCHAR(50),
        status VARCHAR(50),
        due_date BIGINT,
        notes TEXT,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create followups table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS followups (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        related_type VARCHAR(50),
        related_id VARCHAR(36),
        type VARCHAR(50),
        date BIGINT,
        notes TEXT,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create tender_items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tender_items (
        id VARCHAR(36) PRIMARY KEY,
        tender_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        quantity DECIMAL(15,2),
        specifications TEXT,
        delivery_schedule TEXT,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
      )
    `);

    // Create tender_competitors table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tender_competitors (
        id VARCHAR(36) PRIMARY KEY,
        tender_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        details TEXT,
        price DECIMAL(15,2),
        is_winner TINYINT DEFAULT 0,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
      )
    `);

    // Create tender_attachments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tender_attachments (
        id VARCHAR(36) PRIMARY KEY,
        tender_id VARCHAR(36) NOT NULL,
        type VARCHAR(50),
        url LONGTEXT NOT NULL,
        description TEXT,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
      )
    `);

    // Create invoices table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        tender_id VARCHAR(36) NOT NULL,
        date BIGINT,
        amount DECIMAL(15,2),
        quantity DECIMAL(15,2),
        vat_amount DECIMAL(15,2),
        details TEXT,
        created_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
        FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
      )
    `);

    _initialized = true;
    console.log('MySQL database schema initialized successfully');
  } catch (err) {
    console.error('Failed to initialize MySQL database:', err.message);
    throw err;
  }
}

// User operations
async function findUserByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createUser({ id, email, password_hash, role }) {
  const pool = getPool();
  await pool.execute(
    'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [id, email, password_hash, role]
  );
}

async function countUsers() {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
  return rows[0]?.count || 0;
}

// Refresh token operations
async function saveRefreshToken({ token, user_id, expires_at }) {
  try {
    const pool = getPool();
    await pool.execute(
      'INSERT INTO refresh_tokens (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [token, user_id, expires_at, Date.now()]
    );
  } catch (err) {
    console.error('Error saving refresh token:', err.message);
    // Don't throw - allow login to proceed even if token storage fails
  }
}

async function findRefreshToken(token) {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
  return rows[0] || null;
}

async function revokeRefreshToken(token) {
  const pool = getPool();
  await pool.execute('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [token]);
}

// Helper to get current timestamp
function now() {
  return Date.now();
}

// Generic query executor for data handlers
async function execute(sql, args = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, args);
  return { rows };
}

module.exports = {
  getPool,
  initDb,
  findUserByEmail,
  findUserById,
  createUser,
  countUsers,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  now,
  execute
};
