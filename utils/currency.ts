/**
 * Currency formatting utility — presentation only (ER-002).
 *
 * No default currency is hardcoded (ER-006: no magic business values).
 * The authoritative currency originates from the Store canonical entity
 * (004_CANONICAL_DATA_MODEL.md, Entity 001) and is passed by callers.
 * All financial AMOUNTS are produced exclusively by the Financial
 * Engine; this helper merely renders them.
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = "en",
): string {
  if (!Number.isFinite(amount)) {
    throw new Error(`formatCurrency received a non-finite amount: ${String(amount)}`);
  }
  if (!currency) {
    throw new Error("formatCurrency requires an explicit ISO 4217 currency code.");
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
