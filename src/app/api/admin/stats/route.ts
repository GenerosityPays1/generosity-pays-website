import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const [
      totalLeadsResult,
      newLeadsThisWeekResult,
      totalMerchantsResult,
      activeMerchantsResult,
      upcomingAppointmentsResult,
      leadsPerWeekResult,
      leadsByStatusResult,
      pipelineByStageResult,
      recentLeadsResult,
      recentActivityResult,
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM leads'),
      db.execute("SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-7 days')"),
      db.execute('SELECT COUNT(*) as count FROM merchants'),
      db.execute("SELECT COUNT(*) as count FROM merchants WHERE pipeline_stage = 'active_merchant'"),
      db.execute("SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= datetime('now') AND status = 'scheduled'"),
      db.execute(`
        SELECT strftime('%Y-W%W', created_at) as week, COUNT(*) as count
        FROM leads
        WHERE created_at >= datetime('now', '-84 days')
        GROUP BY week
        ORDER BY week ASC
      `),
      db.execute(`
        SELECT COALESCE(status, 'new') as status, COUNT(*) as count
        FROM leads
        GROUP BY status
        ORDER BY count DESC
      `),
      db.execute(`
        SELECT pipeline_stage as stage, COUNT(*) as count
        FROM merchants
        GROUP BY pipeline_stage
        ORDER BY count DESC
      `),
      db.execute('SELECT * FROM leads ORDER BY created_at DESC LIMIT 5'),
      db.execute('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10'),
    ]);

    return NextResponse.json({
      totalLeads: Number(totalLeadsResult.rows[0]?.count ?? 0),
      newLeadsThisWeek: Number(newLeadsThisWeekResult.rows[0]?.count ?? 0),
      totalMerchants: Number(totalMerchantsResult.rows[0]?.count ?? 0),
      activeMerchants: Number(activeMerchantsResult.rows[0]?.count ?? 0),
      upcomingAppointments: Number(upcomingAppointmentsResult.rows[0]?.count ?? 0),
      leadsPerWeek: leadsPerWeekResult.rows,
      leadsByStatus: leadsByStatusResult.rows,
      pipelineByStage: pipelineByStageResult.rows,
      recentLeads: recentLeadsResult.rows,
      recentActivity: recentActivityResult.rows,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
