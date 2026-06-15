/**
 * Inventory Engine — public API.
 * Repository: 008_INVENTORY_FIFO_ENGINE.md — INVENTORY OWNERSHIP
 *
 * "Only Inventory Engine owns inventory." (008)
 * All external module access goes through this barrel.
 * Direct repository imports from outside this module are prohibited.
 */

// Domain types
export type {
  FifoLayer,
  ClosedFifoLayer,
  InventoryMovement,
  ProductAvailability,
  StockStatus,
  LayerConsumptionRecord,
  AdjustmentType,
  ReturnCondition,
  ReturnRequest,
  InventoryEvent,
  InventoryEventType,
} from "./domain/inventory.types";

export {
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_DEAD_STOCK_DAYS,
} from "./domain/inventory.types";

// Domain rules (read-only access for Financial Engine)
export {
  sortLayersFifo,
  assertSufficientStock,
  isLayerActive,
  isLayerClosed,
  computeAvailableQuantity,
  deriveStockStatus,
} from "./domain/inventory.rules";

// Events
export {
  onInventoryEvent,
  emitInventoryEvent,
  buildInventoryEvent,
} from "./domain/inventory.events";
export type { LayerConsumedPayload } from "./domain/inventory.events";

// Services (write path)
export { recordPurchase, recordOpeningBalance } from "./services/inventory-purchase.service";
export type { RecordPurchaseInput, RecordOpeningBalanceInput } from "./services/inventory-purchase.service";

export { consumeInventoryFifo } from "./services/fifo-consumption.service";
export type { ConsumeInventoryInput, ConsumptionResult } from "./services/fifo-consumption.service";

export { processPhysicalReturn } from "./services/inventory-return.service";
export type { ProcessReturnInput, ReturnResult } from "./services/inventory-return.service";

export { recordAdjustment } from "./services/inventory-adjustment.service";
export type { RecordAdjustmentInput } from "./services/inventory-adjustment.service";

// Repositories (read path — exposed for Analytics Engine / Dashboard)
export {
  getProductAvailability,
  getAllProductAvailabilities,
  getLowStockProducts,
  getLayerCountByProduct,
} from "./repositories/inventory-read.repository";

export {
  getActiveLayers,
  getAllLayers,
  getLayerById,
} from "./repositories/fifo-layer.repository";

export {
  getMovementsForProduct,
  getMovementsForLayer,
  getMovementsForOrder,
  getSaleMovementsForOrderItem,
} from "./repositories/inventory-movement.repository";
