import "server-only";

import { createServerClient as createServerClientSSR } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env/schema";

/**
 * Creates an SSR-aware Supabase client.
 * Uses cookies to manage session persistence across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.SUPABASE_URL_INTERNAL || env.NEXT_PUBLIC_SUPABASE_URL;

  return createServerClientSSR(
    supabaseUrl,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored if called from Server Component
          }
        },
      },
    }
  );
}

/**
 * Privileged admin client using the service role key.
 * This client bypasses RLS and must NEVER be exposed to the client.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL_INTERNAL || env.NEXT_PUBLIC_SUPABASE_URL;

  return createServerClientSSR(
    supabaseUrl,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for service role client
        },
      },
    }
  );
}
