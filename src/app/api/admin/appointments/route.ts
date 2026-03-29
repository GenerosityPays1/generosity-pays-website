import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const view = url.searchParams.get('view') || 'upcoming';

    let whereClause = '';
    let orderClause = '';

    if (view === 'upcoming') {
      whereClause = "WHERE appointment_date >= datetime('now')";
      orderClause = 'ORDER BY appointment_date ASC';
    } else if (view === 'past') {
      whereClause = "WHERE appointment_date < datetime('now')";
      orderClause = 'ORDER BY appointment_date DESC';
    } else {
      orderClause = 'ORDER BY appointment_date DESC';
    }

    const countResult = await db.execute(
      `SELECT COUNT(*) as total FROM appointments ${whereClause}`
    );
    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const appointmentsResult = await db.execute({
      sql: `SELECT * FROM appointments ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });

    return NextResponse.json({ appointments: appointmentsResult.rows, total, page, totalPages });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const {
      title, description, merchant_id, lead_id,
      appointment_date, duration_minutes, location, notes,
    } = body;

    if (!title || !appointment_date) {
      return NextResponse.json(
        { error: 'title and appointment_date are required' },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO appointments (title, description, merchant_id, lead_id, appointment_date, duration_minutes, location, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        title, description ?? null, merchant_id ?? null, lead_id ?? null,
        appointment_date, duration_minutes ?? 30, location ?? null, notes ?? null,
      ],
    });

    return NextResponse.json(
      { success: true, id: Number(result.lastInsertRowid) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
