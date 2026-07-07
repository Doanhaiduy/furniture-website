import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/showroom/admin-shell";
import { getCurrentUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

// The admin area must never be indexed, even if a URL leaks past robots.txt.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Persistent admin layout. Rendering the AdminShell (sidebar + header) here — instead of
 * inside every page — keeps the sidebar mounted across navigations, so only the page
 * content re-renders (no sidebar flicker). Unauthenticated routes (e.g. /admin/login)
 * render without the chrome.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return <>{children}</>;
  return <AdminShell user={user}>{children}</AdminShell>;
}
