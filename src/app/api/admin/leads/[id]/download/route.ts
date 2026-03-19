import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { sanitizeFilename } from '@/lib/file-validation';

interface Lead {
  id: number;
  statement_filename: string | null;
  statement_path: string | null;
}

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const leadId = parseInt(id, 10);

    if (isNaN(leadId) || leadId < 1) {
      return NextResponse.json(
        { error: 'Invalid lead ID' },
        { status: 400 }
      );
    }

    const lead = db
      .prepare('SELECT id, statement_filename, statement_path FROM leads WHERE id = ?')
      .get(leadId) as Lead | undefined;

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (!lead.statement_path || !lead.statement_filename) {
      return NextResponse.json(
        { error: 'No statement file uploaded for this lead' },
        { status: 404 }
      );
    }

    // Ensure file path is within uploads directory (path traversal prevention)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(lead.statement_path);
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: 'Statement file not found on disk' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const ext = path.extname(lead.statement_filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Sanitize filename to prevent header injection
    const safeFilename = sanitizeFilename(lead.statement_filename);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': String(fileBuffer.length),
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error downloading statement');
    return NextResponse.json(
      { error: 'Failed to download statement' },
      { status: 500 }
    );
  }
}
