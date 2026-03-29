import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';
import { createNotification, logActivity } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);

    const stage = url.searchParams.get('stage') || 'all';
    const search = url.searchParams.get('search') || '';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (stage && stage !== 'all') {
      conditions.push('pipeline_stage = ?');
      params.push(stage);
    }

    if (search) {
      conditions.push('(business_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM merchants ${whereClause}`,
      args: params,
    });
    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const merchantsResult = await db.execute({
      sql: `SELECT * FROM merchants ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...params, limit, offset],
    });

    return NextResponse.json({ merchants: merchantsResult.rows, total, page, totalPages });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const {
      business_name, contact_name, email, phone, address, monthly_volume,
      current_processor, current_rate, our_rate, estimated_savings, notes,
    } = body;

    if (!business_name || !contact_name || !email) {
      return NextResponse.json(
        { error: 'business_name, contact_name, and email are required' },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO merchants (business_name, contact_name, email, phone, address, monthly_volume, current_processor, current_rate, our_rate, estimated_savings, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        business_name, contact_name, email,
        phone ?? null, address ?? null, monthly_volume ?? null,
        current_processor ?? null, current_rate ?? null,
        our_rate ?? null, estimated_savings ?? null, notes ?? null,
      ],
    });

    const merchantId = Number(result.lastInsertRowid);

    logActivity('create', 'merchant', merchantId, `Created merchant: ${business_name}`, auth.userId);
    createNotification('stage_change', 'New Merchant', `New merchant added: ${business_name}`, 'merchant', merchantId);

    const merchantResult = await db.execute({
      sql: 'SELECT * FROM merchants WHERE id = ?',
      args: [merchantId],
    });

    return NextResponse.json({ success: true, merchant: merchantResult.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating merchant:', error);
    return NextResponse.json({ error: 'Failed to create merchant' }, { status: 500 });
  }
}
