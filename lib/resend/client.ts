import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env/schema";

// Default env-keyed client, kept for backward compatibility.
export const resend = new Resend(env.RESEND_API_KEY);

/**
* Build a Resend client from an explicitly-resolved API key (e.g. one decrypted
* from integration_secrets at request time). Isolated here so it can be mocked in tests.
*/
export function getResendClient(apiKey: string) {
  return new Resend(apiKey);
}
 