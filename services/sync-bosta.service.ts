/**
 * Bosta Sync Service — repaired linking version
 *
 * Root fix:
 * - Bosta deliveries can expose merchant reference under different raw keys,
 *   not only `businessReference`.
 * - We resolve the EasyOrders providerOrderId from multiple possible fields,
 *   including nested payload fields.
 * - We always store raw payload in ImportStaging for audit/debug.
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
  10: "CREATED",
  20: "PICKED_UP",
  30: "IN_TRANSIT",
  40: "OUT_FOR_DELIVERY",
  41: "OUT_FOR_DELIVERY",
  45: "DELIVERY_FAILED",
  47: "EXPECTED_RETURN",
  49: "DELIVERY_FAILED",
  60: "DELIVERED",
  65: "DELIVERED",
  70: "RETURNED",
  75: "RETURNED",
  80: "CANCELLED",
};

const STATE_VALUE_MAP: Record<string, ShipmentStatus> = {
  Created: "CREATED",
  "Picked Up": "PICKED_UP",
  "In Transit": "IN_TRANSIT",
  "Out For Delivery": "OUT_FOR_DELIVERY",
  "Out for Delivery": "OUT_FOR_DELIVERY",
  Delivered: "DELIVERED",
  "تم بنجاح": "DELIVERED",
  "Delivery Failed": "DELIVERY_FAILED",
  Failed: "DELIVERY_FAILED",
  "Expected Return": "EXPECTED_RETURN",
  Returned: "RETURNED",
  Cancelled: "CANCELLED",
  Canceled: "CANCELLED",
};

interface BostaSearchResponse {
  success: boolean;
  data?: { list?: BostaDelivery[]; count?: number };
  message?: string;
}

interface BostaDelivery {
  _id?: string;
  id?: string;
  trackingNumber?: string;
  tracking_number?: string;
  businessReference?: string;
  business_reference?: string;
  merchantReference?: string;
  merchant_reference?: string;
  merchantOrderId?: string;
  merchant_order_id?: string;
  orderId?: string;
  order_id?: string;
  reference?: string;
  type?: { code?: number; value?: string };
  state?: { code?: number; value?: string; childState?: string };
  cod?: number;
  cashOnDelivery?: number;
  pricing?: { total?: number; cod?: number; fees?: number; codFees?: number; cod_amount?: number; cashOnDelivery?: number };
  attemptsCount?: number;
  numberOfAttempts?: number;
  deliveryTime?: string;
  delivery_time?: string;
  deliveredAt?: string;
  delivered_at?: string;
  createdAt?: string;
  updatedAt?: string;
  receiver?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: { name?: string; nameAr?: string };
    zone?: string;
    district?: string;
  };
  dropOffAddress?: { city?: { name?: string }; zone?: string };
  exception?: string;
  lastExceptionCode?: string;
  [key: string]: unknown;
}

export async function syncBosta(
  mode: string,
): Promise<Omit<ProviderSyncResult, "provider" | "durationMs">> {
  const env = getServerEnv();

  if (!env.BOSTA_API_KEY) {
    logger.warn("Bosta sync skipped — BOSTA_API_KEY missing");
    return {
      status: "skipped_missing_credentials",
      recordsFetched: 0,
      recordsUpserted: 0,
      errorMessage: "BOSTA_API_KEY not set",
    };
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

  const orderByRef = new Map<string, string>();
  for (const order of allOrders) {
    for (const key of refVariants(order.providerOrderId)) {
      orderByRef.set(key, order.id);
    }
  }

  let recordsFetched = 0;
  let recordsUpserted = 0;
  let page = 0;
  const pageSize = 100;

  try {
    while (true) {
      logger.info("Bosta: fetching deliveries page", { metadata: { page, pageSize, mode } });

      const res = await fetch(`${BOSTA_BASE}/deliveries/search`, {
        method: "POST",
        headers: {
          Authorization: env.BOSTA_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ page, pageSize }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Bosta API ${res.status}: ${text.slice(0, 500)}`);
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
            metadata: { tracking: getTrackingNumber(d), error: String(err) },
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
      create: {
        storeId: store.id,
        provider: "BOSTA",
        scope: "shipments",
        lastCursor: new Date().toISOString(),
        lastSyncAt: new Date(),
        status: "IDLE",
      },
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
  const trackingNumber = getTrackingNumber(d);
  if (!trackingNumber) throw new Error("Delivery has no trackingNumber or _id");

  const stateCode = typeof d.state?.code === "number" ? d.state.code : undefined;
  const stateValue = d.state?.value ?? "";
  const shipmentStatus: ShipmentStatus =
    (stateCode != null ? STATE_CODE_MAP[stateCode] : undefined) ??
    STATE_VALUE_MAP[stateValue] ??
    "CREATED";

  const shippingCostRaw = d.pricing?.total ?? d.pricing?.fees ?? 0;
  const actualShippingCost = new Decimal(Number.isFinite(Number(shippingCostRaw)) ? Number(shippingCostRaw) : 0);

  const codRaw = d.cod ?? d.cashOnDelivery ?? d.pricing?.cod ?? d.pricing?.cod_amount ?? d.pricing?.cashOnDelivery ?? 0;
  const codAmount = new Decimal(Number.isFinite(Number(codRaw)) ? Number(codRaw) : 0);

  const shippingZone =
    d.receiver?.city?.name ??
    d.receiver?.zone ??
    d.dropOffAddress?.city?.name ??
    null;

  const deliveryDate = parseDate(
    d.deliveryTime ??
    d.delivery_time ??
    d.deliveredAt ??
    d.delivered_at ??
    (shipmentStatus === "DELIVERED" ? d.updatedAt : null),
  );

  const returnDate = shipmentStatus === "RETURNED" || shipmentStatus === "EXPECTED_RETURN"
    ? parseDate(d.updatedAt ?? d.deliveryTime ?? d.delivery_time ?? null)
    : null;

  const businessRef = resolveBusinessReference(d);
  const orderId = businessRef ? (orderByRef.get(normalizeRef(businessRef)) ?? null) : null;

  let didWrite = false;

  if (orderId) {
    const byOrder = await prisma.shipment.findUnique({
      where: { orderId },
      select: { id: true, providerShipmentId: true },
    });

    const byTracking = await prisma.shipment.findUnique({
      where: { providerShipmentId: trackingNumber },
      select: { id: true, orderId: true },
    });

    if (byOrder) {
      await prisma.shipment.update({
        where: { id: byOrder.id },
        data: {
          providerShipmentId: trackingNumber,
          shipmentStatus,
          shippingZone: shippingZone ?? undefined,
          deliveryDate: deliveryDate ?? undefined,
          returnDate: returnDate ?? undefined,
          actualShippingCost,
          codAmount,
          syncedAt: new Date(),
        },
      });
      didWrite = true;
    } else if (!byTracking) {
      await prisma.shipment.create({
        data: {
          orderId,
          providerShipmentId: trackingNumber,
          shipmentStatus,
          shippingZone: shippingZone ?? undefined,
          deliveryDate: deliveryDate ?? undefined,
          returnDate: returnDate ?? undefined,
          actualShippingCost,
          codAmount,
          syncedAt: new Date(),
        },
      });
      didWrite = true;
    } else if (byTracking.orderId === orderId) {
      await prisma.shipment.update({
        where: { id: byTracking.id },
        data: {
          shipmentStatus,
          shippingZone: shippingZone ?? undefined,
          deliveryDate: deliveryDate ?? undefined,
          returnDate: returnDate ?? undefined,
          actualShippingCost,
          codAmount,
          syncedAt: new Date(),
        },
      });
      didWrite = true;
    } else {
      logger.warn("Bosta: trackingNumber already linked to different order — skipping create", {
        metadata: { trackingNumber, existingOrderId: byTracking.orderId, incomingOrderId: orderId, businessRef },
      });
    }

    if (didWrite) {
      await prisma.order.update({
        where: { id: orderId },
        data: { shipmentStatus },
      }).catch(() => {});
    }
  } else {
    logger.warn("Bosta: order reference not found — staged only", {
      metadata: { trackingNumber, businessRef },
    });
  }

  await upsertImportStaging(trackingNumber, d);

  return didWrite;
}

async function upsertImportStaging(trackingNumber: string, d: BostaDelivery) {
  const stagingExisting = await prisma.importStaging.findFirst({
    where: { provider: "BOSTA", externalId: trackingNumber },
    select: { id: true },
  });

  if (stagingExisting) {
    await prisma.importStaging.update({
      where: { id: stagingExisting.id },
      data: { rawPayload: d as object, processedAt: new Date() },
    });
  } else {
    await prisma.importStaging.create({
      data: {
        provider: "BOSTA",
        entityType: "SHIPMENT",
        externalId: trackingNumber,
        rawPayload: d as object,
        status: "PENDING",
      },
    });
  }
}

function getTrackingNumber(d: BostaDelivery): string {
  return String(d.trackingNumber ?? d.tracking_number ?? d._id ?? d.id ?? "").trim();
}

function resolveBusinessReference(d: BostaDelivery): string | null {
  const direct =
    d.businessReference ??
    d.business_reference ??
    d.merchantReference ??
    d.merchant_reference ??
    d.merchantOrderId ??
    d.merchant_order_id ??
    d.orderId ??
    d.order_id ??
    d.reference;

  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const nested = findStringDeep(d, [
    "businessReference",
    "business_reference",
    "merchantReference",
    "merchant_reference",
    "merchantOrderId",
    "merchant_order_id",
    "orderId",
    "order_id",
    "reference",
    "merchantRef",
    "merchant_ref",
  ]);

  return nested;
}

function findStringDeep(source: unknown, keys: string[]): string | null {
  if (!source || typeof source !== "object") return null;
  const obj = source as Record<string, unknown>;

  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findStringDeep(value, keys);
      if (found) return found;
    }
  }

  return null;
}

function normalizeRef(value: string): string {
  return value.trim().toLowerCase();
}

function refVariants(value: string): string[] {
  const normalized = normalizeRef(value);
  return Array.from(new Set([
    normalized,
    normalized.replace(/^#/, ""),
    normalized.replace(/^order[-_]/, ""),
  ]));
}

function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
