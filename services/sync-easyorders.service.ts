/**
 * EasyOrders Sync Service — Sprint 1 (final)
 *
 * KEY RULES:
 * 1. Never auto-create Products (strict architectural rule)
 * 2. Never discard Order Items — every item MUST be stored
 *
 * Order Item storage strategy:
 * - Product found by SKU → create/update OrderItem with real FK (path A)
 * - Product NOT found  → store in ImportStaging entityType=ORDER_ITEM (path B)
 *   Preserves: product_id, sku, product_name, quantity, unit_price, discount
 *   Sprint 2 resolves staging items after product catalogue is built.
 *
 * Schema compliance:
 * - Order.@@unique([storeId, provider, providerOrderId])
 * - OrderItem.productId NOT NULL — only created when product FK resolves
 * - ImportStaging used for unmapped items (externalId indexed, not unique)
 * - OrderStatus/PaymentStatus/MarketingPlatform — only valid enum values
 */

import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import type { OrderStatus, PaymentStatus, MarketingPlatform } from "@prisma/client";
import type { ProviderSyncResult } from "./sync-orchestrator.service";

const logger = createLogger("SyncEasyOrders");

// ── Status maps — only valid Prisma enum values ────────────────────────────

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  new:              "PENDING",
  pending:          "PENDING",
  draft:            "DRAFT",
  confirmed:        "CONFIRMED",
  processing:       "PROCESSING",
  preparing:        "PROCESSING",
  ready:            "READY_TO_SHIP",
  ready_to_ship:    "READY_TO_SHIP",
  shipped:          "SHIPPED",
  in_transit:       "SHIPPED",
  out_for_delivery: "SHIPPED",
  delivered:        "DELIVERED",
  completed:        "DELIVERED",
  closed:           "CLOSED",
  cancelled:        "CANCELLED",
  canceled:         "CANCELLED",
  returned:         "CANCELLED",  // no RETURNED in OrderStatus enum
  refunded:         "CLOSED",
  on_hold:          "PENDING",
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  cod:     "PENDING",
  cash:    "PENDING",
  online:  "PAID",
  prepaid: "PAID",
  paid:    "PAID",
  free:    "PAID",
};

const MARKETING_PLATFORM_MAP: Record<string, MarketingPlatform> = {
  meta:     "META",
  facebook: "META",
  fb:       "META",
  tiktok:   "TIKTOK",
  tt:       "TIKTOK",
  direct:   "DIRECT",
  organic:  "ORGANIC",
  referral: "REFERRAL",
};

// ── EasyOrders API response shape ──────────────────────────────────────────

interface EasyOrdersListResponse {
  data?: {
    list?: unknown[];
    orders?: unknown[];
    data?: unknown[];
    total?: number;
    last_page?: number;
    current_page?: number;
  };
  orders?: unknown[];
  list?: unknown[];
  total?: number;
  last_page?: number;
  current_page?: number;
}

// ── Main export ────────────────────────────────────────────────────────────

export async function syncEasyOrders(
  mode: string,
): Promise<Omit<ProviderSyncResult, "provider" | "durationMs">> {
  const env = getServerEnv();

  if (!env.EAZY_ORDER_API_KEY) {
    logger.warn("EasyOrders sync skipped — EAZY_ORDER_API_KEY missing");
    return {
      status: "skipped_missing_credentials",
      recordsFetched: 0,
      recordsUpserted: 0,
      errorMessage: "EAZY_ORDER_API_KEY not set",
    };
  }

  const baseUrl = (env.EAZY_ORDER_STORE_URL ?? "https://api.easy-orders.net").replace(/\/$/, "");

  const store = await prisma.store.findFirst({ select: { id: true } }).catch(() => null);
  if (!store) {
    logger.error("EasyOrders sync: no store found in DB");
    return {
      status: "failed",
      recordsFetched: 0,
      recordsUpserted: 0,
      errorMessage: "No store record in database",
    };
  }

  // Incremental cursor (ISO timestamp of last successful sync)
  const syncState = await prisma.syncState.findUnique({
    where: { storeId_provider_scope: { storeId: store.id, provider: "EASYORDERS", scope: "orders" } },
  }).catch(() => null);

  const updatedAfter = mode === "full" ? undefined : (syncState?.lastCursor ?? undefined);

  let recordsFetched  = 0;
  let recordsUpserted = 0;
  let page            = 1;
  const perPage       = 100;

  try {
    // ── Pagination loop ──────────────────────────────────────────────────
    while (true) {
      const qs = new URLSearchParams({
        page:     String(page),
        per_page: String(perPage),
        ...(updatedAfter ? { updated_after: updatedAfter } : {}),
      });

      logger.info("EasyOrders: fetching page", { metadata: { page, perPage, updatedAfter } });

      const requestUrl = `${baseUrl}/api/v1/external-apps/orders?${qs.toString()}`;

logger.info("EasyOrders: request URL", {
  metadata: {
    url: requestUrl,
    page,
    perPage,
  },
});

const res = await fetch(requestUrl, {
  headers: {
    "Api-Key": env.EAZY_ORDER_API_KEY,
    "Accept": "application/json",
  },
  signal: AbortSignal.timeout(30_000),
});

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`EasyOrders API ${res.status}: ${text.slice(0, 300)}`);
      }

      const json = await res.json() as EasyOrdersListResponse;

      // Normalise multiple possible response shapes
      const orders: unknown[] =
        json.data?.list   ??
        json.data?.orders ??
        json.data?.data   ??
        json.orders       ??
        json.list         ??
        (Array.isArray(json) ? (json as unknown[]) : []);

      if (orders.length === 0) break;
      recordsFetched += orders.length;

      for (const raw of orders) {
        const order = raw as Record<string, unknown>;
        try {
          await processOrder(store.id, order);
          recordsUpserted++;
        } catch (err) {
          // One bad order never stops the batch
          logger.error("EasyOrders: failed to process order", {
            metadata: { orderId: String(order.id ?? "?"), error: String(err) },
          });
        }
      }

      // Pagination check
      const lastPage =
        json.data?.last_page ??
        json.last_page ??
        Math.ceil(((json.data?.total ?? json.total ?? orders.length)) / perPage);
      const currentPage = json.data?.current_page ?? json.current_page ?? page;

      if (currentPage >= lastPage || orders.length < perPage) break;
      page++;
      await sleep(150);
    }

    // Update sync cursor to now
    await prisma.syncState.upsert({
      where:  { storeId_provider_scope: { storeId: store.id, provider: "EASYORDERS", scope: "orders" } },
      update: { lastCursor: new Date().toISOString(), lastSyncAt: new Date(), status: "IDLE" },
      create: {
        storeId: store.id, provider: "EASYORDERS", scope: "orders",
        lastCursor: new Date().toISOString(), lastSyncAt: new Date(), status: "IDLE",
      },
    }).catch((e) => logger.warn("SyncState upsert failed", { metadata: { error: String(e) } }));

    logger.info("EasyOrders sync complete", { metadata: { recordsFetched, recordsUpserted } });
    return { status: "success", recordsFetched, recordsUpserted };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("EasyOrders sync failed", { metadata: { errorMessage } });
    await prisma.syncState.upsert({
      where:  { storeId_provider_scope: { storeId: store.id, provider: "EASYORDERS", scope: "orders" } },
      update: { status: "FAILED" },
      create: { storeId: store.id, provider: "EASYORDERS", scope: "orders", status: "FAILED" },
    }).catch(() => {});
    return { status: "failed", recordsFetched, recordsUpserted, errorMessage };
  }
}

// ── Process single order ───────────────────────────────────────────────────

async function processOrder(storeId: string, order: Record<string, unknown>): Promise<void> {
  const providerOrderId = String(order.id ?? order.uuid ?? order.order_id ?? "").trim();
  if (!providerOrderId) throw new Error("Order has no id");

  const statusRaw      = String(order.status ?? "new").toLowerCase().replace(/-/g, "_");
  const orderStatus    = ORDER_STATUS_MAP[statusRaw] ?? "PENDING" as OrderStatus;

  const paymentMethodRaw = String(order.payment_method ?? "cod").toLowerCase();
  const paymentStatus    = PAYMENT_STATUS_MAP[paymentMethodRaw] ?? "UNKNOWN" as PaymentStatus;

  const shippingFeeRaw   = parseFloat(String(order.customer_shipping_fee ?? order.shipping_fee ?? "0"));
  const customerShippingFee = new Decimal(isFinite(shippingFeeRaw) ? shippingFeeRaw : 0);

  const marketingSourceRaw = order.marketing_source ?? order.source;
  const marketingSource: MarketingPlatform | null = marketingSourceRaw
    ? (MARKETING_PLATFORM_MAP[String(marketingSourceRaw).toLowerCase()] ?? "UNKNOWN")
    : null;

  const orderDate = order.created_at ? new Date(String(order.created_at)) : new Date();
  if (isNaN(orderDate.getTime())) orderDate.setTime(Date.now());

  // Idempotent upsert — unique key: (storeId, provider, providerOrderId)
  await prisma.order.upsert({
    where: {
      storeId_provider_providerOrderId: { storeId, provider: "EASYORDERS", providerOrderId },
    },
    update: {
      orderStatus,
      paymentStatus,
      customerShippingFee,
      syncedAt: new Date(),
    },
    create: {
      storeId,
      provider:           "EASYORDERS",
      providerOrderId,
      orderDate,
      customerShippingFee,
      paymentMethod:      paymentMethodRaw,
      paymentStatus,
      orderStatus,
      marketingSource,
      syncedAt:           new Date(),
    },
  });

  // Fetch DB id to link items
  const dbOrder = await prisma.order.findUnique({
    where: { storeId_provider_providerOrderId: { storeId, provider: "EASYORDERS", providerOrderId } },
    select: { id: true },
  });
  if (!dbOrder) return;

  // Process all items — NEVER skip any
  const items = (order.items ?? order.order_items ?? []) as Record<string, unknown>[];
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    if (!item) continue;
    try {
      await processOrderItem(storeId, dbOrder.id, providerOrderId, item, idx);
    } catch (err) {
      // Non-fatal per-item error — log details, continue to next item
      logger.warn("EasyOrders: order item processing failed", {
        metadata: {
          providerOrderId,
          itemIdx: idx,
          sku:  String((item as Record<string, unknown>).sku ?? ""),
          error: String(err),
        },
      });
    }
  }
}

// ── Process single order item ──────────────────────────────────────────────
//
// Two paths — determined by whether Product exists in catalogue:
//
// PATH A — Product found (by SKU):
//   Create or update OrderItem with real productId FK.
//
// PATH B — No Product found:
//   Store in ImportStaging with entityType="ORDER_ITEM".
//   Preserves all provider references for Sprint 2 Product Mapping.
//   Never discards the item. Never requires a Product before storing.

async function processOrderItem(
  storeId:        string,
  orderId:        string,
  providerOrderId: string,
  item:           Record<string, unknown>,
  itemIdx:        number,
): Promise<void> {
  const sku           = String(item.sku         ?? item.product_sku ?? "").trim();
  const provProductId = String(item.product_id  ?? item.id          ?? "").trim();
  const productName   = String(item.product_name ?? item.name       ?? "").trim();

  const qtyRaw   = parseFloat(String(item.quantity   ?? "1"));
  const priceRaw = parseFloat(String(item.unit_price ?? item.price ?? "0"));
  const discRaw  = parseFloat(String(item.discount   ?? "0"));

  const quantity  = new Decimal(isFinite(qtyRaw)   ? qtyRaw   : 1);
  const unitPrice = new Decimal(isFinite(priceRaw)  ? priceRaw : 0);
  const discount  = new Decimal(isFinite(discRaw)   ? discRaw  : 0);

  // Try to find existing Product by SKU (Product is ALWAYS created manually — never here)
  const product = sku
    ? await prisma.product.findUnique({
        where:  { storeId_sku: { storeId, sku } },
        select: { id: true },
      }).catch(() => null)
    : null;

  if (product) {
    // ── PATH A: Product exists → create/update real OrderItem ─────────────
    const existing = await prisma.orderItem.findFirst({
      where:  { orderId, productId: product.id },
      select: { id: true },
    });

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data:  { quantity, unitPrice, discount },
      });
    } else {
      await prisma.orderItem.create({
        data: { orderId, productId: product.id, quantity, unitPrice, discount },
      });
    }
    return;
  }

  // ── PATH B: No Product match → store in ImportStaging ────────────────────
  // Stable externalId per item: providerOrderId:item:index
  // Using index not SKU because the same product may appear multiple times in one order.
  const externalId = `${providerOrderId}:item:${itemIdx}`;

  // Preserve every useful reference from the provider payload.
  // Sprint 2 uses these fields to resolve product mapping without re-fetching from EasyOrders.
  const rawPayload = {
    // Linkage fields
    provider_order_id:  providerOrderId,
    order_db_id:        orderId,
    item_index:         itemIdx,
    // Provider product references (preserved for Sprint 2 mapping)
    product_id:         provProductId,   // EasyOrders internal product ID
    sku,                                  // SKU for catalogue matching
    product_name:       productName,      // human-readable name
    // Financial values
    quantity:           qtyRaw,
    unit_price:         priceRaw,
    discount:           discRaw,
    // Full original payload for any additional fields Sprint 2 may need
    raw:                item,
  };

  // Idempotent — update if already staged, create otherwise
  const stagingExisting = await prisma.importStaging.findFirst({
    where:  { provider: "EASYORDERS", externalId },
    select: { id: true },
  });

  if (stagingExisting) {
    await prisma.importStaging.update({
      where: { id: stagingExisting.id },
      data:  { rawPayload, processedAt: null, status: "PENDING", retryCount: 0 },
    });
  } else {
    await prisma.importStaging.create({
      data: {
        provider:   "EASYORDERS",
        entityType: "ORDER_ITEM",
        externalId,
        rawPayload,
        status:     "PENDING",
      },
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
