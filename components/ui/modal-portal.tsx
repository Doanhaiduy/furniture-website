"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into a portal attached to <body> so that fixed-position
 * overlays are never trapped inside an ancestor that establishes a containing
 * block (any ancestor with transform / filter / backdrop-filter / overflow).
 *
 * Use this to wrap custom (non-Radix) modal overlays. Radix-based dialogs
 * (components/ui/dialog, alert-dialog, sheet) already portal themselves.
 */
export function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Standard SSR mount guard for portals (avoids hydration mismatch); same pattern as admin-excel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(children, document.body);
}
