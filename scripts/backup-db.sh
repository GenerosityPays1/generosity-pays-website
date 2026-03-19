#!/bin/bash
# Daily database backup using SQLite's .backup command (WAL-safe)
set -euo pipefail

APP_DIR="${APP_DIR:-/app}"
DB_PATH="${APP_DIR}/data/generosity-pays.db"
BACKUP_DIR="${APP_DIR}/backups/db"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Check database exists
if [ ! -f "$DB_PATH" ]; then
  echo "[backup-db] Database not found at $DB_PATH — skipping."
  exit 0
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/generosity-pays_${TIMESTAMP}.db"

echo "[backup-db] Starting database backup..."

# Use SQLite's .backup for a safe, consistent backup (respects WAL)
sqlite3 "$DB_PATH" ".backup '${BACKUP_FILE}'"

# Compress the backup
gzip "$BACKUP_FILE"

echo "[backup-db] Backup created: ${BACKUP_FILE}.gz"

# Clean up old backups
if [ "$RETENTION_DAYS" -gt 0 ]; then
  DELETED=$(find "$BACKUP_DIR" -name "*.db.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
  if [ "$DELETED" -gt 0 ]; then
    echo "[backup-db] Cleaned up $DELETED backup(s) older than $RETENTION_DAYS days."
  fi
fi

echo "[backup-db] Done."
