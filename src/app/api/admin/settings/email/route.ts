import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    db.prepare('UPDATE admin_users SET email = ? WHERE id = ?').run(email, auth.userId);

    return NextResponse.json({ success: true, message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating email:');
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
}
