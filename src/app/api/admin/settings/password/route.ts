import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'currentPassword and newPassword are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // PCI DSS 8.2.3: Require both letters and numbers
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain both letters and numbers' },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'Password exceeds maximum length' },
        { status: 400 }
      );
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(auth.userId) as Record<string, unknown> | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = bcrypt.compareSync(currentPassword, user.password_hash as string);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const newHash = bcrypt.hashSync(newPassword, 12);

    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, auth.userId);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:');
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
