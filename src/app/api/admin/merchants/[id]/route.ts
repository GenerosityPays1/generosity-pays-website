import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';
import { logActivity } from '@/lib/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const merchantId = parseInt(id, 10);

    if (isNaN(merchantId)) {
      return NextResponse.json({ error: 'Invalid merchant ID' }, { status: 400 });
    }

    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchantId);

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json({ merchant });
  } catch (error) {
    console.error('Error fetching merchant:');
    return NextResponse.json(
      { error: 'Failed to fetch merchant' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const merchantId = parseInt(id, 10);

    if (isNaN(merchantId)) {
      return NextResponse.json({ error: 'Invalid merchant ID' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchantId);

    if (!existing) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = [
      'business_name', 'contact_name', 'email', 'phone', 'address',
      'monthly_volume', 'current_processor', 'current_rate', 'our_rate',
      'estimated_savings', 'pipeline_stage', 'notes',
    ];

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(merchantId);

    db.prepare(
      `UPDATE merchants SET ${updates.join(', ')} WHERE id = ?`
    ).run(...values);

    logActivity('update', 'merchant', merchantId, `Updated merchant fields: ${Object.keys(body).join(', ')}`, auth.userId);

    const updatedMerchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchantId);

    return NextResponse.json({ success: true, merchant: updatedMerchant });
  } catch (error) {
    console.error('Error updating merchant:');
    return NextResponse.json(
      { error: 'Failed to update merchant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const merchantId = parseInt(id, 10);

    if (isNaN(merchantId)) {
      return NextResponse.json({ error: 'Invalid merchant ID' }, { status: 400 });
    }

    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchantId) as Record<string, unknown> | undefined;

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM merchants WHERE id = ?').run(merchantId);

    logActivity('delete', 'merchant', merchantId, `Deleted merchant: ${merchant.business_name}`, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting merchant:');
    return NextResponse.json(
      { error: 'Failed to delete merchant' },
      { status: 500 }
    );
  }
}
