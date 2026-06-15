import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/config/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Middleware: locale negotiation (next-intl) + Supabase session refresh
 * per 048 (Authentication: session handling, middleware). Route
 * protection rules are added with the Permission Matrix sprint —
 * bootstrap establishes the mechanism only.
 */
export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Bootstrap tolerance: app shell remains reachable before Supabase
    // is configured. Auth-protected routes arrive in later sprints.
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
