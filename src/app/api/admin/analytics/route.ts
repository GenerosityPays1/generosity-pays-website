import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const [
      leadsPerMonthResult,
      merchantsPerMonthResult,
      pipelineFunnelResult,
      leadSourceBreakdownResult,
    ] = await Promise.all([
      db.execute(`
        SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
        FROM leads GROUP BY month ORDER BY month DESC LIMIT 12
      `),
      db.execute(`
        SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
        FROM merchants GROUP BY month ORDER BY month DESC LIMIT 12
      `),
      db.execute(`
        SELECT pipeline_stage as stage, COUNT(*) as count
        FROM merchants GROUP BY pipeline_stage
      `),
      db.execute(`
        SELECT lead_type as type, COUNT(*) as count
        FROM leads GROUP BY lead_type
      `),
    ]);

    return NextResponse.json({
      leadsPerMonth: leadsPerMonthResult.rows,
      merchantsPerMonth: merchantsPerMonthResult.rows,
      pipelineFunnel: pipelineFunnelResult.rows,
      leadSourceBreakdown: leadSourceBreakdownResult.rows,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
