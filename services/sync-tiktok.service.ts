/**
 * TikTok Ads Sync Service — Sprint 1
 * Returns skipped_missing_credentials when credentials absent.
 * Never throws.
 */
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import type { ProviderSyncResult } from "./sync-orchestrator.service";

const logger = createLogger("SyncTikTok");
const TIKTOK_API = "https://business-api.tiktok.com/open_api/v1.3";

export async function syncTikTokAds(
  _mode: string,
): Promise<Omit<ProviderSyncResult, "provider" | "durationMs">> {
  const env = getServerEnv();
  const token = env.TIKTOK_ACCESS_TOKEN;
  const accountId = env.TIKTOK_ADVERTISER_ID;

  if (!token || !accountId) {
    logger.info("TikTok Ads sync skipped — credentials missing");
    return { status: "skipped_missing_credentials", recordsFetched: 0, recordsUpserted: 0, errorMessage: "TIKTOK_ACCESS_TOKEN and TIKTOK_ADVERTISER_ID required" };
  }

  try {
    const endDate   = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

    const url = new URL(`${TIKTOK_API}/report/integrated/get/`);
    url.searchParams.set("advertiser_id", accountId);
    url.searchParams.set("report_type", "BASIC");
    url.searchParams.set("dimensions", JSON.stringify(["campaign_id", "stat_time_day"]));
    url.searchParams.set("metrics", JSON.stringify(["spend", "impressions", "clicks", "campaign_name"]));
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set("page_size", "100");

    const res = await fetch(url.toString(), {
      headers: { "Access-Token": token, "Accept": "application/json" },
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TikTok API ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json() as { data?: { list?: unknown[] }; code?: number; message?: string };
    if (json.code !== 0 && json.code != null) {
      throw new Error(`TikTok API error ${json.code}: ${json.message}`);
    }

    const items = json.data?.list ?? [];
    logger.info("TikTok Ads data fetched", { metadata: { count: items.length } });

    // DB upsert of MarketingSpend records: Sprint 2
    return { status: "success", recordsFetched: items.length, recordsUpserted: 0 };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("TikTok Ads sync failed", { metadata: { errorMessage } });
    return { status: "failed", recordsFetched: 0, recordsUpserted: 0, errorMessage };
  }
}
