/**
 * Bosta Sync Service — Sprint 1
 *
 * Uses: POST https://app.bosta.co/api/v2/deliveries/search
 * Auth: Authorization: <API_KEY>  (no Bearer prefix — confirmed working)
 *
 * Schema compliance:
 * - Shipment fields validated against schema
 * - providerShipmentId @unique — handled via pre-check before create
 * - orderId @unique — one shipment per order
 * - recordsUpserted only increments on actual DB write
 */

import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import type { ShipmentStatus } from "@prisma/client";
import type { ProviderSyncResult } from "./sync-orchestrator.service";

const logger = createLogger("SyncBosta");
const BOSTA_BASE = "https://app.bosta.co/api/v2";

const STATE_CODE_MAP: Record<number, ShipmentStatus> = {
  10: "CREATED", 20: "PICKED_UP", 30: "IN_TRANSIT",
  40: "OUT_FOR_DELIVERY", 41: "OUT_FOR_DELIVERY",
  45: "DELIVERY_FAILED", 47: "EXPECTED_RETURN", 49: "DELIVERY_FAILED",
  60: "DELIVERED", 65: "DELIVERED",
  70: "RETURNED", 75: "RETURNED",
  80: "CANCELLED",
};

const STATE_VALUE_MAP: Record<string, ShipmentStatus> = {
  "Created": "CREATED", "Picked Up": "PICKED_UP",
  "In Transit": "IN_TRANSIT",
  "Out For Delivery": "OUT_FOR_DELIVERY", "Out for Delivery": "OUT_FOR_DELIVERY",
  "Delivered": "DELIVERED",
  "Delivery Failed": "DELIVERY_FAILED", "Failed": "DELIVERY_FAILED",
  "Expected Return": "EXPECTED_RETURN",
  "Returned": "RETURNED", "Cancelled": "CANCELLED",
};

interface BostaSearchResponse {
  success: boolean;
  data?: { list?: BostaDelivery[]; count?: number };
  message?: string;
}

interface BostaDelivery {
  _id?: string;
  trackingNumber?: string;
  businessReference?: string;
  type?: { code?: number; value?: string };
  state?: { code?: number; value?: string; childState?: string };
  cod?: number;
  cashOnDelivery?: number;
  pricing?: { total?: number; cod?: number; fees?: number; codFees?: number };
  attemptsCount?: number;
  numberOfAttempts?: number;
  deliveryTime?: string;
  createdAt?: string;
  updatedAt?: string;
  receiver?: {
    firstName?: string; lastName?: string; phone?: string;
    city?: { name?: string; nameAr?: string }; zone?: string; district?: string;
  };
  dropOffAddress?: { city?: { name?: string }; zone?: string };
  exception?: string;
  lastExceptionCode?: string;
}

export async function syncBosta(
  mode: string,
): Promise<Omit<ProviderSyncResult, "provider" | "durationMs">> {
  const env = getServerEnv();

  if (!env.BOSTA_API_KEY) {
    logger.warn("Bosta sync skipped — BOSTA_API_KEY missing");
    return { status: "skipped_missing_credentials", recordsFetched: 0, recordsUpserted: 0, errorMessage: "BOSTA_API_KEY not set" };
  }

  const store = await prisma.store.findFirst({ select: { id: true } }).catch(() => null);
  if (!store) {
    logger.error("Bosta sync: no store found in DB");
    return { status: "failed", recordsFetched: 0, recordsUpserted: 0, errorMessage: "No store record" };
  }

  const allOrders = await prisma.order.findMany({
    where: { storeId: store.id },
    select: { id: true, providerOrderId: true },
  }).catch(() => [] as { id: string; providerOrderId: string }[]);
  const orderByRef = new Map(allOrders.map(o => [o.providerOrderId, o.id]));

  let recordsFetched = 0;
  let recordsUpserted = 0;
  let page = 0;
  const pageSize = 100;

  try {
    while (true) {
      logger.info("Bosta: fetching deliveries page", { metadata: { page, pageSize } });

      const res = await fetch(`${BOSTA_BASE}/deliveries/search`, {
        method: "POST",
        headers: {
          "Authorization": env.BOSTA_API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ page, pageSize }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Bosta API ${res.status}: ${text.slice(0, 300)}`);
      }

      const json = await res.json() as BostaSearchResponse;
      if (!json.success) {
        throw new Error(`Bosta API returned success=false: ${json.message ?? "unknown"}`);
      }

      const deliveries: BostaDelivery[] = json.data?.list ?? [];
      if (deliveries.length === 0) break;

      recordsFetched += deliveries.length;

      for (const d of deliveries) {
        try {
          const wrote = await processDelivery(store.id, d, orderByRef);
          if (wrote) recordsUpserted++;
        } catch (err) {
          logger.error("Bosta: failed to process delivery", {
            metadata: { tracking: d.trackingNumber ?? d._id, error: String(err) },
          });
        }
      }

      const total = json.data?.count ?? 0;
      if ((page + 1) * pageSize >= total || deliveries.length < pageSize) break;
      page++;
      await sleep(200);
    }

    await prisma.syncState.upsert({
      where: { storeId_provider_scope: { storeId: store.id, provider: "BOSTA", scope: "shipments" } },
      update: { lastCursor: new Date().toISOString(), lastSyncAt: new Date(), status: "IDLE" },
      create: { storeId: store.id, provider: "BOSTA", scope: "shipments", lastCursor: new Date().toISOString(), lastSyncAt: new Date(), status: "IDLE" },
    }).catch((e) => logger.warn("SyncState upsert failed", { metadata: { error: String(e) } }));

    logger.info("Bosta sync complete", { metadata: { recordsFetched, recordsUpserted } });
    return { status: "success", recordsFetched, recordsUpserted };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Bosta sync failed", { metadata: { errorMessage } });
    await prisma.syncState.upsert({
      where: { storeId_provider_scope: { storeId: store.id, provider: "BOSTA", scope: "shipments" } },
      update: { status: "FAILED" },
      create: { storeId: store.id, provider: "BOSTA", scope: "shipments", status: "FAILED" },
    }).catch(() => {});
    return { status: "failed", recordsFetched, recordsUpserted, errorMessage };
  }
}

async function processDelivery(
  storeId: string,
  d: BostaDelivery,
  orderByRef: Map<string, string>,
): Promise<boolean> {
  const trackingNumber = d.trackingNumber ?? d._id ?? "";
  if (!trackingNumber) throw new Error("Delivery has no trackingNumber or _id");

  const stateCode = typeof d.state?.code === "number" ? d.state.code : undefined;
  const stateValue = d.state?.value ?? "";
  const shipmentStatus: ShipmentStatus =
    (stateCode != null ? STATE_CODE_MAP[stateCode] : undefined) ??
    STATE_VALUE_MAP[stateValue] ??
    "CREATED";

  const shippingCostRaw = d.pricing?.total ?? d.pricing?.fees ?? 0;
  const actualShippingCost = new Decimal(isFinite(shippingCostRaw) ? shippingCostRaw : 0);

  const codRaw = d.cod ?? d.cashOnDelivery ?? d.pricing?.cod ?? 0;
  const codAmount = new Decimal(isFinite(codRaw) ? codRaw : 0);

  const shippingZone =
    d.receiver?.city?.name ??
    d.receiver?.zone ??
    d.dropOffAddress?.city?.name ??
    null;

  const deliveryDate = parseDate(d.deliveryTime ?? null);

  const businessRef = (d.businessReference ?? "").trim();
  const orderId = businessRef ? (orderByRef.get(businessRef) ?? null) : null;

  let didWrite = false;

  if (orderId) {
    const byOrder    = await prisma.shipment.findUnique({ where: { orderId }, select: { id: true, providerShipmentId: true } });
    const byTracking = await prisma.shipment.findUnique({ where: { providerShipmentId: trackingNumber }, select: { id: true, orderId: true } });

    if (byOrder) {
      await prisma.shipment.update({
        where: { id: byOrder.id },
        data: { providerShipmentId: trackingNumber, shipmentStatus, shippingZone: shippingZone ?? undefined, deliveryDate: deliveryDate ?? undefined, actualShippingCost, codAmount, syncedAt: new Date() },
      });
      didWrite = true;
    } else if (!byTracking) {
      await prisma.shipment.create({
        data: { orderId, providerShipmentId: trackingNumber, shipmentStatus, shippingZone: shippingZone ?? undefined, deliveryDate: deliveryDate ?? undefined, actualShippingCost, codAmount, syncedAt: new Date() },
      });
      didWrite = true;
    } else {
      logger.warn("Bosta: trackingNumber already linked to different order — skipping create", {
        metadata: { trackingNumber, existingOrderId: byTracking.orderId, incomingOrderId: orderId },
      });
    }

    if (didWrite) {
      await prisma.order.update({ where: { id: orderId }, data: { shipmentStatus } }).catch(() => {});
    }
  }

  // Audit trail — always store raw payload in ImportStaging
  const stagingExisting = await prisma.importStaging.findFirst({
    where: { provider: "BOSTA", externalId: trackingNumber },
    select: { id: true },
  });
  if (stagingExisting) {
    await prisma.importStaging.update({ where: { id: stagingExisting.id }, data: { rawPayload: d as object, processedAt: new Date() } });
  } else {
    await prisma.importStaging.create({ data: { provider: "BOSTA", entityType: "SHIPMENT", externalId: trackingNumber, rawPayload: d as object, status: "PENDING" } });
  }

  return didWrite;
}

function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
