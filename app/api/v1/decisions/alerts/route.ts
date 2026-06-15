import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { getCachedAlerts, computeDecisions } from "@/modules/decision-engine/application/decision.engine";
import { StoreIdSchema } from "@/lib/api/schemas";

const Schema = z.object({ storeId: StoreIdSchema });
const SCORES = { businessHealth:74,productScore:81,campaignScore:67,governorateScore:78,shippingScore:72,inventoryHealth:63,marketingHealth:65,opportunityScore:71,riskScore:38,profitHealth:70,deliveryHealth:83,returnHealth:78,cashHealth:68,settlementHealth:75 };

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("storeId required");
  const { storeId } = parsed.data;
  let alerts = getCachedAlerts(storeId);
  if (alerts.length === 0) {
    const r = await computeDecisions(storeId, SCORES);
    alerts = r.alerts;
  }
  return ok(alerts, { requestId: auth.requestId, count: alerts.length });
}

export const GET = withAuth(handler, "READ_ONLY");
