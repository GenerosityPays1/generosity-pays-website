import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

interface Lead {
  id: number;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  monthly_volume: string | null;
  lead_type: string;
  statement_filename: string | null;
  contacted: number;
  created_at: string;
}

function escapeCsvField(field: string | null | number): string {
  if (field === null || field === undefined) return '';
  let str = String(field);

  // Prevent CSV formula injection — prefix dangerous characters with a single quote
  // This prevents Excel/Sheets from interpreting =, +, -, @, \t, \r as formulas
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes("'")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    try {
      verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const leads = db
      .prepare('SELECT * FROM leads ORDER BY created_at DESC')
      .all() as Lead[];

    const headers = [
      'ID',
      'Name',
      'Business Name',
      'Email',
      'Phone',
      'Monthly Volume',
      'Lead Type',
      'Statement Filename',
      'Contacted',
      'Created At',
    ];

    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const row = [
        escapeCsvField(lead.id),
        escapeCsvField(lead.name),
        escapeCsvField(lead.business_name),
        escapeCsvField(lead.email),
        escapeCsvField(lead.phone),
        escapeCsvField(lead.monthly_volume),
        escapeCsvField(lead.lead_type),
        escapeCsvField(lead.statement_filename),
        escapeCsvField(lead.contacted ? 'Yes' : 'No'),
        escapeCsvField(lead.created_at),
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads-export.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting leads');
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}
