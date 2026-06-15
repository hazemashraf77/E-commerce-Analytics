/**
 * EazyOrder → Canonical Order mapper.
 * Repository: 012_API_ARCHITECTURE.md — CANONICAL CONVERSION, NORMALIZATION
 *             004_CANONICAL_DATA_MODEL.md — Entity 004 (Order), Entity 005 (Order Item)
 *
 * Rules:
 *  • Maps provider statuses to canonical OrderStatus (004: ORDER STATUS MODEL)
 *  • Preserves both providerOrderId and internal storeId relationship (012: IDENTITY MAPPING)
 *  • No financial calculations here (012: Adapters never calculate Profit)
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { EazyOrderRawOrder } from "../types/eazy-order.types";
import { EAZY_ORDER_STATUS_MAP } from "../types/eazy-order.types";
import type { CanonicalOrder, CanonicalOrderItem } from "@/modules/synchronization-engine/types/adapter.types";
import type { OrderStatus, MarketingPlatform, PaymentStatus } from "@prisma/client";

const PAYMENT_METHOD_MAP: Record<string, PaymentStatus> = {
  cod: "PENDING",
  online: "PAID",
  prepaid: "PAID",
};

const MARKETING_PLATFORM_MAP: Record<string, MarketingPlatform> = {
  meta: "META",
  facebook: "META",
  tiktok: "TIKTOK",
  direct: "DIRECT",
  organic: "ORGANIC",
  referral: "REFERRAL",
};

export interface MappedOrder {
  order: CanonicalOrder;
  items: CanonicalOrderItem[];
}

export function mapEazyOrderToCanonical(
  raw: EazyOrderRawOrder,
  storeId: string,
): MappedOrder {
  const orderStatus = (
    EAZY_ORDER_STATUS_MAP[raw.status.toLowerCase()] ?? "PENDING"
  ) as OrderStatus;

  const paymentStatus = PAYMENT_METHOD_MAP[raw.payment_method.toLowerCase()] ?? "UNKNOWN";

  const marketingSource = raw.marketing_source
    ? (MARKETING_PLATFORM_MAP[raw.marketing_source.toLowerCase()] ?? "UNKNOWN")
    : undefined;

  const order: CanonicalOrder = {
    storeId,
    provider: "EAZY_ORDER",
    providerOrderId: raw.id,
    orderDate: new Date(raw.created_at),
    customerShippingFee: new Decimal(raw.customer_shipping_fee),
    paymentMethod: raw.payment_method,
    paymentStatus: paymentStatus as PaymentStatus,
    orderStatus,
    shipmentStatus: null,
    marketingSource: marketingSource ?? null,
    campaignId: null, // resolved in sync service after campaign import
    syncedAt: new Date(),
  };

  const items: CanonicalOrderItem[] = raw.items.map((item) => ({
    orderId: "", // set after order insertion
    productId: item.product_id, // pre-mapped from product sync
    quantity: new Decimal(item.quantity),
    unitPrice: new Decimal(item.unit_price),
    discount: new Decimal(item.discount),
    allocatedRevenue: null, // set by Financial Engine — never by adapter (012)
    fifoCost: null,         // set by Inventory Engine — never by adapter (012)
    profitContribution: null, // set by Financial Engine — never by adapter (012)
  }));

  return { order, items };
}
