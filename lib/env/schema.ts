import { z } from "zod";

// Zod schema for required and optional environment variables
export const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000").catch("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: "Required" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, { message: "Required" }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { message: "Required" }),
  // AES-256 key = 32 bytes. encryption.ts accepts EITHER a 32-character utf-8 string OR a
  // 64-character hex string (e.g. `openssl rand -hex 32`). The env validation must accept
  // both, otherwise a valid 64-hex key crashes the app at startup.
  AI_SECRET_ENCRYPTION_KEY: z
    .string()
    .refine((v) => v.length === 32 || v.length === 64, {
      message: "Must be 32 characters (utf-8) or 64 hex characters",
    })
    .optional(),
  
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  QUOTE_NOTIFICATION_RECIPIENTS: z.string().optional(),
  GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN: z.string().optional(),
  REVALIDATION_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_DEFAULT_MODEL: z.string().default("gemini-1.5-pro"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  if (typeof window !== "undefined") {
    // Client-side validation: only validate public keys
    const publicSchema = envSchema.pick({
      NEXT_PUBLIC_SITE_URL: true,
      NEXT_PUBLIC_SUPABASE_URL: true,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: true,
    });
    
    const result = publicSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
    
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const errorStr = JSON.stringify(formattedErrors).replace(/"/g, "'");
      console.error(`❌ Invalid environment variables: ${errorStr}`);
      throw new Error(`❌ Invalid environment variables: ${errorStr}`);
    }
    return result.data as unknown as Env;
  }
  
  // Server-side validation: validate all keys
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    AI_SECRET_ENCRYPTION_KEY: process.env.AI_SECRET_ENCRYPTION_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_UPLOAD_FOLDER: process.env.CLOUDINARY_UPLOAD_FOLDER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    QUOTE_NOTIFICATION_RECIPIENTS: process.env.QUOTE_NOTIFICATION_RECIPIENTS,
    GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN: process.env.GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN,
    REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_DEFAULT_MODEL: process.env.GEMINI_DEFAULT_MODEL,
  });

  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    const errorStr = JSON.stringify(formattedErrors).replace(/"/g, "'");
    console.error(`❌ Invalid environment variables: ${errorStr}`);
    throw new Error(`❌ Invalid environment variables: ${errorStr}`);
  }

  // Warn if running with placeholder values in production
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    if (
      result.data.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ||
      result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY === "placeholder_anon_key" ||
      result.data.SUPABASE_SERVICE_ROLE_KEY === "placeholder_service_role_key"
    ) {
      console.warn("⚠️ WARNING: Application is running with placeholder Supabase credentials! Please ensure you build the Docker image with the correct build arguments.");
    }
  }
  
  return result.data;
}

// In Next.js, importing this module evaluates the env validation once on startup.
// We bypass immediate validation in testing to allow unit tests to run and mock the env variables.
export const env = typeof window === "undefined" && process.env.NODE_ENV === "test"
  ? {} as Env
  : validateEnv();
