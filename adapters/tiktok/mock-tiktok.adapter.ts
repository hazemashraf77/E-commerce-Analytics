/** Mock TikTok Ads Adapter (IR-001, CP-018). */

import type {
  IMarketingAdapter,
  SyncResult,
  FetchOptions,
  AdapterConfig,
  CanonicalCampaign,
  CanonicalMarketingSpend,
} from "@/modules/synchronization-engine/types/adapter.types";
import type { TikTokRawCampaign, TikTokRawSpend } from "./types/tiktok.types";
import { mapTikTokCampaignToCanonical, mapTikTokSpendToCanonical } from "./mappers/tiktok.mapper";
import { createLogger } from "@/lib/logger";

const logger = createLogger("MockTikTokAdapter");

const MOCK_CAMPAIGNS: TikTokRawCampaign[] = [
  {
    campaign_id: "TT-CAMP-001",
    campaign_name: "TikTok Winter Drop",
    objective_type: "CONVERSIONS",
    operation_status: "ENABLE",
    create_time: "2024-01-05T00:00:00Z",
  },
];

const MOCK_SPEND: TikTokRawSpend[] = [
  { campaign_id: "TT-CAMP-001", stat_time_day: "2024-01-10", spend: 275, currency: "EGP" },
  { campaign_id: "TT-CAMP-001", stat_time_day: "2024-01-11", spend: 310, currency: "EGP" },
];

export class MockTikTokAdapter implements IMarketingAdapter {
  readonly provider = "TIKTOK" as const;
  readonly storeId: string;

  constructor(config: AdapterConfig) {
    this.storeId = config.storeId;
  }

  async ping(): Promise<boolean> { return true; }

  async fetchCampaigns(_o: FetchOptions): Promise<SyncResult<CanonicalCampaign>> {
    logger.info("Mock TikTok fetchCampaigns", { metadata: { storeId: this.storeId } });
    const records = MOCK_CAMPAIGNS.map((c) => mapTikTokCampaignToCanonical(c, this.storeId));
    return { success: true, records, totalFetched: records.length, errors: [] };
  }

  async fetchSpend(_o: FetchOptions): Promise<SyncResult<CanonicalMarketingSpend>> {
    const records = MOCK_SPEND.map((s) => mapTikTokSpendToCanonical(s, this.storeId));
    return { success: true, records, totalFetched: records.length, errors: [] };
  }
}
