import { Decimal } from "@prisma/client/runtime/library";
import type { TikTokRawCampaign, TikTokRawSpend } from "../types/tiktok.types";
import { TIKTOK_STATUS_MAP } from "../types/tiktok.types";
import type { CanonicalCampaign, CanonicalMarketingSpend } from "@/modules/synchronization-engine/types/adapter.types";
import type { EntityStatus } from "@prisma/client";

export function mapTikTokCampaignToCanonical(raw: TikTokRawCampaign, storeId: string): CanonicalCampaign {
  return {
    storeId,
    platform: "TIKTOK",
    platformCampaignId: raw.campaign_id,
    name: raw.campaign_name,
    objective: raw.objective_type ?? null,
    status: (TIKTOK_STATUS_MAP[raw.operation_status] ?? "ACTIVE") as EntityStatus,
    startDate: raw.create_time ? new Date(raw.create_time) : null,
    endDate: null,
    importedAt: new Date(),
  };
}

export function mapTikTokSpendToCanonical(raw: TikTokRawSpend, storeId: string): CanonicalMarketingSpend {
  return {
    storeId,
    platform: "TIKTOK",
    campaignId: null,
    spendDate: new Date(raw.stat_time_day),
    amount: new Decimal(raw.spend),
    currency: raw.currency,
    importedAt: new Date(),
  };
}
