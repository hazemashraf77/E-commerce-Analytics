/**
 * Allocation Engine — Sprint 2A
 *
 * Pure functions. No DB. No side effects.
 *
 * Distributes shared order-level values across line items.
 * Sprint 1 already stored OrderItem rows with quantity / unitPrice / discount.
 * Sprint 2A adds the rules for handling orders with multiple products and
 * multiple quantities so analytics can attribute revenue and cost correctly.
 *
 * Allocation method: proportional to gross line subtotal (quantity * unitPrice).
 *
 * Three things get allocated:
 *   1. Order-level discount (rarely used; per-item discount stays per-item)
 *   2. Customer shipping fee  (revenue offset; can be allocated for per-product accounting)
 *   3. Shared shipping/return costs from Bosta (single shipment per order)
 */

export interface LineInput {
  lineId:    string;
  quantity:  number;
  unitPrice: number;
  discount:  number;
}

export interface LineAllocation {
  lineId:           string;
  grossSubtotal:    number;          // qty * unitPrice
  netSubtotal:      number;          // gross - discount
  proportion:       number;          // 0–1 share of order
  allocatedShare:   number;          // share of the allocatedAmount
}

/**
 * Distribute `amount` across `lines` proportionally to each line's net subtotal.
 *
 * Returns an array with one entry per input line. The sum of allocatedShare
 * equals `amount` (within floating-point rounding).
 *
 * If all lines have zero net subtotal, falls back to equal split.
 */
export function allocateProportional(
  lines: LineInput[],
  amount: number,
): LineAllocation[] {
  const subtotals = lines.map((l) => {
    const gross = (isFinite(l.quantity) ? l.quantity : 0) * (isFinite(l.unitPrice) ? l.unitPrice : 0);
    const disc  = isFinite(l.discount) ? l.discount : 0;
    return { lineId: l.lineId, gross, net: Math.max(0, gross - disc) };
  });

  const totalNet = subtotals.reduce((s, x) => s + x.net, 0);

  if (totalNet <= 0) {
    // Fallback: equal split
    const share = amount / Math.max(1, lines.length);
    return subtotals.map((s) => ({
      lineId:         s.lineId,
      grossSubtotal:  s.gross,
      netSubtotal:    s.net,
      proportion:     1 / lines.length,
      allocatedShare: share,
    }));
  }

  return subtotals.map((s) => {
    const proportion = s.net / totalNet;
    return {
      lineId:         s.lineId,
      grossSubtotal:  s.gross,
      netSubtotal:    s.net,
      proportion,
      allocatedShare: amount * proportion,
    };
  });
}

/**
 * Compute order net total from its lines.
 */
export function computeOrderNetTotal(lines: LineInput[]): number {
  return lines.reduce((s, l) => {
    const gross = (l.quantity || 0) * (l.unitPrice || 0);
    return s + Math.max(0, gross - (l.discount || 0));
  }, 0);
}

/**
 * Per-item cost helper.
 * unitCost is the manual product cost OR FIFO unit cost.
 * packagingCost is per-unit packaging.
 * Returns the total line cost (unit * qty + packaging * qty).
 */
export function computeLineCost(
  quantity: number,
  unitCost: number,
  packagingCost: number,
): number {
  const q  = isFinite(quantity)      ? quantity      : 0;
  const uc = isFinite(unitCost)      ? unitCost      : 0;
  const pc = isFinite(packagingCost) ? packagingCost : 0;
  return q * uc + q * pc;
}
