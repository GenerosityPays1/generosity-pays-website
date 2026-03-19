import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);

    const status = url.searchParams.get('status') || 'all';
    const type = url.searchParams.get('type') || 'all';
    const search = url.searchParams.get('search') || '';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (type && type !== 'all') {
      conditions.push('lead_type = ?');
      params.push(type);
    }

    if (search) {
      conditions.push('(name LIKE ? OR business_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM leads ${whereClause}`)
      .get(...params.length ? [params] : []) as { total: number } | undefined;

    // Need to handle the params spread for better-sqlite3
    const total = (() => {
      const stmt = db.prepare(`SELECT COUNT(*) as total FROM leads ${whereClause}`);
      const row = (params.length > 0 ? stmt.get(...params) : stmt.get()) as { total: number };
      return row.total;
    })();

    const totalPages = Math.ceil(total / limit);

    const leads = (() => {
      const stmt = db.prepare(
        `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
      );
      const allParams = [...params, limit, offset];
      return stmt.all(...allParams);
    })();

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching leads:');
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
