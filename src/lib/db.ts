import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// On Vercel, the project filesystem is read-only — use /tmp for the database
const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'generosity-pays.db')
  : path.join(process.cwd(), 'data', 'generosity-pays.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('busy_timeout = 5000');
  _db.pragma('foreign_keys = ON');

  // Original tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      business_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      monthly_volume TEXT,
      lead_type TEXT CHECK(lead_type IN ('fee_analysis', 'consultation')) NOT NULL,
      statement_filename TEXT,
      statement_path TEXT,
      contacted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // New tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER REFERENCES leads(id),
      business_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      monthly_volume TEXT,
      current_processor TEXT,
      current_rate TEXT,
      our_rate TEXT,
      estimated_savings TEXT,
      pipeline_stage TEXT DEFAULT 'new_lead'
        CHECK(pipeline_stage IN (
          'new_lead','contacted','fee_analysis_sent','negotiation',
          'application_submitted','approved','installed','active_merchant'
        )),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      merchant_id INTEGER REFERENCES merchants(id),
      lead_id INTEGER REFERENCES leads(id),
      appointment_date DATETIME NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      location TEXT,
      status TEXT DEFAULT 'scheduled'
        CHECK(status IN ('scheduled','completed','cancelled','no_show')),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      entity_type TEXT NOT NULL CHECK(entity_type IN ('lead','merchant','general')),
      entity_id INTEGER,
      description TEXT,
      uploaded_by INTEGER REFERENCES admin_users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('new_lead','new_contact','new_upload','appointment_reminder','stage_change')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      admin_user_id INTEGER REFERENCES admin_users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS server_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL CHECK(level IN ('info','warn','error','critical')),
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      request_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      username TEXT NOT NULL,
      success INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      availability TEXT,
      experience TEXT,
      notes TEXT,
      ip_address TEXT,
      page_source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Additive ALTER statements for existing tables
  const alterStatements = [
    "ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'new'",
    "ALTER TABLE leads ADD COLUMN notes TEXT DEFAULT ''",
    "ALTER TABLE leads ADD COLUMN merchant_id INTEGER",
    "ALTER TABLE leads ADD COLUMN estimated_savings TEXT",
    "ALTER TABLE leads ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE contacts ADD COLUMN read INTEGER DEFAULT 0",
    "ALTER TABLE contacts ADD COLUMN replied INTEGER DEFAULT 0",
    "ALTER TABLE admin_users ADD COLUMN email TEXT",
    "ALTER TABLE leads ADD COLUMN ip_address TEXT",
    "ALTER TABLE leads ADD COLUMN page_source TEXT",
    "ALTER TABLE contacts ADD COLUMN ip_address TEXT",
    "ALTER TABLE contacts ADD COLUMN page_source TEXT",
  ];
  for (const sql of alterStatements) {
    try { _db.exec(sql); } catch { /* column already exists */ }
  }

  // Backfill status from contacted flag
  _db.exec("UPDATE leads SET status = 'contacted' WHERE contacted = 1 AND (status IS NULL OR status = 'new')");

  // Default admin user — generate a strong random password on first run
  const existingAdmin = _db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || crypto.randomBytes(16).toString('hex');
    const passwordHash = bcrypt.hashSync(defaultPassword, 12);
    _db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);
    console.log('============================================');
    console.log('  INITIAL ADMIN CREDENTIALS');
    console.log('  Username: admin');
    console.log(`  Password: ${defaultPassword}`);
    console.log('  CHANGE THIS PASSWORD IMMEDIATELY');
    console.log('============================================');
  }

  return _db;
}

const db = new Proxy({} as Database.Database, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export default db;
