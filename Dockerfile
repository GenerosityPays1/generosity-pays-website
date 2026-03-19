# ─── Stage 1: Dependencies ───
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ─── Stage 2: Build ───
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone
RUN npm run build

# ─── Stage 3: Production ───
FROM node:20-alpine AS runner
WORKDIR /app

# Install sqlite3 CLI for backup scripts
RUN apk add --no-cache sqlite bash

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy backup scripts
COPY --chown=nextjs:nodejs scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh 2>/dev/null || true

# Create persistent directories
RUN mkdir -p data uploads backups && \
    chown -R nextjs:nodejs data uploads backups

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
