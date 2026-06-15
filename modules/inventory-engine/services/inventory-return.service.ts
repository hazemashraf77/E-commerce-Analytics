/**
 * Inventory return service.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — PHYSICAL RETURNS, FIFO RESTORATION,
 *             DAMAGED RETURNS
 *             002_BUSINESS_RULES.md — BR-013 (physical return restores inventory),
 *             BR-014 (expected returns never restore inventory)
 *
 * "Only physically received returned products restore inventory." (BR-013)
 * "Expected Returns never restore inventory." (BR-014)
 * No cost recalculation here — Financial Adjustment is a separate event (008 workflow).
 */

import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db/prisma";
import {
  getLayerById,
  createLayer,
  updateLayerRemainingQuantity,
} from "../repositories/fifo-layer.repository";
import { recordMovement } from "../repositories/inventory-movement.repository";
import {
  emitInventoryEvent,
  buildInventoryEvent,
} from "../domain/inventory.events";
import { assertPhysicalReturn } from "../domain/inventory.rules";
import type { ReturnRequest } from "../domain/inventory.types";
import { AppError } from "@/utils/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("InventoryReturnService");

export interface ProcessReturnInput extends ReturnRequest {
  storeId: string;
  occurredAt: Date;
}

export interface ReturnResult {
  restoredToLayerId: string;
  quantityRestored: Decimal;
  newLayer?: boolean; // true when original layer unavailable and new layer created
}

/**
 * Processes a physically confirmed return (008: PHYSICAL RETURNS workflow).
 *
 * Restoration order per 008: FIFO RESTORATION:
 *  1. If originalLayerId provided and layer identifiable → restore to original
 *  2. If original layer unavailable → create new layer at original cost
 *  3. Damaged condition → skip restoration, record loss movement (008: DAMAGED RETURNS)
 */
export async function processPhysicalReturn(
  input: ProcessReturnInput,
): Promise<ReturnResult> {
  const qty = new Decimal(input.quantity);

  assertPhysicalReturn(input);

  if (input.condition === "DAMAGED") {
    // Damaged goods do NOT become available inventory (008: DAMAGED RETURNS)
    await recordMovement({
      productId: input.productId,
      layerId: null,
      movementType: "PHYSICAL_RETURN",
      quantity: qty.negated(), // negative: loss
      unitCost: new Decimal(0), // cost is zero for damaged write-off
      relatedOrderId: input.orderId,
      occurredAt: input.occurredAt,
    });

    await emitInventoryEvent(
      buildInventoryEvent("MOVEMENT_RECORDED", input.productId, input.storeId, {
        type: "DAMAGED_RETURN",
        orderId: input.orderId,
      }),
    );

    logger.warn("Damaged return recorded — inventory NOT restored", {
      metadata: { orderId: input.orderId, productId: input.productId },
    });

    // Return a sentinel value — no layer restored
    return {
      restoredToLayerId: "DAMAGED_NO_RESTORE",
      quantityRestored: new Decimal(0),
    };
  }

  // Attempt original layer restoration (008: FIFO RESTORATION)
  if (input.originalLayerId) {
    const originalLayer = await getLayerById(input.originalLayerId);
    if (originalLayer && !originalLayer.isDeleted) {
      const result = await prisma.$transaction(async () => {
        const newRemaining = originalLayer.remainingQuantity.plus(qty);
        await updateLayerRemainingQuantity(originalLayer.id, newRemaining);

        await recordMovement({
          productId: input.productId,
          layerId: originalLayer.id,
          movementType: "PHYSICAL_RETURN",
          quantity: qty,
          unitCost: originalLayer.unitCost,
          relatedOrderId: input.orderId,
          occurredAt: input.occurredAt,
        });

        return originalLayer.id;
      });

      await emitInventoryEvent(
        buildInventoryEvent("LAYER_RESTORED", input.productId, input.storeId, {
          layerId: result,
          quantityRestored: qty.toString(),
          orderId: input.orderId,
        }),
      );

      logger.info("Inventory restored to original FIFO layer", {
        metadata: { layerId: result, qty: qty.toString() },
      });

      return { restoredToLayerId: result, quantityRestored: qty };
    }
  }

  // Original layer unavailable — create new layer at documented cost fallback
  // unitCost falls back to zero pending Financial Adjustment (008: if restoration impossible)
  const fallbackCost = new Decimal(0);
  const newLayerId = await prisma.$transaction(async () => {
    const newLayer = await createLayer({
      storeId: input.storeId,
      productId: input.productId,
      purchaseDate: input.occurredAt,
      purchaseQuantity: qty,
      unitCost: fallbackCost,
      purchaseReference: `RETURN_FROM_ORDER_${input.orderId}`,
    });

    await recordMovement({
      productId: input.productId,
      layerId: newLayer.id,
      movementType: "PHYSICAL_RETURN",
      quantity: qty,
      unitCost: fallbackCost,
      relatedOrderId: input.orderId,
      occurredAt: input.occurredAt,
    });

    return newLayer.id;
  });

  logger.info("Return inventory placed in new FIFO layer (original unavailable)", {
    metadata: { newLayerId, orderId: input.orderId },
  });

  return { restoredToLayerId: newLayerId, quantityRestored: qty, newLayer: true };
}
