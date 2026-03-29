import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';

    if (q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchPattern = `%${q}%`;

    const [leadsResult, merchantsResult, contactsResult] = await Promise.all([
      db.execute({
        sql: `SELECT id, name, business_name, email, phone, lead_type, status, created_at
              FROM leads
              WHERE name LIKE ? OR business_name LIKE ? OR email LIKE ? OR phone LIKE ?
              LIMIT 5`,
        args: [searchPattern, searchPattern, searchPattern, searchPattern],
      }),
      db.execute({
        sql: `SELECT id, business_name, contact_name, email, phone, pipeline_stage, created_at
              FROM merchants
              WHERE business_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR phone LIKE ?
              LIMIT 5`,
        args: [searchPattern, searchPattern, searchPattern, searchPattern],
      }),
      db.execute({
        sql: `SELECT id, name, email, message, read, created_at
              FROM contacts
              WHERE name LIKE ? OR email LIKE ?
              LIMIT 5`,
        args: [searchPattern, searchPattern],
      }),
    ]);

    return NextResponse.json({
      leads: leadsResult.rows,
      merchants: merchantsResult.rows,
      contacts: contactsResult.rows,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
