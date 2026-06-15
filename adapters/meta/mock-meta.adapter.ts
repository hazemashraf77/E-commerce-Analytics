/** Mock Meta Ads Adapter (IR-001, CP-018). */
import type { IMarketingAdapter, SyncResult, FetchOptions, AdapterConfig, CanonicalCampaign, CanonicalMarketingSpend } from "@/modules/synchronization-engine/types/adapter.types";
import type { MetaRawCampaign, MetaRawSpend } from "./types/meta.types";
import { mapMetaCampaignToCanonical, mapMetaSpendToCanonical } from "./mappers/meta.mapper";
import { createLogger } from "@/lib/logger";
const logger = createLogger("MockMetaAdapter");

const MOCK_CAMPAIGNS: MetaRawCampaign[] = [
  { id: "META-CAMP-001", name: "Summer Collection 2024", objective: "CONVERSIONS", status: "ACTIVE",  start_time: "2024-01-01T00:00:00Z" },
  { id: "META-CAMP-002", name: "New Arrivals January",   objective: "TRAFFIC",      status: "PAUSED", start_time: "2024-01-10T00:00:00Z" },
];
const MOCK_SPEND: MetaRawSpend[] = [
  { campaign_id: "META-CAMP-001", date_start: "2024-01-10", spend: "350.00", currency: "EGP" },
  { campaign_id: "META-CAMP-001", date_start: "2024-01-11", spend: "420.00", currency: "EGP" },
  { campaign_id: "META-CAMP-002", date_start: "2024-01-12", spend: "180.00", currency: "EGP" },
];

export class MockMetaAdapter implements IMarketingAdapter {
  readonly provider = "META" as const;
  readonly storeId: string;
  constructor(config: AdapterConfig) { this.storeId = config.storeId; }
  async ping(): Promise<boolean> { return true; }
  async fetchCampaigns(_o: FetchOptions): Promise<SyncResult<CanonicalCampaign>> {
    logger.info("Mock Meta fetchCampaigns", { metadata: { storeId: this.storeId } });
    return { success: true, records: MOCK_CAMPAIGNS.map(c => mapMetaCampaignToCanonical(c, this.storeId)), totalFetched: MOCK_CAMPAIGNS.length, errors: [] };
  }
  async fetchSpend(_o: FetchOptions): Promise<SyncResult<CanonicalMarketingSpend>> {
    return { success: true, records: MOCK_SPEND.map(s => mapMetaSpendToCanonical(s, this.storeId)), totalFetched: MOCK_SPEND.length, errors: [] };
  }
}
