import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const contactId = parseInt(id, 10);

    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: (number | null)[] = [];

    if (body.read !== undefined) {
      updates.push('read = ?');
      values.push(body.read ? 1 : 0);
    }

    if (body.replied !== undefined) {
      updates.push('replied = ?');
      values.push(body.replied ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(contactId);

    db.prepare(
      `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`
    ).run(...values);

    const updatedContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId);

    return NextResponse.json({ success: true, contact: updatedContact });
  } catch (error) {
    console.error('Error updating contact:');
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}
