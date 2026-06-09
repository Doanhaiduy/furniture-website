import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env/schema";

export const resend = new Resend(env.RESEND_API_KEY);
