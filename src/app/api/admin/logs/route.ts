import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';

interface LogRow {
  id: number;
  level: string;
  category: string;
  message: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  request_path: string | null;
  created_at: string;
}

interface LoginAttemptRow {
  id: number;
  ip_address: string;
  username: string;
  success: number;
  created_at: string;
}

interface ActivityRow {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  admin_user_id: number | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const logType = url.searchParams.get('log_type') || 'server'; // server | login | activity
  const level = url.searchParams.get('level');
  const category = url.searchParams.get('category');
  const dateFrom = url.searchParams.get('date_from');
  const dateTo = url.searchParams.get('date_to');

  try {
    if (logType === 'login') {
      const conditions: string[] = [];
      const params: (string | number)[] = [];

      if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom); }
      if (dateTo) { conditions.push('created_at <= ?'); params.push(dateTo + ' 23:59:59'); }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const total = (db.prepare(`SELECT COUNT(*) as count FROM login_attempts ${where}`).get(...params) as { count: number }).count;
      const rows = db.prepare(`SELECT * FROM login_attempts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as LoginAttemptRow[];

      return NextResponse.json({
        logs: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    if (logType === 'activity') {
      const conditions: string[] = [];
      const params: (string | number)[] = [];

      if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom); }
      if (dateTo) { conditions.push('created_at <= ?'); params.push(dateTo + ' 23:59:59'); }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const total = (db.prepare(`SELECT COUNT(*) as count FROM activity_log ${where}`).get(...params) as { count: number }).count;
      const rows = db.prepare(`SELECT * FROM activity_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as ActivityRow[];

      return NextResponse.json({
        logs: rows,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Default: server logs
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (level) { conditions.push('level = ?'); params.push(level); }
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom); }
    if (dateTo) { conditions.push('created_at <= ?'); params.push(dateTo + ' 23:59:59'); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = (db.prepare(`SELECT COUNT(*) as count FROM server_logs ${where}`).get(...params) as { count: number }).count;
    const rows = db.prepare(`SELECT * FROM server_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset) as LogRow[];

    return NextResponse.json({
      logs: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
