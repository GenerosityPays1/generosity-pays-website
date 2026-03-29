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
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM appointments WHERE id = ?',
      args: [appointmentId],
    });

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment: result.rows[0] });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
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
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const existingResult = await db.execute({
      sql: 'SELECT * FROM appointments WHERE id = ?',
      args: [appointmentId],
    });

    if (!existingResult.rows[0]) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'merchant_id', 'lead_id',
      'appointment_date', 'duration_minutes', 'location', 'status', 'notes',
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
    values.push(appointmentId);

    await db.execute({
      sql: `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
      args: values,
    });

    logActivity('update', 'appointment', appointmentId, `Updated appointment fields: ${Object.keys(body).join(', ')}`, auth.userId);

    const updatedResult = await db.execute({
      sql: 'SELECT * FROM appointments WHERE id = ?',
      args: [appointmentId],
    });

    return NextResponse.json({ success: true, appointment: updatedResult.rows[0] });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
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
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const appointmentResult = await db.execute({
      sql: 'SELECT * FROM appointments WHERE id = ?',
      args: [appointmentId],
    });
    const appointment = appointmentResult.rows[0] as Record<string, unknown> | undefined;

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    await db.execute({ sql: 'DELETE FROM appointments WHERE id = ?', args: [appointmentId] });

    logActivity('delete', 'appointment', appointmentId, `Deleted appointment: ${appointment.title}`, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
