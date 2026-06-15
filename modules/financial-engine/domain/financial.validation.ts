/**
 * Financial validation.
 * Repository: 007_FINANCIAL_ENGINE.md — FINANCIAL VALIDATION, GENERAL PRINCIPLES
 *             002_BUSINESS_RULES.md — BR-005 (revenue only after Delivered)
 *             006_DATABASE_SPECIFICATION.md — MONEY POLICY
 *
 * "Validation failures shall prevent financial publication." (007)
 * All guards run before any formula executes.
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { OrderFinancialInput } from "./financial.types";
import { REVENUE_RECOGNITION_TRIGGER } from "./financial.types";
import { AppError } from "@/utils/errors";

// ── BR-005: Revenue recognition gate ──────────────────────────────────────

/**
 * Asserts the order status is DELIVERED before any financial recognition.
 * "Revenue becomes realized ONLY when Shipment Status = Delivered." (BR-005, 007)
 */
export function assertDeliveredStatus(shipmentStatus: string, orderId: string): void {
  if (shipmentStatus !== REVENUE_RECOGNITION_TRIGGER) {
    throw new AppError({
      code: "REVENUE_RECOGNITION_BLOCKED",
      message: `Order ${orderId}: revenue recognition requires DELIVERED status. Current: ${shipmentStatus}. (BR-005, 007_FINANCIAL_ENGINE)`,
      severity: "CRITICAL",
    });
  }
}

// ── Input completeness guards ──────────────────────────────────────────────

export function assertFinancialInputComplete(input: OrderFinancialInput): void {
  if (!input.orderId) {
    throw new AppError({ code: "FINANCIAL_MISSING_ORDER_ID", message: "orderId required.", severity: "CRITICAL" });
  }
  if (!input.storeId) {
    throw new AppError({ code: "FINANCIAL_MISSING_STORE_ID", message: "storeId required.", severity: "CRITICAL" });
  }
  if (!input.deliveredAt) {
    throw new AppError({ code: "FINANCIAL_MISSING_DELIVERY_DATE", message: `Order ${input.orderId}: deliveredAt required for recognition.`, severity: "CRITICAL" });
  }
  if (input.items.length === 0) {
    throw new AppError({ code: "FINANCIAL_NO_ITEMS", message: `Order ${input.orderId}: cannot process order with zero items.`, severity: "HIGH" });
  }
  // Validate all FIFO costs are present (Inventory Engine must have consumed first)
  for (const item of input.items) {
    if (!item.fifoCost) {
      throw new AppError({
        code: "FINANCIAL_MISSING_FIFO_COST",
        message: `Order ${input.orderId}, item ${item.orderItemId}: FIFO cost not yet available. Inventory Engine must consume before Financial Engine runs.`,
        severity: "CRITICAL",
      });
    }
    if (item.fifoCost.lessThan(0)) {
      throw new AppError({
        code: "FINANCIAL_NEGATIVE_FIFO_COST",
        message: `Order ${input.orderId}, item ${item.orderItemId}: FIFO cost cannot be negative.`,
        severity: "CRITICAL",
      });
    }
  }
}

// ── BR-008: Revenue independence guard ────────────────────────────────────

/**
 * Shipping fee and actual shipping cost must never replace each other (BR-008).
 */
export function assertShippingFieldsSeparate(
  customerFee: Decimal,
  actualCost: Decimal,
  orderId: string,
): void {
  // Both may be zero (free shipping), but we validate they're actual Decimal values
  if (customerFee === undefined || customerFee === null) {
    throw new AppError({
      code: "FINANCIAL_MISSING_CUSTOMER_SHIPPING_FEE",
      message: `Order ${orderId}: customerShippingFee is required (may be 0). (BR-008)`,
      severity: "HIGH",
    });
  }
  if (actualCost === undefined || actualCost === null) {
    throw new AppError({
      code: "FINANCIAL_MISSING_ACTUAL_SHIPPING_COST",
      message: `Order ${orderId}: actualShippingCost is required (SoT: Bosta). (BR-008)`,
      severity: "HIGH",
    });
  }
}

// ── FIN-004: Campaign product uniqueness guard ─────────────────────────────

/**
 * At most one item per order may be the campaign product (FIN-004).
 */
export function assertAtMostOneCampaignProduct(
  items: Array<{ isCampaignProduct: boolean; orderItemId: string }>,
  orderId: string,
): void {
  const campaignItems = items.filter((i) => i.isCampaignProduct);
  if (campaignItems.length > 1) {
    throw new AppError({
      code: "FIN_004_MULTIPLE_CAMPAIGN_PRODUCTS",
      message: `Order ${orderId}: FIN-004 requires at most one campaign product. Found ${campaignItems.length}.`,
      severity: "CRITICAL",
    });
  }
}

// ── Money precision guard ──────────────────────────────────────────────────

export function assertNonNegativeMoney(value: Decimal, field: string, orderId: string): void {
  if (value.lessThan(0)) {
    throw new AppError({
      code: "FINANCIAL_NEGATIVE_MONEY_INPUT",
      message: `Order ${orderId}: ${field} cannot be negative. Received: ${value.toString()}.`,
      severity: "HIGH",
    });
  }
}
