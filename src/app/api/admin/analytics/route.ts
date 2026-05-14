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
      // Latest 12 months, returned in chronological order (oldest → newest)
      db.execute(`
        SELECT month, count FROM (
          SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
          FROM leads GROUP BY month ORDER BY month DESC LIMIT 12
        ) ORDER BY month ASC
      `),
      db.execute(`
        SELECT month, count FROM (
          SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
          FROM merchants GROUP BY month ORDER BY month DESC LIMIT 12
        ) ORDER BY month ASC
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

    // Transform rows to { label, value } shape expected by <BarChart>
    const leadsPerMonth = leadsPerMonthResult.rows.map((r) => ({
      label: String(r.month ?? ''),
      value: Number(r.count ?? 0),
    }));
    const merchantsPerMonth = merchantsPerMonthResult.rows.map((r) => ({
      label: String(r.month ?? ''),
      value: Number(r.count ?? 0),
    }));
    const pipelineFunnel = pipelineFunnelResult.rows.map((r) => ({
      label: String(r.stage ?? 'Unknown'),
      value: Number(r.count ?? 0),
    }));

    // Roll the breakdown rows into the object shape the page consumes
    let feeAnalysis = 0;
    let consultation = 0;
    for (const row of leadSourceBreakdownResult.rows) {
      const type = String(row.type ?? '');
      const count = Number(row.count ?? 0);
      if (type === 'fee_analysis') feeAnalysis = count;
      else if (type === 'consultation') consultation = count;
    }
    const leadSourceBreakdown = {
      fee_analysis: feeAnalysis,
      consultation,
      total: feeAnalysis + consultation,
    };

    return NextResponse.json({
      leadsPerMonth,
      merchantsPerMonth,
      pipelineFunnel,
      leadSourceBreakdown,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
