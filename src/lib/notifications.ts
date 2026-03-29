import db from '@/lib/db';

type NotificationType =
  | 'new_lead'
  | 'new_contact'
  | 'new_upload'
  | 'appointment_reminder'
  | 'stage_change';

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  entityType?: string,
  entityId?: number
): Promise<void> {
  try {
    await db.execute({
      sql: 'INSERT INTO notifications (type, title, message, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      args: [type, title, message, entityType ?? null, entityId ?? null],
    });
  } catch {
    // Non-critical — don't break the main operation
  }
}

export async function logActivity(
  action: string,
  entityType: string,
  entityId: number,
  details?: string,
  adminUserId?: number
): Promise<void> {
  try {
    await db.execute({
      sql: 'INSERT INTO activity_log (action, entity_type, entity_id, details, admin_user_id) VALUES (?, ?, ?, ?, ?)',
      args: [action, entityType, entityId, details ?? null, adminUserId ?? null],
    });
  } catch {
    // Non-critical
  }
}
