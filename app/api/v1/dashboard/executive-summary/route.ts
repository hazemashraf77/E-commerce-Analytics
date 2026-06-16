/**
 * GET /api/v1/dashboard/executive-summary?storeId=&period=
 * Returns executive-level KPIs for the Command Center.
 * Repository: 059_EXECUTIVE_COMMAND_CENTER.md, 061_FINANCIAL_INTELLIGENCE.md
 * Auth: READ_ONLY
 * All values computed by Formula Engine / KPI Calculator.
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import {
  calcDeliveryRate, calcReturnRate, calcRefusalRate,
  calcDeliveredRoas, calcTrueRoas, calcPpap, calcTrueCpa, calcHealthScores,
} from "@/modules/formula-engine";

const Schema = z.object({
  storeId: StoreIdSchema,
  period:  z.string().default("LAST_30_DAYS"),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("storeId required");

  // Aggregate from product intelligence (preview mode: mock data)
  const products = MOCK_PRODUCT_INTELLIGENCE;

  const revenue        = products.reduce((s, p) => s + p.revenue, 0);
  const cogs           = products.reduce((s, p) => s + p.cogs, 0);
  const grossProfit    = products.reduce((s, p) => s + p.grossProfit, 0);
  const netProfit      = products.reduce((s, p) => s + p.netProfit, 0);
  const trueProfit     = products.reduce((s, p) => s + p.trueProfit, 0);
  const adSpend        = products.reduce((s, p) => s + p.adSpend, 0);
  const shipping       = products.reduce((s, p) => s + p.shippingCost, 0);
  const returnShipping = products.reduce((s, p) => s + p.returnShippingCost, 0);
  const delivered      = products.reduce((s, p) => s + p.ordersDelivered, 0);
  const shipped        = products.reduce((s, p) => s + p.ordersShipped, 0);
  const returned       = products.reduce((s, p) => s + p.ordersReturned, 0);
  const refused        = products.reduce((s, p) => s + p.ordersRefused, 0);
  const inventoryValue = products.reduce((s, p) => s + p.inventoryValue, 0);

  const deliveryRate   = calcDeliveryRate(delivered, shipped);
  const returnRate     = calcReturnRate(returned, delivered);
  const refusalRate    = calcRefusalRate(refused, shipped);
  const deliveredRoas  = calcDeliveredRoas(revenue, adSpend);
  const trueRoas       = calcTrueRoas(trueProfit, adSpend);
  const trueCpa        = calcTrueCpa(adSpend, delivered);
  const ppap           = calcPpap(trueProfit, adSpend);
  const profitMarginPct = revenue > 0 ? (trueProfit / revenue) * 100 : 0;

  const health = calcHealthScores({
    profitMarginPct,
    deliveryRate,
    returnRate,
    refusalRate,
    inventoryDaysRemaining: 22, // aggregate estimate
    ppap,
    trueCpa,
  });

  return ok({
    period: parsed.data.period,
    financial: {
      revenue,          // FIN-001
      cogs,             // INV-001
      grossProfit,      // FIN-003
      netProfit,        // FIN-002
      trueProfit,       // TRUE-001
      adSpend,
      shipping,
      returnShipping,
      profitMarginPct,
      inventoryValue,   // INV-002
    },
    marketing: {
      deliveredRoas,    // MKT-011
      trueRoas,         // MKT-012
      trueCpa,          // MKT-002
      ppap,             // MKT-013
    },
    operational: {
      delivered,
      shipped,
      returned,
      refused,
      deliveryRate,     // SHP-001
      returnRate,       // SHP-002
      refusalRate,      // SHP-003
    },
    health,
    productCount: products.length,
  }, { requestId: auth.requestId, source: "MOCK_KPI_CALCULATOR" });
}

export const GET = withAuth(handler, "READ_ONLY");
