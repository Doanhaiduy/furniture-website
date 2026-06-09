# Container Rate Limit Runtime Notes

This document details the container-local memory-based rate limiting approach for our quote submission API, its limitations, implementation details, testing guides inside Docker, and instructions to swap to a Redis backend.

---

## 1. Approach Overview
The quote request endpoint `/api/contact` will employ a token-bucket or sliding-window rate-limiting mechanism to throttle requests and mitigate spam and brute-force attacks.
Given our containerized deployment context, this rate limiter will run **in-memory** within the active Next.js application runtime instance.

---

## 2. Implementation Details
- **Location**: Implement inside the Route Handler `/app/api/contact/route.ts` or as a server utility helper `lib/security/rate-limit.ts`.
- **In-Memory Cache**: Use a simple key-value store (e.g. `Map<string, { count: number; resetTime: number }>` or a lightweight library like `lru-cache`) to track request timestamps indexed by the client's hashed IP address.
- **Rules**: Limit clients to a maximum of 3 quote submissions per 5-minute window. If the limit is exceeded, return:
  - HTTP status code: `429 Too Many Requests`.
  - JSON payload: `{ "error": "Too many requests. Please try again later." }`.
  - Headers: `Retry-After: seconds`.

---

## 3. Limitations of Container-Local Memory Rate Limiting
- **No Shared State**: If the application scales to multiple container instances behind a load balancer, each container will maintain its own isolated memory cache. An attacker could rotate requests across containers to bypass limits.
- **App Restarts**: Restarting the container clears the cache, resetting all client request counters immediately.
- **Memory Overhead**: Large numbers of concurrent users will increase the memory footprint of the container. An LRU (Least Recently Used) cache with a strict maximum limit (e.g., max 5,000 active IP hashes) is required to prevent out-of-memory crashes.

---

## 4. How to Swap to Redis Later (Scaling Path)
If scaling requirements dictate a shared cache, the local memory provider can be swapped for Redis:

### 4.1. Step 1: Install Dependencies
```bash
pnpm add @upstash/redis
# or standard redis client
pnpm add redis
```

### 4.2. Step 2: Configure Environment Variables
Add to `.env`:
```
REDIS_URL=redis://user:password@host:port
```

### 4.3. Step 3: Update rate-limit.ts
Modify `lib/security/rate-limit.ts` to switch from local memory maps to Redis client increments:
```typescript
// lib/security/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
});

export async function checkRateLimit(ip: string): Promise<boolean> {
  if (!process.env.REDIS_URL) {
    // Fall back to local memory rate-limiter if Redis is not configured
    return checkInMemoryLimit(ip);
  }
  
  const key = `rate_limit:quote:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 300); // 5 minutes window
  }
  return count <= 3;
}
```

---

## 5. Testing Rate Limiting inside Docker
- **Local Loop testing**: Test rate limits inside the container using curl from the host:
  ```bash
  for i in {1..5}; do curl -i http://localhost:3000/api/contact; done
  ```
- **Hashed IP Resolution**: Verify that the Next.js server resolves the client's actual IP address rather than the Docker gateway bridge IP (e.g., checking `x-forwarded-for` header mapping).
- **Browser MCP validation**: Submit through the visible quote form until the limit is reached, verify the safe rate-limit message, and inspect network/API details only if the visible state is unclear.
- **Playwright backup**: Use a deterministic script for consecutive POST requests only when CI/headless rate-limit regression is required.
