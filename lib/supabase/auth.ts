import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env/schema";
import { redirect } from "next/navigation";

type CmsRole = "admin" | "editor";

function getMockRole(overrideRole?: string | null): CmsRole {
  if (overrideRole === "editor") return "editor";
  if (overrideRole === "admin") return "admin";
  return env.MOCK_ADMIN_ROLE === "editor" ? "editor" : "admin";
}

export async function getCurrentUser() {
  const useMock = env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    const cookieStore = await cookies();
    const role = getMockRole(cookieStore.get("pd_mock_admin_role")?.value);
    return {
      id: `mock-${role}-id`,
      email: `${role}@showroom.vn`,
      role,
    };
  }

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
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;

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
  const useMock = env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    const cookieStore = await cookies();
    return getMockRole(cookieStore.get("pd_mock_admin_role")?.value) === "admin";
  }

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
  const useMock = env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) return true;

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
