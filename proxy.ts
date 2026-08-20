import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { env } from "@/lib/env/schema";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const ADMIN_ONLY_PREFIXES = ["/admin/quotes", "/admin/users", "/admin/settings"];
const PUBLIC_AUTH_ROUTES = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return intlMiddleware(request);
  }

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

  const response = NextResponse.next();
  const supabaseUrl = process.env.SUPABASE_URL_INTERNAL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createServerClient(
    supabaseUrl,
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
      cookieOptions: {
        name: "sb-auth-token",
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. If user is already logged in and tries to access login / forgot-password / reset-password:
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 2. If user is NOT logged in:
  if (!user) {
    if (isAuthRoute || pathname === "/admin/access-denied") {
      return response;
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. User is logged in: verify profile role and active status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    if (pathname === "/admin/access-denied") {
      return response;
    }
    return NextResponse.redirect(new URL("/admin/access-denied", request.url));
  }

  if (pathname === "/admin/access-denied") {
    return response;
  }

  if (profile.role === "editor") {
    const isAdminOnly = ADMIN_ONLY_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
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

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)", "/admin/:path*"],
};
