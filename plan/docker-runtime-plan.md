# Docker Runtime Plan

## Overview
The application runs in Docker containers for both development and production environments, ensuring environment consistency and simple deployments.

---

## 1. Development Setup

### 1.1. Docker Compose Layout
```yaml
version: '3.8'
services:
  app:
    container_name: furniture-website-app
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
    env_file:
      - .env
```

### 1.2. Dockerfile.dev
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
```

---

## 2. Production Build Setup

### 2.1. Dockerfile
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 3. Environment Variable Strategies
- Public-safe configuration keys (e.g. `NEXT_PUBLIC_SUPABASE_URL`) are injected into the client bundle at build-time.
- Server-only secrets (e.g. `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `AI_SECRET_ENCRYPTION_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly in the server runtime environment and are never exposed to client-side pages.

---

## 4. Quote Form Rate Limiting Runtime
- Rate limiting on `/api/contact` will run **container-local in-memory** inside the active Next.js process.
- The cache uses a memory Map with an LRU policy (maximum 5,000 active IP hashes) to prevent memory leak vulnerabilities.
- **Scaling Path**: If horizontal scaling is implemented behind a load balancer, the local memory rate-limiter can be swapped for a centralized Redis cache by configuring `REDIS_URL` without changing the core route handler logic.

---

## 5. Local Database Migrations & Seeding
- We will use the Supabase CLI to execute migrations locally:
  ```bash
  supabase db reset
  ```
- Local seeding scripts are executed only when the config parameter is active (`app.seed_local = 'true'`), preventing test users or mock configurations from reaching production databases.
