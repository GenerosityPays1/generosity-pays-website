import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (search) {
    conditions.push('(business_name LIKE ? OR contact_name LIKE ? OR email LIKE ?)');
    const term = `%${search}%`;
    args.push(term, term, term);
  }

  if (status) {
    conditions.push('status = ?');
    args.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as count FROM calculator_leads ${whereClause}`,
    args,
  });
  const total = Number(countResult.rows[0].count);

  const result = await db.execute({
    sql: `SELECT * FROM calculator_leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return NextResponse.json({
    leads: result.rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
