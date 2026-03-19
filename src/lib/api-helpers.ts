import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export function requireAuth(request: NextRequest): { userId: number } | NextResponse {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
  }
  try {
    const payload = verifyToken(token);
    return { userId: payload.userId };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export function parsePagination(url: URL): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  return { page, limit, offset: (page - 1) * limit };
}
