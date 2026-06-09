import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr";
import { env } from "@/lib/env/schema";

/**
 * Creates a browser-safe Supabase client.
 * Uses public variables from the validated environment configuration.
 */
export function createBrowserClient() {
  return createBrowserClientSSR(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
