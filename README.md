# Generosity Pays

Payment processing website with lead capture, admin dashboard, and CRM pipeline. Built with Next.js, SQLite, and TailwindCSS.

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local — at minimum set JWT_SECRET (32+ characters)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### First Login

On first run, an admin user is created automatically:
- **Username:** `admin`
- **Password:** Check the console output (or set `ADMIN_DEFAULT_PASSWORD` in `.env.local` before first run)

Change the password immediately at `/admin/settings`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Min 32 chars. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `ADMIN_DEFAULT_PASSWORD` | No | Initial admin password. Random if not set. |
| `NODE_ENV` | No | `development` or `production` |
| `BASE_URL` | No | Application URL (for email links) |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address for emails |
| `ADMIN_EMAIL` | No | Receives lead/contact notifications |
| `BACKUP_RETENTION_DAYS` | No | Days to keep backups (default: 30) |

## Git Workflow

```
dev  →  staging  →  main (production)
```

- **`dev`** — Active development. Push freely.
- **`staging`** — Pre-production testing. Merge from `dev` via PR.
- **`main`** — Production. Merge from `staging` via PR.

CI runs lint + build on all PRs. Deployment triggers automatically on push to `staging` and `main`.

## Docker Deployment

### Build and run locally

```bash
# Development
docker compose -f docker-compose.dev.yml up -d --build

# Staging (port 3001)
docker compose -f docker-compose.staging.yml up -d --build

# Production (port 80)
docker compose -f docker-compose.prod.yml up -d --build
```

### Zero-downtime updates

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Docker Compose rebuilds and replaces the container atomically. The health check ensures the new container is ready before the old one stops.

### Environment files

- `docker-compose.dev.yml` uses `.env.local`
- `docker-compose.staging.yml` uses `.env.staging`
- `docker-compose.prod.yml` uses `.env.production`

## Backups

Backups run automatically via cron inside the Docker container:
- **Daily** at 2:00 AM — Database backup (`scripts/backup-db.sh`)
- **Weekly** on Sunday at 3:00 AM — Full backup including uploads (`scripts/backup-full.sh`)

### Manual backup

```bash
# Database only
docker exec generosity-pays-prod bash /app/scripts/backup-db.sh

# Full backup (database + uploads)
docker exec generosity-pays-prod bash /app/scripts/backup-full.sh
```

### Restore

```bash
# Database only
docker exec generosity-pays-prod bash /app/scripts/restore.sh /app/backups/db/backup.db.gz

# Full restore
docker exec generosity-pays-prod bash /app/scripts/restore.sh /app/backups/full/backup.tar.gz

# Restart after restore
docker compose -f docker-compose.prod.yml restart
```

## Admin Dashboard

Access at `/admin`. Features:

- **Dashboard** — Overview stats and recent activity
- **Leads** — Manage lead submissions with status tracking
- **Pipeline** — Visual CRM pipeline (new lead → active merchant)
- **Merchants** — Active merchant management
- **Fee Analysis** — Review uploaded processing statements
- **Appointments** — Schedule and track meetings
- **Analytics** — Business metrics and charts
- **Documents** — File management
- **Contacts** — Contact form message management
- **Logs** — Server logs, login attempts, and activity history
- **Settings** — Change password and admin preferences

## Project Structure

```
src/
  app/
    api/           # API routes (leads, contacts, admin endpoints)
    admin/         # Admin dashboard pages
    fee-analysis/  # Fee analysis page
  components/      # React components (public site + admin)
  lib/             # Utilities (db, auth, email, logging)
  middleware.ts    # Route protection
scripts/           # Backup and deployment scripts
data/              # SQLite database (auto-created)
uploads/           # User-uploaded files
```
