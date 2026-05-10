import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { isValidEmail } from '@/lib/file-validation';
import { getClientIp } from '@/lib/api-helpers';
import { notifyNewLead } from '@/lib/email';
import { serverLog } from '@/lib/server-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      business_name,
      contact_name,
      email,
      phone,
      notes,
      monthly_volume,
      avg_transaction,
      current_rate,
      monthly_transactions,
      current_monthly_fees,
      estimated_monthly_savings,
      estimated_annual_savings,
      charity_impact,
    } = body;

    if (!contact_name || !email || !business_name) {
      return NextResponse.json(
        { error: 'Business name, contact name, and email are required' },
        { status: 400 }
      );
    }

    if (contact_name.length > 200 || business_name.length > 200) {
      return NextResponse.json(
        { error: 'Name fields must be under 200 characters' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (
      typeof monthly_volume !== 'number' ||
      typeof avg_transaction !== 'number' ||
      typeof current_rate !== 'number' ||
      typeof monthly_transactions !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Calculator fields must be valid numbers' },
        { status: 400 }
      );
    }

    const ip_address = getClientIp(request);

    const result = await db.execute({
      sql: `INSERT INTO calculator_leads (
        business_name, contact_name, email, phone, notes,
        monthly_volume, avg_transaction, current_rate, monthly_transactions,
        current_monthly_fees, estimated_monthly_savings, estimated_annual_savings,
        charity_impact, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        business_name.trim(),
        contact_name.trim(),
        email.trim().toLowerCase(),
        phone?.trim() ?? null,
        notes?.trim() ?? null,
        monthly_volume,
        avg_transaction,
        current_rate,
        monthly_transactions,
        current_monthly_fees,
        estimated_monthly_savings,
        estimated_annual_savings,
        charity_impact ?? 0,
        ip_address,
      ],
    });

    const newId = Number(result.lastInsertRowid);
    createNotification(
      'new_lead',
      'New Calculator Lead',
      `${business_name} — $${estimated_monthly_savings.toFixed(0)}/mo potential savings`,
      'lead',
      newId
    );
    notifyNewLead(contact_name, 'calculator', email);

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch {
    serverLog({
      level: 'error',
      category: 'form_submission',
      message: 'Calculator lead submission error',
      request,
    });
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    );
  }
}
