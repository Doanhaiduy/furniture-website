import "server-only";

import { createAdminClient } from "@/lib/supabase/server";

const MAX_ENTRIES = 5000;
const WINDOW_MS = 60_000;
const entries = new Map<string, { timestamps: number[]; blockedUntil: number }>();

function prune(key: string, now: number) {
  const entry = entries.get(key);
  if (!entry) return;
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
  if (entry.timestamps.length === 0 && entry.blockedUntil <= now) {
    entries.delete(key);
  }
}

export function rateLimitCheck(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();

  if (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value as string | undefined;
    if (oldest) entries.delete(oldest);
  }

  prune(key, now);

  const entry = entries.get(key) ?? { timestamps: [], blockedUntil: 0 };

  if (entry.blockedUntil > now) {
    return { allowed: false, retryAfterMs: entry.blockedUntil - now };
  }

  const recent = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
  const limit = 5;
  if (recent.length >= limit) {
    const blockedUntil = now + WINDOW_MS;
    entries.set(key, { timestamps: [], blockedUntil });
    return { allowed: false, retryAfterMs: WINDOW_MS };
  }

  recent.push(now);
  entries.set(key, { timestamps: recent, blockedUntil: 0 });
  return { allowed: true, retryAfterMs: 0 };
}
