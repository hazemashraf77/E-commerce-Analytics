import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { getHomepageDashboard } from "@/services/homepage.service";

const Schema = z.object({
  storeId: StoreIdSchema,
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

  if (!parsed.success) {
    return validationError("Invalid query", { issues: parsed.error.issues });
  }

  const from = parsed.data.from
    ? new Date(parsed.data.from)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const to = parsed.data.to ? new Date(parsed.data.to) : new Date();

  const result = await getHomepageDashboard({
    storeId: parsed.data.storeId,
    from,
    to,
  });

  return ok(result, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");