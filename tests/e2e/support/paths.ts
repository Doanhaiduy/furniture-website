import path from "path";

/** Directory where authenticated storage states are cached by auth.setup.ts. */
export const AUTH_DIR = path.join(__dirname, "..", ".auth");

/** Storage state for an admin-role session (full access). */
export const ADMIN_STATE = path.join(AUTH_DIR, "admin.json");

/** Storage state for an editor-role session (blocked from quotes/users/settings). */
export const EDITOR_STATE = path.join(AUTH_DIR, "editor.json");

/** Seeded test credentials. Kept reproducible via supabase migrations (see 0009 + 20260702000001). */
export const CREDENTIALS = {
  admin: { email: "admin@furniture.com", password: "password123" },
  editor: { email: "editor@furniture.com", password: "password123" },
} as const;
