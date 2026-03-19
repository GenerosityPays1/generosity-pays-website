import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';
import { createNotification, logActivity } from '@/lib/notifications';

const VALID_STAGES = [
  'new_lead',
  'contacted',
  'fee_analysis_sent',
  'negotiation',
  'application_submitted',
  'approved',
  'installed',
  'active_merchant',
];

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

    const body = await request.json();
    const { stage } = body;

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      );
    }

    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchantId) as Record<string, unknown> | undefined;

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const oldStage = merchant.pipeline_stage as string;

    db.prepare(
      "UPDATE merchants SET pipeline_stage = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(stage, merchantId);

    logActivity(
      'stage_change',
      'merchant',
      merchantId,
      `Stage: ${oldStage} → ${stage}`,
      auth.userId
    );

    if (stage === 'approved' || stage === 'active_merchant') {
      createNotification(
        'stage_change',
        'Merchant Stage Update',
        `${merchant.business_name} is now ${stage.replace(/_/g, ' ')}`,
        'merchant',
        merchantId
      );
    }

    const updatedMerchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchantId);

    return NextResponse.json({ success: true, merchant: updatedMerchant });
  } catch (error) {
    console.error('Error updating merchant stage:');
    return NextResponse.json(
      { error: 'Failed to update merchant stage' },
      { status: 500 }
    );
  }
}
