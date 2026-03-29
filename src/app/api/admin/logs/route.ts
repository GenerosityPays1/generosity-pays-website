import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const logType = url.searchParams.get('log_type') || 'server';
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

      const [countResult, rowsResult] = await Promise.all([
        db.execute({ sql: `SELECT COUNT(*) as count FROM login_attempts ${where}`, args: params }),
        db.execute({ sql: `SELECT * FROM login_attempts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, args: [...params, limit, offset] }),
      ]);

      return NextResponse.json({
        logs: rowsResult.rows,
        total: Number(countResult.rows[0]?.count ?? 0),
        page,
        totalPages: Math.ceil(Number(countResult.rows[0]?.count ?? 0) / limit),
      });
    }

    if (logType === 'activity') {
      const conditions: string[] = [];
      const params: (string | number)[] = [];

      if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom); }
      if (dateTo) { conditions.push('created_at <= ?'); params.push(dateTo + ' 23:59:59'); }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const [countResult, rowsResult] = await Promise.all([
        db.execute({ sql: `SELECT COUNT(*) as count FROM activity_log ${where}`, args: params }),
        db.execute({ sql: `SELECT * FROM activity_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, args: [...params, limit, offset] }),
      ]);

      return NextResponse.json({
        logs: rowsResult.rows,
        total: Number(countResult.rows[0]?.count ?? 0),
        page,
        totalPages: Math.ceil(Number(countResult.rows[0]?.count ?? 0) / limit),
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

    const [countResult, rowsResult] = await Promise.all([
      db.execute({ sql: `SELECT COUNT(*) as count FROM server_logs ${where}`, args: params }),
      db.execute({ sql: `SELECT * FROM server_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, args: [...params, limit, offset] }),
    ]);

    return NextResponse.json({
      logs: rowsResult.rows,
      total: Number(countResult.rows[0]?.count ?? 0),
      page,
      totalPages: Math.ceil(Number(countResult.rows[0]?.count ?? 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
