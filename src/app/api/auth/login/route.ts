import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { getClientIp } from '@/lib/api-helpers';
import { serverLog } from '@/lib/server-logger';

interface LoginBody {
  username: string;
  password: string;
}

interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
}

// Rate limiting: max 6 failed attempts per IP within 15 minutes
const MAX_FAILED_ATTEMPTS = 6;
const LOCKOUT_WINDOW_MINUTES = 15;

async function isRateLimited(ip: string, username: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString();

  const ipResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM login_attempts WHERE ip_address = ? AND success = 0 AND created_at > ?',
    args: [ip, cutoff],
  });
  if (Number(ipResult.rows[0]?.count ?? 0) >= MAX_FAILED_ATTEMPTS) return true;

  const userResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM login_attempts WHERE username = ? AND success = 0 AND created_at > ?',
    args: [username, cutoff],
  });
  if (Number(userResult.rows[0]?.count ?? 0) >= MAX_FAILED_ATTEMPTS) return true;

  return false;
}

async function recordLoginAttempt(ip: string, username: string, success: boolean): Promise<void> {
  await db.execute({
    sql: 'INSERT INTO login_attempts (ip_address, username, success) VALUES (?, ?, ?)',
    args: [ip, username, success ? 1 : 0],
  });

  // Clean up old login attempts (older than 24 hours)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: 'DELETE FROM login_attempts WHERE created_at < ?',
    args: [dayAgo],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginBody = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Input length limits
    if (username.length > 100 || password.length > 128) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const ip = getClientIp(request);

    // Check rate limiting
    if (await isRateLimited(ip, username)) {
      serverLog({ level: 'warn', category: 'auth', message: `Rate limited login attempt for "${username}"`, request });
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const userResult = await db.execute({
      sql: 'SELECT id, username, password_hash FROM admin_users WHERE username = ?',
      args: [username],
    });
    const user = userResult.rows[0] as unknown as AdminUser | undefined;

    if (!user) {
      await recordLoginAttempt(ip, username, false);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatch) {
      await recordLoginAttempt(ip, username, false);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Record successful login and clear failed attempts for this IP/user
    await recordLoginAttempt(ip, username, true);
    serverLog({ level: 'info', category: 'auth', message: `Successful login for "${username}"`, request });

    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, username: user.username },
    });
  } catch {
    serverLog({ level: 'error', category: 'auth', message: 'Login endpoint error', request });
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
