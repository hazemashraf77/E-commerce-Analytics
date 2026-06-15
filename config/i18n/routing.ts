import { defineRouting } from "next-intl/routing";

/**
 * Localization per 048_PROJECT_BOOTSTRAP.md and 020_ACCEPTANCE_CRITERIA.md:
 * English and Arabic, with RTL support handled in the locale layout.
 */
export const routing = defineRouting({
  locales: ["en", "ar"] as const,
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];

export const RTL_LOCALES: ReadonlySet<string> = new Set(["ar"]);

export function directionFor(locale: string): "ltr" | "rtl" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
