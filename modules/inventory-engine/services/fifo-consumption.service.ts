/**
 * FIFO consumption service.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — FIFO ALLOCATION PROCESS,
 *             PARTIAL CONSUMPTION, COMPLETE CONSUMPTION, NEGATIVE INVENTORY
 *
 * This service handles steps 1–6 of the documented FIFO allocation:
 *   1. Identify product
 *   2. Locate oldest active layer
 *   3. Consume available quantity
 *   4. Continue to next layer if required
 *   5. Record inventory movement
 *   6. Record FIFO consumption  ← emits event consumed by Financial Engine (step 7)
 *
 * CRITICAL: This service does NOT calculate cost.
 * Cost calculation (FIFO Cost = qty × unitCost) belongs to the Financial Engine.
 * This service exposes layerUnitCost in the emitted event so the Financial Engine
 * can perform that multiplication — zero financial logic here (ER-001, CP-003).
 */

import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db/prisma";
import {
  getActiveLayers,
  updateLayerRemainingQuantity,
} from "../repositories/fifo-layer.repository";
import { recordMovement } from "../repositories/inventory-movement.repository";
import {
  emitInventoryEvent,
  buildInventoryEvent,
  type LayerConsumedPayload,
} from "../domain/inventory.events";
import { assertSufficientStock, sortLayersFifo, isLayerActive } from "../domain/inventory.rules";
import { computeAvailableQuantity } from "../domain/inventory.rules";
import type { LayerConsumptionRecord } from "../domain/inventory.types";
import { AppError } from "@/utils/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("FifoConsumptionService");

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface ConsumeInventoryInput {
  productId: string;
  storeId: string;
  quantity: number | string;
  orderItemId: string;
  orderId: string;
  occurredAt: Date;
}

export interface ConsumptionResult {
  consumed: LayerConsumptionRecord[];
  totalQuantityConsumed: Decimal;
}

// ── Service ────────────────────────────────────────────────────────────────

/**
 * Consumes inventory in FIFO order for a delivered order item.
 * Called by the Sync Engine after order status reaches DELIVERED (BR-005).
 *
 * Executes inside a transaction to prevent partial consumption (006: TRANSACTION POLICY).
 * Emits LAYER_CONSUMED event per layer touched — Financial Engine subscribes.
 */
export async function consumeInventoryFifo(
  input: ConsumeInventoryInput,
): Promise<ConsumptionResult> {
  const requestedQty = new Decimal(input.quantity);

  logger.info("FIFO consumption requested", {
    metadata: {
      productId: input.productId,
      orderId: input.orderId,
      qty: requestedQty.toString(),
    },
  });

  // Step 1 & 2: Identify product + locate oldest active layers
  const activeLayers = await getActiveLayers(input.productId, input.storeId);
  const orderedLayers = sortLayersFifo(activeLayers.filter(isLayerActive));

  // Pre-flight: assert sufficient stock (008: NEGATIVE INVENTORY)
  const totalAvailable = computeAvailableQuantity(orderedLayers);
  assertSufficientStock(totalAvailable, requestedQty, input.productId);

  const consumed: LayerConsumptionRecord[] = [];
  let remaining = requestedQty;

  const result = await prisma.$transaction(async () => {
    // Step 3 & 4: Consume across layers
    for (const layer of orderedLayers) {
      if (remaining.lessThanOrEqualTo(0)) break;

      const canTake = Decimal.min(layer.remainingQuantity, remaining);
      const newRemaining = layer.remainingQuantity.minus(canTake);

      // Update layer remaining (only mutable field — 008)
      await updateLayerRemainingQuantity(layer.id, newRemaining);

      // Step 5: Record inventory movement
      await recordMovement({
        productId: input.productId,
        layerId: layer.id,
        movementType: "SALE",
        quantity: canTake,
        unitCost: layer.unitCost, // stored for audit — not calculated here
        orderItemId: input.orderItemId,
        relatedOrderId: input.orderId,
        occurredAt: input.occurredAt,
      });

      // Step 6: Record consumption trace
      const record: LayerConsumptionRecord = {
        layerId: layer.id,
        productId: input.productId,
        quantityConsumed: canTake,
        orderItemId: input.orderItemId,
        orderId: input.orderId,
      };
      consumed.push(record);

      remaining = remaining.minus(canTake);
    }

    return consumed;
  });

  // Step 7: Emit events for each layer consumed (Financial Engine subscribes)
  for (const record of result) {
    const layer = orderedLayers.find((l) => l.id === record.layerId)!;
    const payload: LayerConsumedPayload = {
      ...record,
      layerUnitCost: layer.unitCost,
      layerPurchaseDate: layer.purchaseDate,
    };
    await emitInventoryEvent(
      buildInventoryEvent<LayerConsumedPayload>(
        "LAYER_CONSUMED",
        input.productId,
        input.storeId,
        payload,
      ),
    );
  }

  logger.info("FIFO consumption complete", {
    metadata: {
      productId: input.productId,
      orderId: input.orderId,
      layersTouched: result.length,
      totalConsumed: requestedQty.toString(),
    },
  });

  return { consumed: result, totalQuantityConsumed: requestedQty };
}
