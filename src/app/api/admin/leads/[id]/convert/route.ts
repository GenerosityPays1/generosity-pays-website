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

    const leadResult = await db.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: [leadId],
    });
    const lead = leadResult.rows[0] as unknown as LeadRow | undefined;

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.merchant_id) {
      return NextResponse.json(
        { error: 'Lead has already been converted to a merchant' },
        { status: 400 }
      );
    }

    const merchantResult = await db.execute({
      sql: `INSERT INTO merchants (lead_id, business_name, contact_name, email, phone, monthly_volume)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        leadId,
        lead.business_name ?? lead.name,
        lead.name,
        lead.email,
        lead.phone ?? null,
        lead.monthly_volume ?? null,
      ],
    });

    const merchantId = Number(merchantResult.lastInsertRowid);

    await db.execute({
      sql: "UPDATE leads SET merchant_id = ?, status = 'qualified', updated_at = datetime('now') WHERE id = ?",
      args: [merchantId, leadId],
    });

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

    const merchantFetchResult = await db.execute({
      sql: 'SELECT * FROM merchants WHERE id = ?',
      args: [merchantId],
    });

    return NextResponse.json(
      { success: true, merchant: merchantFetchResult.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error converting lead:', error);
    return NextResponse.json({ error: 'Failed to convert lead to merchant' }, { status: 500 });
  }
}
