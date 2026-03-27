import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { getClientIp } from '@/lib/api-helpers';
import { notifyNewVolunteer } from '@/lib/email';
import { serverLog } from '@/lib/server-logger';

interface VolunteerBody {
  name: string;
  email: string;
  phone?: string;
  availability?: string;
  experience?: string;
  notes?: string;
  page_source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VolunteerBody = await request.json();
    const { name, email, phone, availability, experience, notes, page_source } = body;

    const ip_address = getClientIp(request);

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Input length limits
    if (name.length > 200 || email.length > 254) {
      return NextResponse.json(
        { error: 'Input exceeds maximum length' },
        { status: 400 }
      );
    }
    if (phone && phone.length > 30) {
      return NextResponse.json(
        { error: 'Phone number exceeds maximum length' },
        { status: 400 }
      );
    }
    if (availability && availability.length > 500) {
      return NextResponse.json(
        { error: 'Availability exceeds maximum length' },
        { status: 400 }
      );
    }
    if (experience && experience.length > 1000) {
      return NextResponse.json(
        { error: 'Experience exceeds maximum length' },
        { status: 400 }
      );
    }
    if (notes && notes.length > 2000) {
      return NextResponse.json(
        { error: 'Notes exceed maximum length' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(
      'INSERT INTO volunteers (name, email, phone, availability, experience, notes, ip_address, page_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      name.trim(),
      email.trim().toLowerCase(),
      phone?.trim() || null,
      availability?.trim() || null,
      experience?.trim() || null,
      notes?.trim() || null,
      ip_address,
      page_source || null
    );

    createNotification('new_contact', 'New Volunteer', `${name} signed up to volunteer at Relay For Life`, 'volunteer', result.lastInsertRowid as number);
    notifyNewVolunteer(name, email);

    return NextResponse.json(
      { success: true, id: result.lastInsertRowid },
      { status: 201 }
    );
  } catch {
    serverLog({ level: 'error', category: 'form_submission', message: 'Volunteer submission error', request });
    return NextResponse.json(
      { error: 'Failed to submit volunteer sign-up' },
      { status: 500 }
    );
  }
}
