import { Decimal } from "@prisma/client/runtime/library";
import type { MetaRawCampaign, MetaRawSpend } from "../types/meta.types";
import { META_STATUS_MAP } from "../types/meta.types";
import type { CanonicalCampaign, CanonicalMarketingSpend } from "@/modules/synchronization-engine/types/adapter.types";
import type { EntityStatus } from "@prisma/client";

export function mapMetaCampaignToCanonical(raw: MetaRawCampaign, storeId: string): CanonicalCampaign {
  return {
    storeId,
    platform: "META",
    platformCampaignId: raw.id,
    name: raw.name,
    objective: raw.objective ?? null,
    status: (META_STATUS_MAP[raw.status] ?? "ACTIVE") as EntityStatus,
    startDate: raw.start_time ? new Date(raw.start_time) : null,
    endDate: raw.stop_time ? new Date(raw.stop_time) : null,
    importedAt: new Date(),
  };
}

export function mapMetaSpendToCanonical(raw: MetaRawSpend, storeId: string): CanonicalMarketingSpend {
  return {
    storeId,
    platform: "META",
    campaignId: null,
    spendDate: new Date(raw.date_start),
    amount: new Decimal(raw.spend),
    currency: raw.currency,
    importedAt: new Date(),
  };
}
