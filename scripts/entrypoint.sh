#!/bin/bash
# Container entrypoint: start cron daemon for scheduled backups, then run Node server
set -euo pipefail

# Install crontab if the crontab file exists
if [ -f /app/scripts/crontab ]; then
  echo "[entrypoint] Installing backup cron schedule..."
  crontab /app/scripts/crontab
  crond -b -l 2
  echo "[entrypoint] Cron daemon started."
fi

echo "[entrypoint] Starting application server..."
exec node server.js
