import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';
import { logActivity } from '@/lib/notifications';
import { sanitizeFilename } from '@/lib/file-validation';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const docId = parseInt(id, 10);

    if (isNaN(docId) || docId < 1) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId) as Record<string, unknown> | undefined;

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const filePath = doc.file_path as string;

    // Ensure file path is within uploads directory (path traversal prevention)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const ext = path.extname(doc.original_filename as string).toLowerCase();
    const contentType = MIME_TYPES[ext] || (doc.mime_type as string) || 'application/octet-stream';

    // Sanitize filename to prevent header injection
    const safeFilename = sanitizeFilename(doc.original_filename as string);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': String(fileBuffer.length),
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error downloading document');
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const docId = parseInt(id, 10);

    if (isNaN(docId) || docId < 1) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId) as Record<string, unknown> | undefined;

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Remove file from disk if it exists
    const filePath = doc.file_path as string;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(filePath);

    // Only delete if within uploads directory
    if (resolvedPath.startsWith(uploadsDir)) {
      try {
        if (fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }
      } catch {
        console.error('Failed to delete file from disk');
      }
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(docId);

    logActivity('delete', 'document', docId, `Deleted document: ${doc.original_filename}`, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document');
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
