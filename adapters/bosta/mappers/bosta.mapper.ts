/**
 * Bosta → Canonical Shipment / Settlement mapper.
 * Repository: 004_CANONICAL_DATA_MODEL.md — Entity 006, Entity 010
 *             005_SOURCE_OF_TRUTH_MATRIX.md — Actual Shipping Cost, Shipment Status → Bosta
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { BostaRawShipment, BostaRawSettlement } from "../types/bosta.types";
import { BOSTA_STATE_MAP } from "../types/bosta.types";
import type { CanonicalShipment, CanonicalSettlement } from "@/modules/synchronization-engine/types/adapter.types";
import type { ShipmentStatus } from "@prisma/client";

export function mapBostaShipmentToCanonical(
  raw: BostaRawShipment,
  orderIdMap: Map<string, string>, // providerOrderId → internal Order UUID
): CanonicalShipment | null {
  const orderId = orderIdMap.get(raw.order_id);
  if (!orderId) return null; // order not yet imported — will retry

  const status = (BOSTA_STATE_MAP[raw.state] ?? "CREATED") as ShipmentStatus;

  return {
    orderId,
    providerShipmentId: raw._id,
    shipmentStatus: status,
    shippingZone: raw.zone ?? null,
    deliveryDate: raw.delivery_date ? new Date(raw.delivery_date) : null,
    returnDate: raw.return_date ? new Date(raw.return_date) : null,
    actualShippingCost: new Decimal(raw.pricing.total), // SoT: Bosta (005)
    codAmount: new Decimal(raw.pricing.cod_amount),
    settlementId: null,
    syncedAt: new Date(),
  };
}

export function mapBostaSettlementToCanonical(
  raw: BostaRawSettlement,
): CanonicalSettlement {
  return {
    providerSettlementId: raw.settlement_id,
    settlementDate: new Date(raw.date),
    expectedAmount: new Decimal(raw.expected_amount),
    actualAmount: new Decimal(raw.actual_amount),
    shippingCharges: new Decimal(raw.charges.shipping),
    returnCharges: new Decimal(raw.charges.returns),
    exchangeCharges: new Decimal(raw.charges.exchanges),
    additionalCharges: new Decimal(raw.charges.additional),
    netTransfer: new Decimal(raw.net_transfer),
    status: "RECEIVED",
    importedAt: new Date(),
  };
}
