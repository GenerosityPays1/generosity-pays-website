import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread_only') === 'true';
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));

    const whereClause = unreadOnly ? 'WHERE read = 0' : '';

    const result = await db.execute({
      sql: `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ?`,
      args: [limit],
    });

    return NextResponse.json({ notifications: result.rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { ids } = body as { ids: number[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
    }

    if (ids.length > 200 || !ids.every((id) => Number.isInteger(id) && id > 0)) {
      return NextResponse.json(
        { error: 'Invalid ids — must be an array of positive integers (max 200)' },
        { status: 400 }
      );
    }

    await db.batch(
      ids.map((id) => ({
        sql: 'UPDATE notifications SET read = 1 WHERE id = ?',
        args: [id] as [number],
      })),
      'write'
    );

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
