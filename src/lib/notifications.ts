import db from '@/lib/db';

type NotificationType = 'new_lead' | 'new_contact' | 'new_upload' | 'appointment_reminder' | 'stage_change';

export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  entityType?: string,
  entityId?: number
): void {
  try {
    db.prepare(
      'INSERT INTO notifications (type, title, message, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)'
    ).run(type, title, message, entityType || null, entityId || null);
  } catch {
    // Non-critical — don't break the main operation if notification insert fails
  }
}

export function logActivity(
  action: string,
  entityType: string,
  entityId: number,
  details?: string,
  adminUserId?: number
): void {
  try {
    db.prepare(
      'INSERT INTO activity_log (action, entity_type, entity_id, details, admin_user_id) VALUES (?, ?, ?, ?, ?)'
    ).run(action, entityType, entityId, details || null, adminUserId || null);
  } catch {
    // Non-critical
  }
}
