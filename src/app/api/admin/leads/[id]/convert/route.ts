import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';
import { createNotification, logActivity } from '@/lib/notifications';

interface LeadRow {
  id: number;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  monthly_volume: string | null;
  merchant_id: number | null;
  status: string;
}

export async function POST(
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

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as LeadRow | undefined;

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.merchant_id) {
      return NextResponse.json(
        { error: 'Lead has already been converted to a merchant' },
        { status: 400 }
      );
    }

    // Create merchant record from lead data
    const merchantResult = db.prepare(`
      INSERT INTO merchants (lead_id, business_name, contact_name, email, phone, monthly_volume)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      leadId,
      lead.business_name || lead.name,
      lead.name,
      lead.email,
      lead.phone || null,
      lead.monthly_volume || null
    );

    const merchantId = Number(merchantResult.lastInsertRowid);

    // Update lead with merchant_id and set status to qualified
    db.prepare(
      "UPDATE leads SET merchant_id = ?, status = 'qualified', updated_at = datetime('now') WHERE id = ?"
    ).run(merchantId, leadId);

    createNotification(
      'stage_change',
      'Lead Converted',
      `Lead "${lead.name}" has been converted to a merchant`,
      'merchant',
      merchantId
    );

    logActivity(
      'convert',
      'lead',
      leadId,
      `Converted lead to merchant (merchant_id: ${merchantId})`,
      auth.userId
    );

    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchantId);

    return NextResponse.json({ success: true, merchant }, { status: 201 });
  } catch (error) {
    console.error('Error converting lead:');
    return NextResponse.json(
      { error: 'Failed to convert lead to merchant' },
      { status: 500 }
    );
  }
}
