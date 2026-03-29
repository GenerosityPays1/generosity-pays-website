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
    const params: (string | number)[] = [];

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM volunteers ${whereClause}`,
      args: params,
    });
    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const volunteersResult = await db.execute({
      sql: `SELECT * FROM volunteers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...params, limit, offset],
    });

    return NextResponse.json({ volunteers: volunteersResult.rows, total, page, totalPages });
  } catch {
    console.error('Error fetching volunteers:');
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}
