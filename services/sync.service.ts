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
import type { SyncJobStatus } from "@prisma/client";

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

  if (providers.includes("EAZY_ORDER") && isIntegrationEnabled("EAZY_ORDER")) {
    results.push(await syncEasyOrders(storeId, fullSync));
  } else if (providers.includes("EAZY_ORDER")) {
    logger.warn("EasyOrders sync skipped — credentials not configured", { metadata: { storeId } });
    results.push({ provider: "EAZY_ORDER", scope: "orders", status: "skipped", recordsProcessed: 0, recordsFailed: 0, errors: ["Credentials not configured"], durationMs: 0 });
  }

  if (providers.includes("BOSTA") && isIntegrationEnabled("BOSTA")) {
    const bostaResults = await Promise.all([
      syncBostaShipments(storeId, fullSync),
      syncBostaSettlements(storeId, fullSync),
    ]);
    results.push(...bostaResults);
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
    return { provider: "EAZY_ORDER", scope: "orders", status: "skipped", recordsProcessed: 0, recordsFailed: 0, errors: ["Already running"], durationMs: 0 };
  }
  activeSyncs.add(lockKey);
  const startMs = Date.now();
  let recordsProcessed = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  // Create sync job record
  const syncJob = await prisma.syncJob.create({
    data: { storeId, provider: "EAZY_ORDER", status: "RUNNING", startedAt: new Date() },
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
            where: { storeId_providerOrderId: { storeId, providerOrderId: order.providerOrderId } },
            update: {
              orderStatus:    order.orderStatus,
              paymentStatus:  order.paymentStatus,
              syncedAt:       new Date(),
            },
            create: {
              storeId:            order.storeId,
              provider:           "EAZY_ORDER",
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
            where: { storeId_providerOrderId: { storeId, providerOrderId: order.providerOrderId } },
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

    return { provider: "EAZY_ORDER", scope: "orders", status: "completed", recordsProcessed, recordsFailed, errors, durationMs: Date.now() - startMs };
  } catch (err) {
    const msg = `EasyOrders sync failed: ${String(err)}`;
    logger.error(msg, { metadata: { storeId } });
    await upsertSyncState(storeId, "EAZY_ORDER", "orders", "FAILED").catch(() => {});
    if (syncJob) {
      await prisma.syncJob.update({ where: { id: syncJob.id }, data: { status: "FAILED", completedAt: new Date(), errorMessage: msg } }).catch(() => {});
    }
    return { provider: "EAZY_ORDER", scope: "orders", status: "failed", recordsProcessed, recordsFailed, errors: [msg], durationMs: Date.now() - startMs };
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
      where: { storeId, provider: "EAZY_ORDER" },
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

          // Resolve order reference (Bosta uses merchant's order ID as businessReference)
          const merchantRef = rawShipment.businessReference ?? rawShipment.order_id ?? "";
          const enrichedMap = new Map(orderIdMap);

          const shipment = mapBostaShipmentToCanonical(
            { ...rawShipment, order_id: merchantRef },
            enrichedMap,
          );

          if (!shipment) {
            // Order not found — skip (will be picked up in next sync after order sync)
            continue;
          }

          // Extract actual shipping cost — always from Bosta (Source of Truth: 005)
          const actualCost = rawShipment.pricing?.total ?? 0;
          const codAmount = rawShipment.pricing?.cod ?? rawShipment.pricing?.cod_amount ?? rawShipment.pricing?.cashOnDelivery ?? 0;

          await prisma.shipment.upsert({
            where: { orderId: shipment.orderId },
            update: {
              providerShipmentId: shipment.providerShipmentId,
              shipmentStatus:     shipment.shipmentStatus,
              deliveryDate:       shipment.deliveryDate ?? undefined,
              returnDate:         shipment.returnDate ?? undefined,
              actualShippingCost: actualCost,
              codAmount:          codAmount,
              syncedAt:           new Date(),
            },
            create: {
              orderId:            shipment.orderId,
              providerShipmentId: shipment.providerShipmentId,
              shipmentStatus:     shipment.shipmentStatus,
              shippingZone:       shipment.shippingZone ?? undefined,
              deliveryDate:       shipment.deliveryDate ?? undefined,
              returnDate:         shipment.returnDate ?? undefined,
              actualShippingCost: actualCost,
              codAmount:          codAmount,
              syncedAt:           new Date(),
            },
          });

          // Update order shipment status to match Bosta
          await prisma.order.update({
            where: { id: shipment.orderId },
            data: { shipmentStatus: shipment.shipmentStatus },
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
      where: { storeId_providerOrderId: { storeId, providerOrderId } },
      update: { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus, syncedAt: new Date() },
      create: {
        storeId, provider: "EAZY_ORDER", providerOrderId: order.providerOrderId,
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
    const merchantRef = rawShipment.businessReference ?? rawShipment.order_id ?? "";

    const order = await prisma.order.findFirst({
      where: { storeId, providerOrderId: merchantRef },
      select: { id: true },
    });
    if (!order) {
      logger.warn("Shipment order not found — triggering order sync", { metadata: { storeId, merchantRef } });
      return;
    }

    const actualCost = rawShipment.pricing?.total ?? 0;
    const codAmount = rawShipment.pricing?.cod ?? rawShipment.pricing?.cod_amount ?? 0;
    const status = (BOSTA_STATE_MAP[rawShipment.state] ?? "CREATED") as any;

    await prisma.shipment.upsert({
      where: { orderId: order.id },
      update: { shipmentStatus: status, actualShippingCost: actualCost, codAmount, syncedAt: new Date() },
      create: {
        orderId: order.id,
        providerShipmentId: rawShipment._id ?? trackingNumber,
        shipmentStatus: status,
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

import { BOSTA_STATE_MAP } from "@/adapters/bosta/types/bosta.types";
