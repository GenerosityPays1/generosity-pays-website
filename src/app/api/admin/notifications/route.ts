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

    const notifications = db.prepare(
      `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ?`
    ).all(limit);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:');
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { ids } = body as { ids: number[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      );
    }

    // Validate all IDs are positive integers and limit batch size
    if (ids.length > 200 || !ids.every((id) => Number.isInteger(id) && id > 0)) {
      return NextResponse.json(
        { error: 'Invalid ids — must be an array of positive integers (max 200)' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('UPDATE notifications SET read = 1 WHERE id = ?');
    for (const id of ids) {
      stmt.run(id);
    }

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error('Error marking notifications as read:');
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
