import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const leadsPerMonth = db.prepare(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
       FROM leads
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    ).all();

    const merchantsPerMonth = db.prepare(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
       FROM merchants
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`
    ).all();

    const pipelineFunnel = db.prepare(
      `SELECT pipeline_stage as stage, COUNT(*) as count
       FROM merchants
       GROUP BY pipeline_stage`
    ).all();

    const leadSourceBreakdown = db.prepare(
      `SELECT lead_type as type, COUNT(*) as count
       FROM leads
       GROUP BY lead_type`
    ).all();

    return NextResponse.json({
      leadsPerMonth,
      merchantsPerMonth,
      pipelineFunnel,
      leadSourceBreakdown,
    });
  } catch (error) {
    console.error('Error fetching analytics:');
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
