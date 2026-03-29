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

    const result = await db.execute({
      sql: 'SELECT * FROM merchants WHERE id = ?',
      args: [merchantId],
    });

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json({ merchant: result.rows[0] });
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return NextResponse.json({ error: 'Failed to fetch merchant' }, { status: 500 });
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

    const existingResult = await db.execute({
      sql: 'SELECT * FROM merchants WHERE id = ?',
      args: [merchantId],
    });

    if (!existingResult.rows[0]) {
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

    await db.execute({
      sql: `UPDATE merchants SET ${updates.join(', ')} WHERE id = ?`,
      args: values,
    });

    logActivity('update', 'merchant', merchantId, `Updated merchant fields: ${Object.keys(body).join(', ')}`, auth.userId);

    const updatedResult = await db.execute({
      sql: 'SELECT * FROM merchants WHERE id = ?',
      args: [merchantId],
    });

    return NextResponse.json({ success: true, merchant: updatedResult.rows[0] });
  } catch (error) {
    console.error('Error updating merchant:', error);
    return NextResponse.json({ error: 'Failed to update merchant' }, { status: 500 });
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

    const merchantResult = await db.execute({
      sql: 'SELECT * FROM merchants WHERE id = ?',
      args: [merchantId],
    });
    const merchant = merchantResult.rows[0] as Record<string, unknown> | undefined;

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    await db.execute({ sql: 'DELETE FROM merchants WHERE id = ?', args: [merchantId] });

    logActivity('delete', 'merchant', merchantId, `Deleted merchant: ${merchant.business_name}`, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    return NextResponse.json({ error: 'Failed to delete merchant' }, { status: 500 });
  }
}
