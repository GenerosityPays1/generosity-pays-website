import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    const whereClause = unreadOnly ? 'WHERE read = 0' : '';

    const countResult = await db.execute(`SELECT COUNT(*) as total FROM contacts ${whereClause}`);
    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const contactsResult = await db.execute({
      sql: `SELECT * FROM contacts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });

    return NextResponse.json({
      contacts: contactsResult.rows,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
