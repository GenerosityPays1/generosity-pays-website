/**
 * Database migration script for Turso.
 * Runs automatically during Vercel deployment (postbuild).
 * Run manually: tsx scripts/migrate.ts
 */
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.log('TURSO_DATABASE_URL not set — skipping migration.');
  process.exit(0);
}

if (url.startsWith('file:')) {
  console.log('Local file database detected — skipping Turso migration.');
  process.exit(0);
}

const client = createClient({ url, authToken });

async function migrate() {
  console.log('Running database migrations against Turso...');

  // ─── Create tables (all columns included, no ALTER TABLE needed) ───────────

  await client.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      business_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      monthly_volume TEXT,
      lead_type TEXT NOT NULL CHECK(lead_type IN ('fee_analysis', 'consultation')),
      statement_filename TEXT,
      statement_path TEXT,
      contacted INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      notes TEXT DEFAULT '',
      merchant_id INTEGER,
      estimated_savings TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      page_source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      replied INTEGER DEFAULT 0,
      ip_address TEXT,
      page_source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS merchants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
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
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      merchant_id INTEGER,
      lead_id INTEGER,
      appointment_date DATETIME NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      location TEXT,
      status TEXT DEFAULT 'scheduled'
        CHECK(status IN ('scheduled','completed','cancelled','no_show')),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
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
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('new_lead','new_contact','new_upload','appointment_reminder','stage_change')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      admin_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
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
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      username TEXT NOT NULL,
      success INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
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
    )
  `);

  console.log('✓ All tables created (or already exist)');

  // ─── Create default admin user if none exists ─────────────────────────────
  const adminResult = await client.execute(
    "SELECT id FROM admin_users WHERE username = 'admin'"
  );

  if (adminResult.rows.length === 0) {
    const defaultPassword =
      process.env.ADMIN_DEFAULT_PASSWORD ?? crypto.randomBytes(16).toString('hex');
    const passwordHash = bcrypt.hashSync(defaultPassword, 12);

    await client.execute({
      sql: 'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      args: ['admin', passwordHash],
    });

    console.log('============================================');
    console.log('  INITIAL ADMIN CREDENTIALS');
    console.log('  Username: admin');
    console.log(`  Password: ${defaultPassword}`);
    console.log('  CHANGE THIS PASSWORD IMMEDIATELY');
    console.log('============================================');
  } else {
    console.log('✓ Admin user already exists');
  }

  console.log('Migration complete!');
  client.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
