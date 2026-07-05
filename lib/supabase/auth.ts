import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env/schema";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.SUPABASE_URL_INTERNAL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createServerClient(
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
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignored in Server Component context
          }
        },
      },
      cookieOptions: {
        name: "sb-auth-token",
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_active, deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  // Mirror the DB is_admin()/is_editor() helpers: a profile is only valid when it is
  // active AND not soft-deleted. Checking is_active alone let a soft-deleted-but-active
  // profile keep full CMS power (most mutations use the service-role client, so RLS
  // wouldn't catch it).
  if (!profile || !profile.is_active || profile.deleted_at) return null;

  return {
    id: user.id,
    email: user.email,
    role: profile.role,
  };
}

export async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    redirect("/admin/access-denied");
  }
  return current;
}

export async function requireEditorOrAdmin() {
  const current = await getCurrentUser();
  if (!current || (current.role !== "admin" && current.role !== "editor")) {
    redirect("/admin/access-denied");
  }
  return current;
}

export async function isAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const cookieStore = await cookies();
  const supabaseUrl = process.env.SUPABASE_URL_INTERNAL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createServerClient(
    supabaseUrl,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op for read-only check
        },
      },
      cookieOptions: {
        name: "sb-auth-token",
      },
    },
  );
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "admin";
}

export async function isEditorOrAdmin(
  userId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;
  const cookieStore = await cookies();
  const supabaseUrl = process.env.SUPABASE_URL_INTERNAL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createServerClient(
    supabaseUrl,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op for read-only check
        },
      },
      cookieOptions: {
        name: "sb-auth-token",
      },
    },
  );
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "admin" || data?.role === "editor";
}
 