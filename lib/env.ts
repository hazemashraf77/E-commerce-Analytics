import { z } from "zod";

/**
 * Environment loader per 048_PROJECT_BOOTSTRAP.md SR-001/SR-002.
 * All integration tokens are optional — preview mode bypasses gracefully.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME:         z.string().default("E-Commerce Analytics"),
  NEXT_PUBLIC_APP_URL:          z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL:     z.string().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:z.string().default("placeholder"),
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY:    z.string().default("placeholder"),
  DATABASE_URL:                 z.string().default("postgresql://placeholder:placeholder@localhost:5432/preview"),
  DIRECT_URL:                   z.string().default("postgresql://placeholder:placeholder@localhost:5432/preview"),
  JWT_SECRET:                   z.string().default("preview-jwt-secret-minimum-32-chars!!"),
  APP_SECRET:                   z.string().default("preview-app-secret-minimum-32-chars!!"),

  // EasyOrders integration
  EAZY_ORDER_API_KEY:                    z.string().optional(),
  EAZY_ORDER_STORE_URL:                  z.string().optional(),   // e.g. https://api.easy-orders.net
  // Two separate webhook secrets — one per EasyOrders webhook type
  EASYORDERS_ORDER_WEBHOOK_SECRET:       z.string().optional(),   // Order webhook secret
  EASYORDERS_ORDER_STATUS_WEBHOOK_SECRET:z.string().optional(),   // Order Status Update webhook secret

  // Bosta integration
  BOSTA_API_KEY:                z.string().optional(),
  BOSTA_WEBHOOK_SECRET:         z.string().optional(),

  // Optional: Meta / TikTok
  META_APP_ID:                  z.string().optional(),
  META_ACCESS_TOKEN:            z.string().optional(),
  META_AD_ACCOUNT_ID:           z.string().optional(),
  TIKTOK_ACCESS_TOKEN:          z.string().optional(),
  TIKTOK_ADVERTISER_ID:         z.string().optional(),

  // Cron secret (Vercel Cron / external scheduler)
  CRON_SECRET:                  z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServer: ServerEnv | null = null;
let cachedClient: ClientEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  cachedServer = serverSchema.parse({
    ...process.env,
    NEXT_PUBLIC_APP_NAME:          process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedServer;
}

export function getClientEnv(): ClientEnv {
  if (cachedClient) return cachedClient;
  cachedClient = clientSchema.parse({
    NEXT_PUBLIC_APP_NAME:          process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedClient;
}

export function isPreviewMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
}

export function isIntegrationEnabled(provider: "EAZY_ORDER" | "BOSTA" | "META" | "TIKTOK"): boolean {
  const env = getServerEnv();
  switch (provider) {
    case "EAZY_ORDER": return !!(env.EAZY_ORDER_API_KEY && env.EAZY_ORDER_STORE_URL);
    case "BOSTA":      return !!env.BOSTA_API_KEY;
    case "META":       return !!(env.META_APP_ID && env.META_ACCESS_TOKEN);
    case "TIKTOK":     return !!(env.TIKTOK_ACCESS_TOKEN && env.TIKTOK_ADVERTISER_ID);
  }
}

export function __resetEnvCacheForTests(): void {
  cachedServer = null;
  cachedClient = null;
}
