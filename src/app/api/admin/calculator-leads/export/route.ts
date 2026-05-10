import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const result = await db.execute(
    'SELECT * FROM calculator_leads ORDER BY created_at DESC'
  );

  const headers = [
    'ID', 'Business Name', 'Contact Name', 'Email', 'Phone', 'Notes',
    'Monthly Volume', 'Avg Transaction', 'Current Rate', 'Monthly Transactions',
    'Current Monthly Fees', 'Est. Monthly Savings', 'Est. Annual Savings',
    'Charity Impact', 'Status', 'Created At',
  ];

  const csvRows = [headers.join(',')];

  for (const row of result.rows) {
    csvRows.push(
      [
        row.id,
        `"${String(row.business_name ?? '').replace(/"/g, '""')}"`,
        `"${String(row.contact_name ?? '').replace(/"/g, '""')}"`,
        `"${String(row.email ?? '').replace(/"/g, '""')}"`,
        `"${String(row.phone ?? '').replace(/"/g, '""')}"`,
        `"${String(row.notes ?? '').replace(/"/g, '""')}"`,
        row.monthly_volume,
        row.avg_transaction,
        row.current_rate,
        row.monthly_transactions,
        row.current_monthly_fees,
        row.estimated_monthly_savings,
        row.estimated_annual_savings,
        row.charity_impact,
        row.status,
        row.created_at,
      ].join(',')
    );
  }

  return new NextResponse(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="calculator-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
