import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ['new', 'contacted', 'qualified', 'closed_won', 'closed_lost'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await db.execute({
    sql: 'UPDATE calculator_leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [status, parseInt(id)],
  });

  return NextResponse.json({ success: true });
}
