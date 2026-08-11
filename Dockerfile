# syntax=docker/dockerfile:1
# Base image targeting Node 22 on Alpine
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app

# Install dependencies (only when package.json or pnpm-lock.yaml changes)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# Development stage (runs pnpm dev for hot-reloading)
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["pnpm", "dev"]

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Accept build arguments for Next.js build-time variables (as fallback)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Pin the Server Actions encryption key so action IDs stay STABLE across rebuilds.
# Without a fixed key Next generates a new one every build → browsers holding an
# older bundle get HTTP 400 "Failed to find Server Action ... from an older or
# newer deployment" on every server-action call. Must match the runtime value
# in .env.production.
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

ENV SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key
ENV BREVO_SMTP_LOGIN=placeholder@example.com
ENV BREVO_SMTP_KEY=placeholder_smtp_key

# Build using secrets if available, falling back to build arguments
RUN --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_URL,required=false \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_ANON_KEY,required=false \
    --mount=type=secret,id=NEXT_PUBLIC_SITE_URL,required=false \
    export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_URL 2>/dev/null || echo "")}" && \
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_ANON_KEY 2>/dev/null || echo "")}" && \
    export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-$(cat /run/secrets/NEXT_PUBLIC_SITE_URL 2>/dev/null || echo "")}" && \
    pnpm build

# Production runner stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for Next.js cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone server and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
