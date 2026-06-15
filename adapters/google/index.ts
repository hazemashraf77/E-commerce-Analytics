/**
 * Google Ads adapter barrel.
 * Repository: 073_API_INTEGRATION_BIBLE.md — GOOGLE INTEGRATION
 *             012_API_ARCHITECTURE.md — ADAPTER LAYER
 */

export type { GoogleRawCampaign, GoogleRawSpend, GoogleRawAdGroup, GoogleRawKeyword } from "./types/google.types";
export { GOOGLE_STATUS_MAP } from "./types/google.types";
export { mapGoogleCampaignToCanonical, mapGoogleSpendToCanonical } from "./mappers/google.mapper";
export { mockGoogleAdapter, MOCK_GOOGLE_CAMPAIGNS, MOCK_GOOGLE_SPEND } from "./mock-google.adapter";
