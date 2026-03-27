import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const search = url.searchParams.get('search') || '';

    const conditions: string[] = [];
    const params: string[] = [];

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRow = db.prepare(
      `SELECT COUNT(*) as total FROM volunteers ${whereClause}`
    ).get(...params) as { total: number };
    const total = totalRow.total;
    const totalPages = Math.ceil(total / limit);

    const volunteers = db.prepare(
      `SELECT * FROM volunteers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    return NextResponse.json({
      volunteers,
      total,
      page,
      totalPages,
    });
  } catch {
    console.error('Error fetching volunteers:');
    return NextResponse.json(
      { error: 'Failed to fetch volunteers' },
      { status: 500 }
    );
  }
}
