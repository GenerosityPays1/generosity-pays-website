import { NextRequest } from 'next/server';
import db from '@/lib/db';

type LogLevel = 'info' | 'warn' | 'error' | 'critical';

interface LogOptions {
  level: LogLevel;
  category: string;
  message: string;
  details?: string;
  request?: NextRequest;
}

/**
 * Log a server event to the database.
 * Fire-and-forget — never blocks the main operation.
 */
export function serverLog({ level, category, message, details, request }: LogOptions): void {
  try {
    const ip_address = request
      ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1'
      : null;
    const user_agent = request?.headers.get('user-agent') || null;
    const request_path = request ? new URL(request.url).pathname : null;

    db.prepare(
      'INSERT INTO server_logs (level, category, message, details, ip_address, user_agent, request_path) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(level, category, message, details || null, ip_address, user_agent, request_path);
  } catch {
    // Non-critical — don't break the main operation
  }
}
