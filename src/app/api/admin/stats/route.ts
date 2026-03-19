import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    // Total leads
    const totalLeadsRow = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    const totalLeads = totalLeadsRow.count;

    // New leads this week
    const newLeadsThisWeekRow = db.prepare(
      "SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-7 days')"
    ).get() as { count: number };
    const newLeadsThisWeek = newLeadsThisWeekRow.count;

    // Total merchants
    const totalMerchantsRow = db.prepare('SELECT COUNT(*) as count FROM merchants').get() as { count: number };
    const totalMerchants = totalMerchantsRow.count;

    // Active merchants
    const activeMerchantsRow = db.prepare(
      "SELECT COUNT(*) as count FROM merchants WHERE pipeline_stage = 'active_merchant'"
    ).get() as { count: number };
    const activeMerchants = activeMerchantsRow.count;

    // Upcoming appointments
    const upcomingAppointmentsRow = db.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= datetime('now') AND status = 'scheduled'"
    ).get() as { count: number };
    const upcomingAppointments = upcomingAppointmentsRow.count;

    // Leads per week (last 12 weeks)
    const leadsPerWeek = db.prepare(`
      SELECT strftime('%Y-W%W', created_at) as week, COUNT(*) as count
      FROM leads
      WHERE created_at >= datetime('now', '-84 days')
      GROUP BY week
      ORDER BY week ASC
    `).all() as { week: string; count: number }[];

    // Leads by status
    const leadsByStatus = db.prepare(`
      SELECT COALESCE(status, 'new') as status, COUNT(*) as count
      FROM leads
      GROUP BY status
      ORDER BY count DESC
    `).all() as { status: string; count: number }[];

    // Pipeline by stage
    const pipelineByStage = db.prepare(`
      SELECT pipeline_stage as stage, COUNT(*) as count
      FROM merchants
      GROUP BY pipeline_stage
      ORDER BY count DESC
    `).all() as { stage: string; count: number }[];

    // Recent leads (last 5)
    const recentLeads = db.prepare(
      'SELECT * FROM leads ORDER BY created_at DESC LIMIT 5'
    ).all();

    // Recent activity (last 10)
    const recentActivity = db.prepare(
      'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10'
    ).all();

    return NextResponse.json({
      totalLeads,
      newLeadsThisWeek,
      totalMerchants,
      activeMerchants,
      upcomingAppointments,
      leadsPerWeek,
      leadsByStatus,
      pipelineByStage,
      recentLeads,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching stats:');
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
