import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Session handling foundation per 048 (Authentication section).
 * Route-level enforcement and the full permission model arrive with
 * 018_SECURITY_ARCHITECTURE.md / 032_PERMISSION_MATRIX.md in the
 * security sprint.
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("AUTH_REQUIRED: no authenticated user in current session.");
  }
  return user;
}
