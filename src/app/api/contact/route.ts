import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { getClientIp } from '@/lib/api-helpers';
import { notifyNewContact } from '@/lib/email';
import { serverLog } from '@/lib/server-logger';

interface ContactBody {
  name: string;
  email: string;
  message: string;
  page_source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();
    const { name, email, message, page_source } = body;

    const ip_address = getClientIp(request);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    if (name.length > 200 || email.length > 254 || message.length > 5000) {
      return NextResponse.json({ error: 'Input exceeds maximum length' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'INSERT INTO contacts (name, email, message, ip_address, page_source) VALUES (?, ?, ?, ?, ?)',
      args: [name.trim(), email.trim().toLowerCase(), message.trim(), ip_address, page_source ?? null],
    });

    const newId = Number(result.lastInsertRowid);
    createNotification('new_contact', 'New Contact', `New message from ${name}`, 'contact', newId);
    notifyNewContact(name, email, message);

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch {
    serverLog({ level: 'error', category: 'form_submission', message: 'Contact submission error', request });
    return NextResponse.json({ error: 'Failed to submit contact message' }, { status: 500 });
  }
}
