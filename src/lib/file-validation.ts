import path from 'path';

// Allowed file types for merchant statement uploads
const ALLOWED_STATEMENT_EXTENSIONS = new Set([
  '.pdf', '.png', '.jpg', '.jpeg', '.gif',
  '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
]);

// Allowed file types for document uploads
const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.png', '.jpg', '.jpeg', '.gif',
  '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
  '.ppt', '.pptx',
]);

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileUpload(
  file: File,
  type: 'statement' | 'document' = 'statement'
): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file extension
  const ext = path.extname(file.name).toLowerCase();
  const allowedExtensions =
    type === 'statement' ? ALLOWED_STATEMENT_EXTENSIONS : ALLOWED_DOCUMENT_EXTENSIONS;

  if (!ext || !allowedExtensions.has(ext)) {
    return {
      valid: false,
      error: `File type not allowed. Accepted types: ${Array.from(allowedExtensions).join(', ')}`,
    };
  }

  // Check for null bytes in filename (path traversal)
  if (file.name.includes('\0')) {
    return { valid: false, error: 'Invalid filename' };
  }

  return { valid: true };
}

/**
 * Sanitize a filename for use in Content-Disposition headers.
 * Removes path separators, null bytes, quotes, newlines, and non-ASCII.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\\/]/g, '') // Remove path separators
    .replace(/\0/g, '') // Remove null bytes
    .replace(/"/g, '') // Remove quotes
    .replace(/[\r\n]/g, '') // Remove newlines (header injection)
    .replace(/[^\x20-\x7E]/g, '_') // Replace non-ASCII with underscore
    .trim() || 'download';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified — rejects obviously invalid patterns
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}
