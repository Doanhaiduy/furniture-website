import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { env } from "@/lib/env/schema";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const ADMIN_ONLY_PREFIXES = ["/admin/quotes", "/admin/users", "/admin/settings"];

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return intlMiddleware(request);
  }

  if (
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/admin/access-denied"
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return NextResponse.redirect(new URL("/admin/access-denied", request.url));
  }

  if (profile.role === "editor") {
    const isAdminOnly = ADMIN_ONLY_PREFIXES.some((prefix) =>
      request.nextUrl.pathname.startsWith(prefix),
    );
    if (isAdminOnly) {
      return NextResponse.redirect(new URL("/admin/access-denied", request.url));
    }
  }

  if (profile.role !== "admin" && profile.role !== "editor") {
    return NextResponse.redirect(new URL("/admin/access-denied", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)", "/admin/:path*"],
};
