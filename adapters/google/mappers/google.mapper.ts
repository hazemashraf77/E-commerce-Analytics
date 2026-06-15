/**
 * Google Ads → Canonical mapper.
 * Repository: 073_API_INTEGRATION_BIBLE.md — GOOGLE INTEGRATION
 *             012_API_ARCHITECTURE.md — Adapters never calculate KPIs or Profit
 * Read-only. No financial calculations here.
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { GoogleRawCampaign, GoogleRawSpend } from "../types/google.types";
import { GOOGLE_STATUS_MAP } from "../types/google.types";
import type { CanonicalCampaign, CanonicalMarketingSpend } from "@/modules/synchronization-engine/types/adapter.types";

export function mapGoogleCampaignToCanonical(
  raw: GoogleRawCampaign,
  storeId: string,
): CanonicalCampaign {
  return {
    storeId,
    platform: "GOOGLE" as any,       // GOOGLE added as extension beyond v1 providers
    platformCampaignId: raw.campaign_id,
    name: raw.campaign_name,
    objective: raw.campaign_type ?? null,
    status: (GOOGLE_STATUS_MAP[raw.status] ?? "ACTIVE") as any,
    startDate: raw.start_date ? new Date(raw.start_date) : null,
    endDate:   raw.end_date   ? new Date(raw.end_date)   : null,
    importedAt: new Date(),
  };
}

export function mapGoogleSpendToCanonical(
  raw: GoogleRawSpend,
  storeId: string,
): CanonicalMarketingSpend {
  // Google reports cost in micros; divide by 1_000_000 for actual currency amount
  const costMicros = parseInt(raw.cost_micros ?? "0", 10);
  const amount = new Decimal(costMicros).dividedBy(1_000_000);

  return {
    storeId,
    platform: "GOOGLE" as any,
    campaignId: null,
    spendDate: new Date(raw.date),
    amount,
    currency: raw.currency_code,
    importedAt: new Date(),
  };
}
