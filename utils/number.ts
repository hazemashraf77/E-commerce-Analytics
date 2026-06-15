/**
 * Number formatting utilities — presentation only (ER-002).
 * Percentage VALUES (e.g. Delivery Rate) are calculated exclusively by
 * the Formula Engine; this helper renders an already-calculated ratio.
 */

export function formatNumber(value: number, locale: string = "en"): string {
  if (!Number.isFinite(value)) {
    throw new Error(`formatNumber received a non-finite value: ${String(value)}`);
  }
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(ratio: number, locale: string = "en", fractionDigits = 1): string {
  if (!Number.isFinite(ratio)) {
    throw new Error(`formatPercent received a non-finite ratio: ${String(ratio)}`);
  }
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(ratio);
}
