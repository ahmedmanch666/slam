"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.now = exports.db = void 0;
exports.initSchema = initSchema;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
exports.db = new better_sqlite3_1.default('tendercrm.db');
function initSchema() {
    exports.db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','user')),
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT,
    address TEXT,
    phone1 TEXT,
    phone2 TEXT,
    email TEXT,
    website TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    mobile TEXT,
    email TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS tenders (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    ref_number TEXT,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    docs_purchase_deadline INTEGER,
    submission_deadline INTEGER NOT NULL,
    technical_opening_date INTEGER,
    financial_opening_date INTEGER,
    award_date INTEGER,
    expected_value REAL,
    final_value REAL,
    primary_guarantee REAL,
    final_guarantee REAL,
    margin REAL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    contract_number TEXT,
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    value REAL NOT NULL,
    payment_terms TEXT,
    renewal_date INTEGER,
    status TEXT NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    related_type TEXT NOT NULL,
    related_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date INTEGER NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    reminder_offset INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS followups (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tender_id TEXT,
    contract_id TEXT,
    type TEXT NOT NULL,
    date_time INTEGER NOT NULL,
    contact_name TEXT,
    summary TEXT NOT NULL,
    next_step TEXT,
    next_step_date INTEGER
  );
  `);
}
const now = () => Date.now();
exports.now = now;
