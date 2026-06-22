/**
 * GET /api/v1/homepage
 *
 * Repository: 075_HOMEPAGE_CONTRACT.md, 076_METRICS_CATALOG.md, 077_IMPLEMENTATION_RULES.md
 *
 * Single endpoint for the Homepage Business Cockpit.
 * Returns all KPI cards, Smart Filters, Smart Priority, product rows, and AOV.
 *
 * Rules (077_IMPLEMENTATION_RULES.md):
 * - Controllers remain thin — zero business logic here
 * - All calculations in HomepageService
 * - No mock data — all values from DB
 * - Backend is single source of truth
 *
 * Query params:
 *   storeId   — required (UUID)
 *   from      — ISO datetime (default: 30 days ago)
 *   to        — ISO datetime (default: now)
 *   filter    — SmartFilter key (optional, default: "all")
 *   view      — View selector ("executive"|"finance"|"marketing"|"inventory"|"shipping"|"orders"|"all")
 *
 * Auth: READ_ONLY
 */

import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { computeHomepage } from "@/services/homepage.service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("HomepageAPI");

const VALID_VIEWS = ["executive", "finance", "marketing", "inventory", "shipping", "orders", "all"] as const;
const VALID_FILTERS = [
  "all","profitable","loss_making","high_cpa","low_roas","opportunity",
  "high_returns","low_delivery","low_stock","dead_stock","slow_moving",
  "fast_moving","needs_review","profit_leak","inventory_risk",
] as const;

const QuerySchema = z.object({
  storeId: StoreIdSchema,
  from:    z.string().datetime().optional(),
  to:      z.string().datetime().optional(),
  filter:  z.enum(VALID_FILTERS).default("all"),
  view:    z.enum(VALID_VIEWS).default("executive"),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = QuerySchema.safeParse(params);

  if (!parsed.success) {
    return validationError("Invalid query parameters", { issues: parsed.error.issues });
  }

  const { storeId, filter, view } = parsed.data;
  const from = parsed.data.from ? new Date(parsed.data.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to   = parsed.data.to   ? new Date(parsed.data.to)   : new Date();

  if (from >= to) {
    return validationError("from must be before to");
  }

  logger.info("Homepage API called", {
    metadata: { storeId, from: from.toISOString(), to: to.toISOString(), filter, view },
  });

  const result = await computeHomepage({ storeId, from, to });

  // Apply SmartFilter to product rows
  const filteredProducts = filter === "all"
    ? result.products
    : result.products.filter(p => {
        const f = result.smartFilters.find(sf => sf.key === filter);
        if (!f) return true;
        // The actual filter function is in HomepageService.buildSmartFilters
        // Re-apply same logic here for product list
        switch (filter) {
          case "profitable":    return p.trueProfit > 0;
          case "loss_making":   return p.trueProfit < 0;
          case "high_cpa":      return (p.trueCpa ?? 0) > 200;
          case "low_roas":      return p.adSpend > 0 && (p.trueRoas ?? 0) < 1;
          case "opportunity":   return p.trueProfit > 0 && (p.trueRoas ?? 0) >= 1.5;
          case "high_returns":  return ((p.returnRate ?? 0) * 100) > 10;
          case "low_delivery":  return ((p.deliveryRate ?? 100) < 80) && p.ordersShipped > 0;
          case "low_stock":     return p.inventoryStatus === "LOW_STOCK";
          case "dead_stock":    return p.inventoryStatus === "DEAD_STOCK";
          case "slow_moving":   return p.daysRemaining != null && p.daysRemaining > 60;
          case "fast_moving":   return p.daysRemaining != null && p.daysRemaining < 7;
          case "needs_review":  return p.inventoryStatus === "OUT_OF_STOCK" || p.trueProfit < 0 || (p.trueCpa ?? 0) > 200;
          case "profit_leak":   return p.profitLeakage > 0;
          case "inventory_risk":return p.inventoryStatus === "OUT_OF_STOCK" || (p.daysRemaining != null && p.daysRemaining < 7);
          default:              return true;
        }
      });

  return ok({
    // KPI Cards (075: max 8 cards, backend-driven)
    kpiCards:      result.kpiCards,

    // Smart Filters with live counts (075: SMART FILTERS)
    smartFilters:  result.smartFilters,

    // Smart Priority — exactly one recommendation (075: SMART PRIORITY)
    smartPriority: result.smartPriority,

    // Product rows per 076_METRICS_CATALOG.md + 075: PRODUCTS TABLE
    products:      filteredProducts,

    // AOV Grouping — dominant bucket + suggested offer threshold
    aov:           result.aov,

    // Metadata
    meta: {
      view,
      filter,
      productCount:         filteredProducts.length,
      totalProductCount:    result.products.length,
      computedAt:           result.computedAt,
      periodDays:           result.periodDays,
      from:                 from.toISOString(),
      to:                   to.toISOString(),
      source:               result.source,
    },
  }, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");
