#!/bin/bash
# Restore from a backup file
# Usage:
#   ./scripts/restore.sh path/to/backup.db.gz       (database only)
#   ./scripts/restore.sh path/to/backup.tar.gz       (full restore)
set -euo pipefail

APP_DIR="${APP_DIR:-/app}"
DB_PATH="${APP_DIR}/data/generosity-pays.db"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup-file>"
  echo ""
  echo "Supported formats:"
  echo "  *.db.gz   — Database only restore"
  echo "  *.tar.gz  — Full restore (database + uploads)"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[restore] Error: File not found: $BACKUP_FILE"
  exit 1
fi

echo "[restore] WARNING: This will overwrite existing data."
echo "[restore] Backup file: $BACKUP_FILE"
echo ""

case "$BACKUP_FILE" in
  *.db.gz)
    echo "[restore] Restoring database from compressed backup..."
    mkdir -p "$(dirname "$DB_PATH")"

    # Decompress to temp file, then move
    TEMP_DB=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_DB"

    # Remove WAL files to avoid conflicts
    rm -f "${DB_PATH}-wal" "${DB_PATH}-shm"

    mv "$TEMP_DB" "$DB_PATH"
    echo "[restore] Database restored successfully."
    ;;

  *.tar.gz)
    echo "[restore] Restoring full backup (database + uploads)..."

    # Extract to app directory
    tar -xzf "$BACKUP_FILE" -C "$APP_DIR"

    # Remove WAL files
    rm -f "${DB_PATH}-wal" "${DB_PATH}-shm"

    echo "[restore] Full restore completed successfully."
    ;;

  *)
    echo "[restore] Error: Unsupported file format. Use .db.gz or .tar.gz"
    exit 1
    ;;
esac

echo ""
echo "[restore] IMPORTANT: Restart the application to pick up the restored data:"
echo "  docker compose restart"
