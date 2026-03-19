import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
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
    const leadId = parseInt(id, 10);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error fetching lead:');
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
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
    const leadId = parseInt(id, 10);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as Record<string, unknown> | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, notes, estimated_savings, contacted } = body;

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (estimated_savings !== undefined) {
      updates.push('estimated_savings = ?');
      values.push(estimated_savings);
    }

    if (contacted !== undefined) {
      updates.push('contacted = ?');
      values.push(contacted ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(leadId);

    db.prepare(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`
    ).run(...values);

    if (status !== undefined && status !== existing.status) {
      logActivity(
        'status_change',
        'lead',
        leadId,
        `Status changed from "${existing.status}" to "${status}"`,
        auth.userId
      );
    }

    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error('Error updating lead:');
    return NextResponse.json(
      { error: 'Failed to update lead' },
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
    const leadId = parseInt(id, 10);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as Record<string, unknown> | undefined;

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Remove statement file from disk if exists
    if (lead.statement_path && typeof lead.statement_path === 'string') {
      try {
        if (fs.existsSync(lead.statement_path)) {
          fs.unlinkSync(lead.statement_path);
        }
      } catch {
        console.error('Failed to delete statement file:', lead.statement_path);
      }
    }

    db.prepare('DELETE FROM leads WHERE id = ?').run(leadId);

    logActivity('delete', 'lead', leadId, `Deleted lead: ${lead.name}`, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:');
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
