import { format, parseISO, isValid } from "date-fns";

/**
 * Deterministic date utilities (CP-010). Presentation helpers only —
 * business date semantics (recognition dates, settlement dates) belong
 * to Business Engines, never to utilities (ER-001).
 */

export const ISO_DATE_FORMAT = "yyyy-MM-dd";

export function formatIsoDate(date: Date): string {
  return format(date, ISO_DATE_FORMAT);
}

export function parseIsoDate(value: string): Date {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    throw new Error(`Invalid ISO date string: "${value}"`);
  }
  return parsed;
}
