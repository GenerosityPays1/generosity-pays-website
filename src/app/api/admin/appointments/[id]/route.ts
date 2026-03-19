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

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:');
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
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
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

    if (!existing) {
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

    db.prepare(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`
    ).run(...values);

    logActivity('update', 'appointment', appointmentId, `Updated appointment fields: ${Object.keys(body).join(', ')}`, auth.userId);

    const updatedAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:');
    return NextResponse.json(
      { error: 'Failed to update appointment' },
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
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId) as Record<string, unknown> | undefined;

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM appointments WHERE id = ?').run(appointmentId);

    logActivity('delete', 'appointment', appointmentId, `Deleted appointment: ${appointment.title}`, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:');
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
