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

  console.log("MIDDLEWARE: Request Path:", request.nextUrl.pathname);
  console.log("MIDDLEWARE: All Cookies:", request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 15)}...`));

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  console.log("MIDDLEWARE: User ID:", user?.id, "Email:", user?.email, "Error:", error);

  if (!user) {
    console.log("MIDDLEWARE: Redirecting to login because user is null");
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

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)", "/admin/:path*"],
};
