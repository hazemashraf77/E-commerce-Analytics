/**
 * Production Sync Service.
 * Orchestrates full and incremental synchronization from EasyOrders and Bosta.
 *
 * Pipeline: Provider API → Validate → Map to Canonical → Upsert DB
 *
 * Rules:
 * - Sync Engine never calculates business values (013_SYNCHRONIZATION_ENGINE)
 * - Sync is idempotent — safe to re-run
 * - Always use Bosta for actual shipping cost (never estimate)
 * - Sync state tracked per provider+scope for incremental support
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import { getServerEnv, isIntegrationEnabled } from "@/lib/env";
import { EasyOrdersClient } from "@/adapters/eazy-order/client/eazy-order.client";
import { BostaClient } from "@/adapters/bosta/client/bosta.client";
import { mapEazyOrderToCanonical } from "@/adapters/eazy-order/mappers/eazy-order.mapper";
import { mapBostaShipmentToCanonical, mapBostaSettlementToCanonical } from "@/adapters/bosta/mappers/bosta.mapper";
import type { ShipmentStatus } from "@prisma/client";

const logger = createLogger("SyncService");

// Active sync locks (per store+provider+scope)
const activeSyncs = new Set<string>();

export interface SyncResult {
  provider: string;
  scope: string;
  status: "completed" | "failed" | "skipped";
  recordsProcessed: number;
  recordsFailed: number;
  errors: string[];
  durationMs: number;
  syncJobId?: string;
}

export interface SyncOptions {
  storeId: string;
  fullSync?: boolean;            // true = ignore cursor, fetch everything
  providers?: Array<"EAZY_ORDER" | "BOSTA">;
  triggeredBy?: "MANUAL" | "SCHEDULER" | "WEBHOOK" | "API";
}

/**
 * Main sync entry point. Called by:
 * - POST /api/v1/sync (manual)
 * - /api/cron/sync (scheduled)
 * - Webhook handlers (incremental)
 */
export async function runSync(options: SyncOptions): Promise<SyncResult[]> {
  const { storeId, fullSync = false, triggeredBy = "MANUAL" } = options;
  const providers = options.providers ?? ["EAZY_ORDER", "BOSTA"];

  logger.info("Sync started", { metadata: { storeId, providers, fullSync, triggeredBy } });

  const results: SyncResult[] = [];

  if (providers.includes("EAZY_ORDER")) {
  logger.info("EasyOrders scheduled sync skipped — webhooks are source of truth", {
    metadata: { storeId },
  });

  results.push({
    provider: "EASYORDERS",
    scope: "orders",
    status: "skipped",
    recordsProcessed: 0,
    recordsFailed: 0,
    errors: ["EasyOrders uses webhooks; list-orders API is not available."],
    durationMs: 0,
  });
}

  if (providers.includes("BOSTA") && isIntegrationEnabled("BOSTA")) {
    const bostaShipmentResult = await syncBostaShipments(storeId, fullSync);
results.push(bostaShipmentResult);
  } else if (providers.includes("BOSTA")) {
    logger.warn("Bosta sync skipped — credentials not configured", { metadata: { storeId } });
    results.push({ provider: "BOSTA", scope: "shipments", status: "skipped", recordsProcessed: 0, recordsFailed: 0, errors: ["Credentials not configured"], durationMs: 0 });
  }

  logger.info("Sync complete", {
    metadata: { storeId, results: results.map(r => ({ provider: r.provider, status: r.status, records: r.recordsProcessed })) },
  });

  return results;
}

// ── EasyOrders Sync ────────────────────────────────────────────────────────

async function syncEasyOrders(storeId: string, fullSync: boolean): Promise<SyncResult> {
  const lockKey = `EAZY_ORDER:orders:${storeId}`;
  if (activeSyncs.has(lockKey)) {
    return { provider: "EASYORDERS", scope: "orders", status: "skipped", recordsProcessed: 0, recordsFailed: 0, errors: ["Already running"], durationMs: 0 };
  }
  activeSyncs.add(lockKey);
  const startMs = Date.now();
  let recordsProcessed = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  // Create sync job record
  const syncJob = await prisma.syncJob.create({
    data: { storeId, provider: "EASYORDERS", status: "RUNNING", startedAt: new Date() },
  }).catch(() => null);

  try {
    const env = getServerEnv();
    const client = new EasyOrdersClient(env.EAZY_ORDER_API_KEY!, env.EAZY_ORDER_STORE_URL!);

    // Get sync state for incremental
    const state = await getSyncState(storeId, "EAZY_ORDER", "orders");
    const updatedAfter = !fullSync && state?.lastCursor ? state.lastCursor : undefined;

    // Update state to RUNNING
    await upsertSyncState(storeId, "EAZY_ORDER", "orders", "RUNNING");

    let latestUpdatedAt: string | null = null;

    for await (const batch of client.fetchOrders({ updated_after: updatedAfter, per_page: 100 })) {
      for (const rawOrder of batch) {
        try {
          const { order, items } = mapEazyOrderToCanonical(rawOrder, storeId);

          // Track latest updated_at for next incremental sync cursor
          if (rawOrder.updated_at && (!latestUpdatedAt || rawOrder.updated_at > latestUpdatedAt)) {
            latestUpdatedAt = rawOrder.updated_at;
          }

          // Upsert order (idempotent)
          await prisma.order.upsert({
            where: { storeId_provider_providerOrderId: { storeId, provider: "EASYORDERS", providerOrderId: order.providerOrderId } },
            update: {
              orderStatus:    order.orderStatus,
              paymentStatus:  order.paymentStatus,
              syncedAt:       new Date(),
            },
            create: {
              storeId:            order.storeId,
              provider:           "EASYORDERS",
              providerOrderId:    order.providerOrderId,
              orderDate:          order.orderDate,
              customerShippingFee:order.customerShippingFee,
              paymentMethod:      order.paymentMethod,
              paymentStatus:      order.paymentStatus,
              orderStatus:        order.orderStatus,
              marketingSource:    order.marketingSource ?? undefined,
              syncedAt:           new Date(),
            },
          });

          // Upsert order items
          const dbOrder = await prisma.order.findUnique({
            where: { storeId_provider_providerOrderId: { storeId, provider: "EASYORDERS", providerOrderId: order.providerOrderId } },
            select: { id: true },
          });

          if (dbOrder) {
            for (const item of items) {
              // Find or create product reference
              const product = await prisma.product.findFirst({
                where: { storeId, externalId: item.productId },
                select: { id: true },
              });

              if (!product) {
                // Upsert product placeholder — full product sync fills details
                await prisma.product.upsert({
                  where: { storeId_externalId: { storeId, externalId: item.productId } },
                  update: {},
                  create: {
                    storeId,
                    externalId:  item.productId,
                    name:        item.productId, // will be updated by product sync
                    status:      "ACTIVE",
                    syncedAt:    new Date(),
                  },
                });
              }

              const productRecord = await prisma.product.findFirst({
                where: { storeId, externalId: item.productId },
                select: { id: true },
              });
              if (!productRecord) continue;

              await prisma.orderItem.upsert({
                where: { orderId_productId: { orderId: dbOrder.id, productId: productRecord.id } },
                update: { quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount },
                create: {
                  orderId:    dbOrder.id,
                  productId:  productRecord.id,
                  quantity:   item.quantity,
                  unitPrice:  item.unitPrice,
                  discount:   item.discount,
                },
              });
            }
          }

          recordsProcessed++;
        } catch (err) {
          const msg = `Failed to process order ${rawOrder.id}: ${String(err)}`;
          logger.error(msg, { metadata: { storeId, orderId: rawOrder.id } });
          errors.push(msg);
          recordsFailed++;
        }
      }
    }

    // Update sync state cursor
    await upsertSyncState(storeId, "EAZY_ORDER", "orders", "IDLE", latestUpdatedAt ?? new Date().toISOString());

    // Update sync job
    if (syncJob) {
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: { status: "COMPLETED", completedAt: new Date(), recordsSynced: recordsProcessed, recordsFailed, errorMessage: errors.length > 0 ? errors.slice(0, 3).join("; ") : null },
      }).catch(() => {});
    }

    return { provider: "EASYORDERS", scope: "orders", status: "completed", recordsProcessed, recordsFailed, errors, durationMs: Date.now() - startMs };
  } catch (err) {
    const msg = `EasyOrders sync failed: ${String(err)}`;
    logger.error(msg, { metadata: { storeId } });
    await upsertSyncState(storeId, "EAZY_ORDER", "orders", "FAILED").catch(() => {});
    if (syncJob) {
      await prisma.syncJob.update({ where: { id: syncJob.id }, data: { status: "FAILED", completedAt: new Date(), errorMessage: msg } }).catch(() => {});
    }
    return { provider: "EASYORDERS", scope: "orders", status: "failed", recordsProcessed, recordsFailed, errors: [msg], durationMs: Date.now() - startMs };
  } finally {
    activeSyncs.delete(lockKey);
  }
}

// ── Bosta Shipments Sync ───────────────────────────────────────────────────

async function syncBostaShipments(storeId: string, fullSync: boolean): Promise<SyncResult> {
  const lockKey = `BOSTA:shipments:${storeId}`;
  if (activeSyncs.has(lockKey)) {
    return { provider: "BOSTA", scope: "shipments", status: "skipped", recordsProcessed: 0, recordsFailed: 0, errors: ["Already running"], durationMs: 0 };
  }
  activeSyncs.add(lockKey);
  const startMs = Date.now();
  let recordsProcessed = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  const syncJob = await prisma.syncJob.create({
    data: { storeId, provider: "BOSTA", status: "RUNNING", startedAt: new Date() },
  }).catch(() => null);

  try {
    const env = getServerEnv();
    const client = new BostaClient(env.BOSTA_API_KEY!);

    const state = await getSyncState(storeId, "BOSTA", "shipments");
    const updatedAfter = !fullSync && state?.lastCursor ? state.lastCursor : undefined;
    await upsertSyncState(storeId, "BOSTA", "shipments", "RUNNING");

    // Build provider order ID → internal DB order ID map for this store
    const orders = await prisma.order.findMany({
      where: { storeId, provider: "EASYORDERS" },
      select: { id: true, providerOrderId: true },
    });
    const orderIdMap = new Map(orders.map(o => [o.providerOrderId, o.id]));

    let latestUpdatedAt: string | null = null;

    for await (const batch of client.fetchDeliveries({ updatedAfter, pageSize: 100 })) {
      for (const rawShipment of batch) {
        try {
          // Track cursor
          if (rawShipment.updatedAt && (!latestUpdatedAt || rawShipment.updatedAt > latestUpdatedAt)) {
            latestUpdatedAt = rawShipment.updatedAt;
          }

          // Resolve order reference robustly.
          // Bosta payloads are not stable: the merchant EasyOrders id may appear as
          // businessReference, order_id, reference, merchantReferenceNumber, or nested metadata.
          const merchantRef = resolveBostaMerchantReference(rawShipment);
          const orderId = merchantRef ? orderIdMap.get(merchantRef) : undefined;

          if (!orderId) {
            logger.warn("Bosta shipment skipped — matching EasyOrders order not found", {
              metadata: {
                tracking: getBostaTrackingNumber(rawShipment),
                merchantRef,
                candidateRefs: getBostaReferenceCandidates(rawShipment),
              },
            });
            continue;
          }

          const shipmentStatus = resolveBostaShipmentStatus(rawShipment);
          const providerShipmentId = getBostaTrackingNumber(rawShipment);
          const deliveryDate = resolveBostaDeliveryDate(rawShipment, shipmentStatus);
          const returnDate = resolveBostaReturnDate(rawShipment, shipmentStatus);
          const shippingZone = resolveBostaShippingZone(rawShipment);

          // Extract actual shipping cost — always from Bosta (Source of Truth: 005)
          const actualCost = getNumberDeep(rawShipment, [
            "pricing.total",
            "pricing.fees",
            "pricing.shippingFees",
            "shippingFees",
            "shippingCost",
            "actualShippingCost",
          ]);
          const codAmount = getNumberDeep(rawShipment, [
            "pricing.cod",
            "pricing.cod_amount",
            "pricing.cashOnDelivery",
            "cod",
            "cashOnDelivery",
            "amount",
          ]);

          await prisma.shipment.upsert({
            where: { orderId },
            update: {
              providerShipmentId,
              shipmentStatus,
              shippingZone:       shippingZone ?? undefined,
              deliveryDate:       deliveryDate ?? undefined,
              returnDate:         returnDate ?? undefined,
              actualShippingCost: actualCost,
              codAmount,
              syncedAt:           new Date(),
            },
            create: {
              orderId,
              providerShipmentId,
              shipmentStatus,
              shippingZone:       shippingZone ?? undefined,
              deliveryDate:       deliveryDate ?? undefined,
              returnDate:         returnDate ?? undefined,
              actualShippingCost: actualCost,
              codAmount,
              syncedAt:           new Date(),
            },
          });

          // Update order shipment status to match Bosta
          await prisma.order.update({
            where: { id: orderId },
            data: { shipmentStatus },
          }).catch(() => {}); // non-fatal if order doesn't exist yet

          recordsProcessed++;
        } catch (err) {
          const msg = `Failed to process shipment ${rawShipment._id}: ${String(err)}`;
          logger.error(msg, { metadata: { storeId, shipmentId: rawShipment._id } });
          errors.push(msg);
          recordsFailed++;
        }
      }
    }

    await upsertSyncState(storeId, "BOSTA", "shipments", "IDLE", latestUpdatedAt ?? new Date().toISOString());
    if (syncJob) {
      await prisma.syncJob.update({ where: { id: syncJob.id }, data: { status: "COMPLETED", completedAt: new Date(), recordsSynced: recordsProcessed, recordsFailed } }).catch(() => {});
    }

    return { provider: "BOSTA", scope: "shipments", status: "completed", recordsProcessed, recordsFailed, errors, durationMs: Date.now() - startMs };
  } catch (err) {
    const msg = `Bosta shipment sync failed: ${String(err)}`;
    logger.error(msg, { metadata: { storeId } });
    await upsertSyncState(storeId, "BOSTA", "shipments", "FAILED").catch(() => {});
    if (syncJob) {
      await prisma.syncJob.update({ where: { id: syncJob.id }, data: { status: "FAILED", completedAt: new Date(), errorMessage: msg } }).catch(() => {});
    }
    return { provider: "BOSTA", scope: "shipments", status: "failed", recordsProcessed, recordsFailed, errors: [msg], durationMs: Date.now() - startMs };
  } finally {
    activeSyncs.delete(lockKey);
  }
}

// ── Bosta Settlements Sync ─────────────────────────────────────────────────

async function syncBostaSettlements(storeId: string, fullSync: boolean): Promise<SyncResult> {
  const lockKey = `BOSTA:settlements:${storeId}`;
  if (activeSyncs.has(lockKey)) {
    return { provider: "BOSTA", scope: "settlements", status: "skipped", recordsProcessed: 0, recordsFailed: 0, errors: ["Already running"], durationMs: 0 };
  }
  activeSyncs.add(lockKey);
  const startMs = Date.now();
  let recordsProcessed = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  try {
    const env = getServerEnv();
    const client = new BostaClient(env.BOSTA_API_KEY!);

    const from = !fullSync
      ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : undefined;

    for await (const batch of client.fetchSettlements({ from })) {
      for (const rawSettlement of batch) {
        try {
          const settlement = mapBostaSettlementToCanonical(rawSettlement);
          const settlementId = rawSettlement.settlement_id ?? rawSettlement._id ?? crypto.randomUUID();

          await prisma.settlement.upsert({
            where: { providerSettlementId: settlementId },
            update: {
              actualAmount:     settlement.actualAmount,
              status:           "RECEIVED",
              netTransfer:      settlement.netTransfer,
            },
            create: {
              storeId,
              providerSettlementId: settlementId,
              settlementDate:   settlement.settlementDate,
              expectedAmount:   settlement.expectedAmount,
              actualAmount:     settlement.actualAmount,
              shippingCharges:  settlement.shippingCharges,
              returnCharges:    settlement.returnCharges,
              exchangeCharges:  settlement.exchangeCharges,
              additionalCharges:settlement.additionalCharges,
              netTransfer:      settlement.netTransfer,
              status:           "RECEIVED",
            },
          });
          recordsProcessed++;
        } catch (err) {
          const msg = `Failed to process settlement ${rawSettlement.settlement_id}: ${String(err)}`;
          errors.push(msg);
          recordsFailed++;
        }
      }
    }

    return { provider: "BOSTA", scope: "settlements", status: "completed", recordsProcessed, recordsFailed, errors, durationMs: Date.now() - startMs };
  } catch (err) {
    const msg = `Bosta settlement sync failed: ${String(err)}`;
    logger.error(msg, { metadata: { storeId } });
    return { provider: "BOSTA", scope: "settlements", status: "failed", recordsProcessed, recordsFailed, errors: [msg], durationMs: Date.now() - startMs };
  } finally {
    activeSyncs.delete(lockKey);
  }
}

// ── Sync state helpers ─────────────────────────────────────────────────────

async function getSyncState(storeId: string, provider: string, scope: string) {
  return prisma.syncState.findUnique({
    where: { storeId_provider_scope: { storeId, provider, scope } },
  }).catch(() => null);
}

async function upsertSyncState(storeId: string, provider: string, scope: string, status: string, cursor?: string) {
  return prisma.syncState.upsert({
    where: { storeId_provider_scope: { storeId, provider, scope } },
    update: { status, ...(cursor ? { lastCursor: cursor, lastSyncAt: new Date() } : {}) },
    create: { storeId, provider, scope, status, lastCursor: cursor, lastSyncAt: cursor ? new Date() : undefined },
  }).catch(() => null);
}

/**
 * Sync a single order by provider ID (triggered by webhook).
 */
export async function syncSingleOrder(storeId: string, providerOrderId: string): Promise<void> {
  if (!isIntegrationEnabled("EAZY_ORDER")) return;

  const env = getServerEnv();
  const client = new EasyOrdersClient(env.EAZY_ORDER_API_KEY!, env.EAZY_ORDER_STORE_URL!);

  try {
    const rawOrder = await client.fetchOrder(providerOrderId);
    const { order, items } = mapEazyOrderToCanonical(rawOrder, storeId);

    await prisma.order.upsert({
      where: { storeId_provider_providerOrderId: { storeId, provider: "EASYORDERS", providerOrderId } },
      update: { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus, syncedAt: new Date() },
      create: {
        storeId, provider: "EASYORDERS", providerOrderId: order.providerOrderId,
        orderDate: order.orderDate, customerShippingFee: order.customerShippingFee,
        paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus, marketingSource: order.marketingSource ?? undefined,
        syncedAt: new Date(),
      },
    });

    logger.info("Single order synced", { metadata: { storeId, providerOrderId } });
  } catch (err) {
    logger.error("Single order sync failed", { metadata: { storeId, providerOrderId, error: String(err) } });
    throw err;
  }
}

/**
 * Sync a single shipment by Bosta tracking number (triggered by webhook).
 */
export async function syncSingleShipment(storeId: string, trackingNumber: string): Promise<void> {
  if (!isIntegrationEnabled("BOSTA")) return;

  const env = getServerEnv();
  const client = new BostaClient(env.BOSTA_API_KEY!);

  try {
    const rawShipment = await client.fetchDelivery(trackingNumber);
    const merchantRef = resolveBostaMerchantReference(rawShipment);

    const order = await prisma.order.findFirst({
      where: { storeId, provider: "EASYORDERS", providerOrderId: merchantRef },
      select: { id: true },
    });
    if (!order) {
      logger.warn("Shipment order not found — triggering order sync", {
        metadata: { storeId, merchantRef, trackingNumber, candidateRefs: getBostaReferenceCandidates(rawShipment) },
      });
      return;
    }

    const actualCost = getNumberDeep(rawShipment, [
      "pricing.total",
      "pricing.fees",
      "pricing.shippingFees",
      "shippingFees",
      "shippingCost",
      "actualShippingCost",
    ]);
    const codAmount = getNumberDeep(rawShipment, [
      "pricing.cod",
      "pricing.cod_amount",
      "pricing.cashOnDelivery",
      "cod",
      "cashOnDelivery",
      "amount",
    ]);
    const status = resolveBostaShipmentStatus(rawShipment);
    const deliveryDate = resolveBostaDeliveryDate(rawShipment, status);
    const returnDate = resolveBostaReturnDate(rawShipment, status);

    await prisma.shipment.upsert({
      where: { orderId: order.id },
      update: {
        providerShipmentId: getBostaTrackingNumber(rawShipment) || trackingNumber,
        shipmentStatus: status,
        deliveryDate: deliveryDate ?? undefined,
        returnDate: returnDate ?? undefined,
        actualShippingCost: actualCost,
        codAmount,
        syncedAt: new Date(),
      },
      create: {
        orderId: order.id,
        providerShipmentId: getBostaTrackingNumber(rawShipment) || trackingNumber,
        shipmentStatus: status,
        deliveryDate: deliveryDate ?? undefined,
        returnDate: returnDate ?? undefined,
        actualShippingCost: actualCost,
        codAmount,
        syncedAt: new Date(),
      },
    });

    await prisma.order.update({ where: { id: order.id }, data: { shipmentStatus: status } }).catch(() => {});

    logger.info("Single shipment synced", { metadata: { storeId, trackingNumber } });
  } catch (err) {
    logger.error("Single shipment sync failed", { metadata: { storeId, trackingNumber, error: String(err) } });
    throw err;
  }
}


// ── Bosta payload helpers ─────────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function firstStringDeep(source: unknown, keys: string[]): string | null {
  const seen = new Set<unknown>();

  function walk(value: unknown): string | null {
    if (!value || typeof value !== "object" || seen.has(value)) return null;
    seen.add(value);
    const obj = value as Record<string, unknown>;

    for (const key of keys) {
      const direct = obj[key];
      if (typeof direct === "string" && direct.trim()) return direct.trim();
      if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
    }

    for (const child of Object.values(obj)) {
      const found = walk(child);
      if (found) return found;
    }

    return null;
  }

  return walk(source);
}

function getBostaReferenceCandidates(rawShipment: unknown): string[] {
  const keys = [
    "businessReference",
    "business_reference",
    "merchantReference",
    "merchant_reference",
    "merchantReferenceNumber",
    "merchant_reference_number",
    "reference",
    "referenceNumber",
    "reference_number",
    "orderReference",
    "order_reference",
    "orderId",
    "order_id",
    "merchantOrderId",
    "merchant_order_id",
    "merchantOrderNumber",
    "merchant_order_number",
  ];

  const values = new Set<string>();
  const seen = new Set<unknown>();

  function walk(value: unknown) {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    const obj = value as Record<string, unknown>;

    for (const key of keys) {
      const current = obj[key];
      if ((typeof current === "string" && current.trim()) || typeof current === "number") {
        values.add(String(current).trim());
      }
    }

    for (const child of Object.values(obj)) walk(child);
  }

  walk(rawShipment);
  return [...values].filter(Boolean);
}

function resolveBostaMerchantReference(rawShipment: unknown): string {
  const candidates = getBostaReferenceCandidates(rawShipment);

  // Prefer UUID-looking refs because EasyOrders providerOrderId in this project is UUID.
  const uuid = candidates.find((v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v));
  if (uuid) return uuid;

  return candidates[0] ?? "";
}

function getBostaTrackingNumber(rawShipment: unknown): string {
  return firstStringDeep(rawShipment, [
    "trackingNumber",
    "tracking_number",
    "trackingNo",
    "tracking_no",
    "awb",
    "_id",
    "id",
  ]) ?? crypto.randomUUID();
}

function getNumberDeep(source: unknown, paths: string[]): number {
  for (const path of paths) {
    const value = getPath(source, path);
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function getStateCode(rawShipment: unknown): number | null {
  const raw = asRecord(rawShipment);
  const state = raw.state;

  if (typeof state === "number") return state;
  if (state && typeof state === "object") {
    const code = (state as Record<string, unknown>).code;
    if (typeof code === "number") return code;
    if (typeof code === "string" && Number.isFinite(Number(code))) return Number(code);
  }

  const code = raw.stateCode ?? raw.statusCode ?? raw.code;
  if (typeof code === "number") return code;
  if (typeof code === "string" && Number.isFinite(Number(code))) return Number(code);

  return null;
}

function getStateText(rawShipment: unknown): string {
  const raw = asRecord(rawShipment);
  const state = raw.state;
  const parts: string[] = [];

  if (typeof state === "string") parts.push(state);
  if (state && typeof state === "object") {
    const obj = state as Record<string, unknown>;
    for (const key of ["value", "name", "label", "childState", "status"]) {
      const value = obj[key];
      if (typeof value === "string") parts.push(value);
    }
  }

  for (const key of ["status", "shipmentStatus", "stateValue", "stateName", "statusName"]) {
    const value = raw[key];
    if (typeof value === "string") parts.push(value);
  }

  return parts.join(" ").toLowerCase();
}

function resolveBostaShipmentStatus(rawShipment: unknown): ShipmentStatus {
  const code = getStateCode(rawShipment);
  if (code != null && BOSTA_STATE_MAP[code] != null) {
    return BOSTA_STATE_MAP[code] as ShipmentStatus;
  }

  const text = getStateText(rawShipment);

  if (text.includes("delivered") || text.includes("success") || text.includes("تم بنجاح") || text.includes("تم التسليم")) {
    return "DELIVERED";
  }
  if (text.includes("return") || text.includes("returned") || text.includes("مرتجع") || text.includes("استرجاع")) {
    return "RETURNED";
  }
  if (text.includes("cancel") || text.includes("terminated") || text.includes("ملغي") || text.includes("إلغاء")) {
    return "CANCELLED";
  }
  if (text.includes("failed") || text.includes("refused") || text.includes("reject") || text.includes("فشل") || text.includes("رفض")) {
    return "DELIVERY_FAILED";
  }
  if (text.includes("out for delivery") || text.includes("مندوب") || text.includes("خارج للتسليم")) {
    return "OUT_FOR_DELIVERY";
  }
  if (text.includes("picked") || text.includes("received") || text.includes("hub")) {
    return "PICKED_UP";
  }
  if (text.includes("transit") || text.includes("قيد")) {
    return "IN_TRANSIT";
  }

  return "CREATED";
}

function resolveBostaDeliveryDate(rawShipment: unknown, status: ShipmentStatus): Date | null {
  const date =
    parseDate(getPath(rawShipment, "deliveryDate")) ??
    parseDate(getPath(rawShipment, "delivery_date")) ??
    parseDate(getPath(rawShipment, "deliveredAt")) ??
    parseDate(getPath(rawShipment, "delivered_at")) ??
    parseDate(getPath(rawShipment, "deliveryTime"));

  if (date) return date;
  if (status === "DELIVERED") {
    return parseDate(getPath(rawShipment, "updatedAt")) ?? parseDate(getPath(rawShipment, "updated_at")) ?? new Date();
  }
  return null;
}

function resolveBostaReturnDate(rawShipment: unknown, status: ShipmentStatus): Date | null {
  const date =
    parseDate(getPath(rawShipment, "returnDate")) ??
    parseDate(getPath(rawShipment, "return_date")) ??
    parseDate(getPath(rawShipment, "returnedAt")) ??
    parseDate(getPath(rawShipment, "returned_at"));

  if (date) return date;
  if (status === "RETURNED") {
    return parseDate(getPath(rawShipment, "updatedAt")) ?? parseDate(getPath(rawShipment, "updated_at")) ?? new Date();
  }
  return null;
}

function resolveBostaShippingZone(rawShipment: unknown): string | null {
  return firstStringDeep(rawShipment, ["zone", "district", "city", "name", "nameAr"]) ?? null;
}

import { BOSTA_STATE_MAP } from "@/adapters/bosta/types/bosta.types";
