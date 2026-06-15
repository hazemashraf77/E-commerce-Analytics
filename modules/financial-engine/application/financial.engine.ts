/**
 * Financial Engine — main orchestration service.
 * Repository: 007_FINANCIAL_ENGINE.md — FINANCIAL CALCULATION PIPELINE
 *             033_FORMULA_CATALOG v2.1.0 — FIN-001, FIN-002, FIN-003, FIN-004, SHIP-001
 *
 * Pipeline per 007:
 *   Business Events → Canonical Models → Financial Engine → Formula Engine
 *   → Analytics Engine → Dashboard
 *
 * This service executes steps 1–3 (validates → calculates → persists).
 * Analytics Engine (step 4) is Sprint 5.
 *
 * RULES ENFORCED:
 *   • BR-005: only DELIVERED orders are processed
 *   • "Never overwrite historical calculations." (007)
 *   • All formulas reference their Catalog ID
 *   • No raw API payloads consumed — Canonical Models only (007)
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import type { OrderFinancialInput, OrderFinancialResult } from "../domain/financial.types";
import {
  assertDeliveredStatus,
  assertFinancialInputComplete,
  assertShippingFieldsSeparate,
  assertAtMostOneCampaignProduct,
} from "../domain/financial.validation";
import {
  calculateRevenue,
  calculateShippingSubsidy,
  calculateGrossProfit,
  calculateNetProfit,
  calculateProfitContributions,
} from "../formulas/financial.formulas";
import {
  traceRevenue,
  traceShippingSubsidy,
  traceGrossProfit,
  traceNetProfit,
  traceProfitContribution,
} from "../domain/formula.inspector";
import {
  persistRevenueEvent,
  persistCostEvent,
  persistProfitEvent,
  persistProfitContributions,
  persistFifoCosts,
  hasRevenueEvent,
} from "../repositories/financial-event.repository";
import { AppError } from "@/utils/errors";

const logger = createLogger("FinancialEngine");

// ── Main entry point ───────────────────────────────────────────────────────

/**
 * Processes a delivered order through the complete financial pipeline.
 * Called by the Sync/Background engine after order reaches DELIVERED status.
 *
 * Idempotent: skips if revenue event already exists for this order.
 * "Never overwrite historical calculations." (007)
 */
export async function processDeliveredOrder(
  input: OrderFinancialInput,
  deliveredShipmentStatus: string,
): Promise<OrderFinancialResult> {
  logger.info("Financial Engine: processing delivered order", {
    metadata: { orderId: input.orderId, storeId: input.storeId },
  });

  // ── Step 1: Validation ─────────────────────────────────────────────────
  assertDeliveredStatus(deliveredShipmentStatus, input.orderId);
  assertFinancialInputComplete(input);
  assertShippingFieldsSeparate(input.customerShippingFee, input.actualShippingCost, input.orderId);
  assertAtMostOneCampaignProduct(input.items, input.orderId);

  // Idempotency guard — "never overwrite historical calculations" (007)
  const alreadyProcessed = await hasRevenueEvent(input.orderId);
  if (alreadyProcessed) {
    logger.warn("Financial Engine: order already processed — skipping (idempotency)", {
      metadata: { orderId: input.orderId },
    });
    throw new AppError({
      code: "FINANCIAL_ALREADY_PROCESSED",
      message: `Order ${input.orderId} has already been financially recognized. Historical records are immutable.`,
      severity: "HIGH",
    });
  }

  // ── Step 2: Calculations (pure, referencing Formula IDs) ──────────────
  const revenue = calculateRevenue(input);                  // FIN-001
  const shippingSubsidy = calculateShippingSubsidy(input);  // SHIP-001
  const grossProfit = calculateGrossProfit(input, revenue); // FIN-003
  const netProfit = calculateNetProfit(input, revenue);     // FIN-002
  const profitContributions = calculateProfitContributions(input); // FIN-004

  // ── Step 3: Persist (inside transaction — 006: TRANSACTION POLICY) ────
  await prisma.$transaction(async () => {
    await persistRevenueEvent(revenue);
    await persistCostEvent(grossProfit);
    await persistProfitEvent(grossProfit, netProfit);
    await persistFifoCosts(
      input.items.map((i) => ({ orderItemId: i.orderItemId, fifoCost: i.fifoCost })),
    );
    await persistProfitContributions(
      profitContributions.map((pc) => ({
        orderItemId: pc.orderItemId,
        profitContribution: pc.profitContribution,
      })),
    );
  });

  // ── Step 4: Build Formula Inspector traces ─────────────────────────────
  const traces = [
    traceRevenue(revenue),
    traceShippingSubsidy(shippingSubsidy),
    traceGrossProfit(grossProfit),
    traceNetProfit(netProfit),
    ...profitContributions.map(traceProfitContribution),
  ];

  const campaignProductPresent = input.items.some((i) => i.isCampaignProduct);

  logger.info("Financial Engine: order processed successfully", {
    metadata: {
      orderId: input.orderId,
      revenue: revenue.totalRevenue.toString(),
      grossProfit: grossProfit.grossProfit.toString(),
      netProfit: netProfit.netProfit.toString(),
    },
  });

  return {
    orderId: input.orderId,
    storeId: input.storeId,
    revenue,
    shippingSubsidy,
    grossProfit,
    netProfit,
    profitContributions,
    costsUnallocated: !campaignProductPresent && input.advertisingCost.greaterThan(0),
    traces,
  };
}

// ── Inventory event subscriber ─────────────────────────────────────────────
// Registers listener for LAYER_CONSUMED events from Inventory Engine (008 step 7).
// Accumulates FIFO costs per order item; triggers financial processing once
// all items for a delivered order have been consumed.
// (Full implementation wired in the Background Jobs sprint.)

export function registerInventoryEventHandlers(): void {
  const { onInventoryEvent } = require("@/modules/inventory-engine");
  onInventoryEvent(
    "LAYER_CONSUMED",
    async (event: import("@/modules/inventory-engine").InventoryEvent) => {
      logger.debug("Financial Engine received LAYER_CONSUMED event", {
        metadata: { productId: event.productId },
      });
      // Cost accumulation and order completion detection — Background Jobs sprint
    },
  );
}
