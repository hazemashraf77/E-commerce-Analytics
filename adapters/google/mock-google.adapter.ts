/**
 * Google Ads mock adapter.
 * Repository: 073_API_INTEGRATION_BIBLE.md — Mock Data
 * "Until production APIs become available: Generate realistic seeded data."
 *
 * Used when GOOGLE_DEVELOPER_TOKEN / GOOGLE_CUSTOMER_ID are absent.
 * Returns plausible but non-real data for preview mode.
 */

import type { GoogleRawCampaign, GoogleRawSpend } from "./types/google.types";

export const MOCK_GOOGLE_CAMPAIGNS: GoogleRawCampaign[] = [
  {
    campaign_id: "GCAM-001",
    campaign_name: "Search — Brand",
    status: "ENABLED",
    campaign_type: "SEARCH",
    start_date: "2024-01-01",
    bidding_strategy: "TARGET_CPA",
  },
  {
    campaign_id: "GCAM-002",
    campaign_name: "Shopping — All Products",
    status: "ENABLED",
    campaign_type: "SHOPPING",
    start_date: "2024-01-01",
  },
];

export const MOCK_GOOGLE_SPEND: GoogleRawSpend[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86_400_000).toISOString().slice(0, 10),
  campaign_id: i % 2 === 0 ? "GCAM-001" : "GCAM-002",
  cost_micros: String(Math.floor((800_000 + Math.random() * 400_000))),
  currency_code: "EGP",
  clicks: Math.floor(30 + Math.random() * 20),
  impressions: Math.floor(600 + Math.random() * 300),
  conversions: Math.floor(2 + Math.random() * 4),
  conversion_value: Math.floor(500 + Math.random() * 300),
}));

export const mockGoogleAdapter = {
  getCampaigns: async () => MOCK_GOOGLE_CAMPAIGNS,
  getSpend: async (_from: Date, _to: Date) => MOCK_GOOGLE_SPEND,
};
