/**
 * Google Ads raw types.
 * Repository: 073_API_INTEGRATION_BIBLE.md — GOOGLE INTEGRATION
 * Read-only. Platform never writes to Google.
 */

export interface GoogleRawCampaign {
  campaign_id: string;
  campaign_name: string;
  status: string;          // ENABLED | PAUSED | REMOVED
  campaign_type: string;
  start_date?: string;
  end_date?: string;
  bidding_strategy?: string;
}

export interface GoogleRawAdGroup {
  ad_group_id: string;
  campaign_id: string;
  ad_group_name: string;
  status: string;
  type: string;
}

export interface GoogleRawSpend {
  date: string;            // YYYY-MM-DD
  campaign_id: string;
  cost_micros: string;     // micros → divide by 1_000_000 for EGP
  currency_code: string;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value: number;
  cpa_micros?: string;
  roas?: number;
}

export interface GoogleRawKeyword {
  keyword_id: string;
  ad_group_id: string;
  keyword_text: string;
  match_type: string;
  status: string;
}

/** Google campaign status → canonical EntityStatus mapping */
export const GOOGLE_STATUS_MAP: Record<string, string> = {
  ENABLED: "ACTIVE",
  PAUSED:  "PAUSED",
  REMOVED: "ARCHIVED",
};
