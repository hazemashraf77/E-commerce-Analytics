#!/usr/bin/env tsx
/**
 * CI helper: validates env variables are present (not their values).
 * Run before deploying: npx tsx scripts/check-env.ts
 */
const REQUIRED = [
  "NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL", "DIRECT_URL",
  "JWT_SECRET", "APP_SECRET",
];
let failed = 0;
for (const key of REQUIRED) {
  if (!process.env[key]) { console.error(`MISSING: ${key}`); failed++; }
  else { console.log(`OK: ${key}`); }
}
process.exit(failed);
