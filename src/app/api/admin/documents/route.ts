import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import db from '@/lib/db';
import { requireAuth, parsePagination } from '@/lib/api-helpers';
import { logActivity } from '@/lib/notifications';
import { validateFileUpload } from '@/lib/file-validation';

const VALID_ENTITY_TYPES = new Set(['lead', 'merchant', 'general']);

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const url = new URL(request.url);
    const { page, limit, offset } = parsePagination(url);
    const entityType = url.searchParams.get('entity_type');
    const entityId = url.searchParams.get('entity_id');

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (entityType) {
      if (!VALID_ENTITY_TYPES.has(entityType)) {
        return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 });
      }
      conditions.push('entity_type = ?');
      params.push(entityType);
    }

    if (entityId) {
      const parsedId = parseInt(entityId, 10);
      if (isNaN(parsedId) || parsedId < 1) {
        return NextResponse.json({ error: 'Invalid entity_id' }, { status: 400 });
      }
      conditions.push('entity_id = ?');
      params.push(parsedId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM documents ${whereClause}`,
      args: params,
    });
    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const documentsResult = await db.execute({
      sql: `SELECT * FROM documents ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...params, limit, offset],
    });

    return NextResponse.json({ documents: documentsResult.rows, total, page, totalPages });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entity_type') as string | null;
    const entityId = formData.get('entity_id') as string | null;
    const description = formData.get('description') as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!entityType) {
      return NextResponse.json({ error: 'entity_type is required' }, { status: 400 });
    }

    if (!VALID_ENTITY_TYPES.has(entityType)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 });
    }

    const validation = validateFileUpload(file, 'document');
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description too long' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase();
    const uniqueFilename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const result = await db.execute({
      sql: `INSERT INTO documents (filename, original_filename, file_path, file_size, mime_type, entity_type, entity_id, description, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        uniqueFilename, file.name, filePath, file.size,
        file.type || 'application/octet-stream', entityType,
        entityId ? parseInt(entityId, 10) : null,
        description?.trim() ?? null, auth.userId,
      ],
    });

    const docId = Number(result.lastInsertRowid);
    logActivity('upload', 'document', docId, `Uploaded document: ${file.name}`, auth.userId);

    const documentResult = await db.execute({
      sql: 'SELECT * FROM documents WHERE id = ?',
      args: [docId],
    });

    return NextResponse.json({ success: true, document: documentResult.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
