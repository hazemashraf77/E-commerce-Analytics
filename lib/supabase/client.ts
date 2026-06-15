"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/env";

/**
 * Browser Supabase client (anon key only — SR-003 least privilege).
 * Deviation D-1: implemented with @supabase/ssr, the maintained successor
 * of @supabase/auth-helpers-nextjs named in 048. Recorded in the Sprint 0
 * completion report for ratification and documentation update (DR-002).
 */
export function createSupabaseBrowserClient() {
  const env = getClientEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
