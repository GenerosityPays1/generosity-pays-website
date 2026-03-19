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

function isRateLimited(ip: string, username: string): boolean {
  const cutoff = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString();

  // Check by IP
  const ipAttempts = db
    .prepare(
      'SELECT COUNT(*) as count FROM login_attempts WHERE ip_address = ? AND success = 0 AND created_at > ?'
    )
    .get(ip, cutoff) as { count: number };

  if (ipAttempts.count >= MAX_FAILED_ATTEMPTS) return true;

  // Check by username
  const userAttempts = db
    .prepare(
      'SELECT COUNT(*) as count FROM login_attempts WHERE username = ? AND success = 0 AND created_at > ?'
    )
    .get(username, cutoff) as { count: number };

  if (userAttempts.count >= MAX_FAILED_ATTEMPTS) return true;

  return false;
}

function recordLoginAttempt(ip: string, username: string, success: boolean): void {
  db.prepare(
    'INSERT INTO login_attempts (ip_address, username, success) VALUES (?, ?, ?)'
  ).run(ip, username, success ? 1 : 0);

  // Clean up old login attempts (older than 24 hours)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  db.prepare('DELETE FROM login_attempts WHERE created_at < ?').run(dayAgo);
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
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);

    // Check rate limiting
    if (isRateLimited(ip, username)) {
      serverLog({ level: 'warn', category: 'auth', message: `Rate limited login attempt for "${username}"`, request });
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const user = db
      .prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?')
      .get(username) as AdminUser | undefined;

    if (!user) {
      recordLoginAttempt(ip, username, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatch) {
      recordLoginAttempt(ip, username, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Record successful login and clear failed attempts for this IP/user
    recordLoginAttempt(ip, username, true);
    serverLog({ level: 'info', category: 'auth', message: `Successful login for "${username}"`, request });

    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch {
    serverLog({ level: 'error', category: 'auth', message: 'Login endpoint error', request });
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
