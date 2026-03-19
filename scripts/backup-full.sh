#!/bin/bash
# Weekly full backup: database + uploads
set -euo pipefail

APP_DIR="${APP_DIR:-/app}"
BACKUP_DIR="${APP_DIR}/backups/full"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Run database backup first
bash "${APP_DIR}/scripts/backup-db.sh"

echo "[backup-full] Creating full archive..."

# Create a tar.gz of data/ and uploads/
ARCHIVE_FILE="${BACKUP_DIR}/generosity-pays-full_${TIMESTAMP}.tar.gz"
tar -czf "$ARCHIVE_FILE" \
  -C "$APP_DIR" \
  data/ uploads/ \
  2>/dev/null || true

echo "[backup-full] Archive created: ${ARCHIVE_FILE}"

# Clean up old archives
if [ "$RETENTION_DAYS" -gt 0 ]; then
  DELETED=$(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
  if [ "$DELETED" -gt 0 ]; then
    echo "[backup-full] Cleaned up $DELETED archive(s) older than $RETENTION_DAYS days."
  fi
fi

echo "[backup-full] Done."
