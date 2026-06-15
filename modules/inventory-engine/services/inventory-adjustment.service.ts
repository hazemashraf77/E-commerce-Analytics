/**
 * Inventory adjustment service.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — INVENTORY ADJUSTMENTS,
 *             INVENTORY CORRECTIONS
 *
 * "Every adjustment requires: Reason, User, Timestamp, Audit Record." (008)
 * "Inventory Adjustments never overwrite historical movements." (008)
 * "Corrections never modify historical FIFO Layers directly." (008)
 */

import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db/prisma";
import { createLayer } from "../repositories/fifo-layer.repository";
import { recordMovement } from "../repositories/inventory-movement.repository";
import {
  emitInventoryEvent,
  buildInventoryEvent,
} from "../domain/inventory.events";
import type { AdjustmentType } from "../domain/inventory.types";
import { AppError } from "@/utils/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("InventoryAdjustmentService");

export interface RecordAdjustmentInput {
  storeId: string;
  productId: string;
  adjustmentType: AdjustmentType;
  quantity: number | string;    // positive = add stock, negative = remove stock
  unitCost: number | string;
  reason: string;
  userId: string;
  occurredAt: Date;
}

/**
 * Records a manual inventory adjustment.
 * Positive adjustments create a new FIFO layer for the added stock.
 * Negative adjustments record a MANUAL_ADJUSTMENT movement (reducing available layers).
 * Neither path modifies historical movements (008).
 */
export async function recordAdjustment(
  input: RecordAdjustmentInput,
): Promise<void> {
  const qty = new Decimal(input.quantity);
  const cost = new Decimal(input.unitCost);

  if (!input.reason || input.reason.trim().length === 0) {
    throw new AppError({
      code: "ADJUSTMENT_MISSING_REASON",
      message: "Inventory adjustment requires a documented reason (008_INVENTORY_FIFO_ENGINE).",
      severity: "HIGH",
    });
  }
  if (!input.userId) {
    throw new AppError({
      code: "ADJUSTMENT_MISSING_USER",
      message: "Inventory adjustment requires an authenticated user.",
      severity: "HIGH",
    });
  }

  await prisma.$transaction(async () => {
    if (qty.greaterThan(0)) {
      // Positive adjustment: new FIFO layer for added stock
      const layer = await createLayer({
        storeId: input.storeId,
        productId: input.productId,
        purchaseDate: input.occurredAt,
        purchaseQuantity: qty,
        unitCost: cost,
        purchaseReference: `ADJUSTMENT_${input.adjustmentType}`,
      });

      await recordMovement({
        productId: input.productId,
        layerId: layer.id,
        movementType: "MANUAL_ADJUSTMENT",
        quantity: qty,
        unitCost: cost,
        occurredAt: input.occurredAt,
      });
    } else {
      // Negative adjustment: movement with negative quantity
      await recordMovement({
        productId: input.productId,
        layerId: null,
        movementType:
          input.adjustmentType === "INVENTORY_CORRECTION"
            ? "INVENTORY_CORRECTION"
            : "MANUAL_ADJUSTMENT",
        quantity: qty,
        unitCost: cost,
        occurredAt: input.occurredAt,
      });
    }
  });

  await emitInventoryEvent(
    buildInventoryEvent("ADJUSTMENT_APPLIED", input.productId, input.storeId, {
      adjustmentType: input.adjustmentType,
      quantity: qty.toString(),
      userId: input.userId,
      reason: input.reason,
    }),
  );

  logger.info("Inventory adjustment recorded", {
    metadata: {
      productId: input.productId,
      type: input.adjustmentType,
      qty: qty.toString(),
      userId: input.userId,
    },
  });
}
