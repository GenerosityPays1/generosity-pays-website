import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import db from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { validateFileUpload, isValidEmail } from '@/lib/file-validation';
import { getClientIp } from '@/lib/api-helpers';
import { notifyNewLead } from '@/lib/email';
import { serverLog } from '@/lib/server-logger';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const business_name = formData.get('business_name') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const monthly_volume = formData.get('monthly_volume') as string | null;
    const lead_type = formData.get('lead_type') as string | null;
    const page_source = formData.get('page_source') as string | null;
    const file = formData.get('statement') as File | null;

    // Capture client IP
    const ip_address = getClientIp(request);

    // Validate required fields
    if (!name || !email || !lead_type) {
      return NextResponse.json(
        { error: 'Name, email, and lead_type are required' },
        { status: 400 }
      );
    }

    // Input length limits
    if (name.length > 200 || (business_name && business_name.length > 200)) {
      return NextResponse.json(
        { error: 'Name fields must be under 200 characters' },
        { status: 400 }
      );
    }

    if ((phone && phone.length > 30) || (monthly_volume && monthly_volume.length > 50)) {
      return NextResponse.json(
        { error: 'Invalid input length' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (lead_type !== 'fee_analysis' && lead_type !== 'consultation') {
      return NextResponse.json(
        { error: 'lead_type must be either "fee_analysis" or "consultation"' },
        { status: 400 }
      );
    }

    let statementFilename: string | null = null;
    let statementPath: string | null = null;

    // Handle file upload if present
    if (file && file.size > 0) {
      // Validate file type and size
      const validation = validateFileUpload(file, 'statement');
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = path.extname(file.name).toLowerCase();
      const uniqueFilename = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      statementFilename = file.name;
      statementPath = filePath;
    }

    const stmt = db.prepare(`
      INSERT INTO leads (name, business_name, email, phone, monthly_volume, lead_type, statement_filename, statement_path, ip_address, page_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      business_name?.trim() || null,
      email.trim().toLowerCase(),
      phone?.trim() || null,
      monthly_volume || null,
      lead_type,
      statementFilename,
      statementPath,
      ip_address,
      page_source || null
    );

    createNotification('new_lead', 'New Lead', `New ${lead_type} request from ${name}`, 'lead', result.lastInsertRowid as number);
    notifyNewLead(name, lead_type, email);

    return NextResponse.json(
      { success: true, id: result.lastInsertRowid },
      { status: 201 }
    );
  } catch {
    serverLog({ level: 'error', category: 'form_submission', message: 'Lead submission error', request });
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}
