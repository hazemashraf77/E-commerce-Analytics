import { z } from "zod";

/**
 * Environment loader per 048_PROJECT_BOOTSTRAP.md and PROJECT_RULES SR-001/SR-002.
 * Lazy validation: only throws when getServerEnv()/getClientEnv() is called.
 * Preview mode: all vars have fallbacks so build succeeds with placeholder values.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME:        z.string().default("E-Commerce Analytics"),
  NEXT_PUBLIC_APP_URL:         z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL:    z.string().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default("placeholder"),
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().default("placeholder"),
  DATABASE_URL:  z.string().default("postgresql://placeholder:placeholder@localhost:5432/placeholder"),
  DIRECT_URL:    z.string().default("postgresql://placeholder:placeholder@localhost:5432/placeholder"),
  JWT_SECRET:    z.string().default("preview-jwt-secret-32-chars-long!!"),
  APP_SECRET:    z.string().default("preview-app-secret-32-chars-long!!"),
  META_APP_ID:          z.string().optional(),
  META_ACCESS_TOKEN:    z.string().optional(),
  TIKTOK_ACCESS_TOKEN:  z.string().optional(),
  EAZY_ORDER_API_KEY:   z.string().optional(),
  BOSTA_API_KEY:        z.string().optional(),
  SENTRY_DSN:           z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServerEnv: ServerEnv | null = null;
let cachedClientEnv: ClientEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  // parse() with defaults: never throws in preview
  cachedServerEnv = serverSchema.parse({
    ...process.env,
    NEXT_PUBLIC_APP_NAME:         process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL:          process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL:     process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedServerEnv;
}

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;
  cachedClientEnv = clientSchema.parse({
    NEXT_PUBLIC_APP_NAME:         process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL:          process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL:     process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedClientEnv;
}

export function __resetEnvCacheForTests(): void {
  cachedServerEnv = null;
  cachedClientEnv = null;
}
