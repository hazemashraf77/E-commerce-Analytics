/**
 * Meta Ads Sync Service — Sprint 1
 * Returns skipped_missing_credentials when META_ACCESS_TOKEN or META_AD_ACCOUNT_ID absent.
 * Never throws.
 */
import { createLogger } from "@/lib/logger";
import { getServerEnv } from "@/lib/env";
import type { ProviderSyncResult } from "./sync-orchestrator.service";

const logger = createLogger("SyncMeta");
const META_API = "https://graph.facebook.com/v19.0";

export async function syncMetaAds(
  _mode: string,
): Promise<Omit<ProviderSyncResult, "provider" | "durationMs">> {
  const env = getServerEnv();

  if (!env.META_ACCESS_TOKEN || !env.META_AD_ACCOUNT_ID) {
    logger.info("Meta Ads sync skipped — credentials missing");
    return { status: "skipped_missing_credentials", recordsFetched: 0, recordsUpserted: 0, errorMessage: "META_ACCESS_TOKEN and META_AD_ACCOUNT_ID required" };
  }

  try {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    const until = new Date().toISOString().slice(0, 10);

    const url = new URL(`${META_API}/act_${env.META_AD_ACCOUNT_ID}/insights`);
    url.searchParams.set("access_token", env.META_ACCESS_TOKEN);
    url.searchParams.set("fields", "campaign_id,campaign_name,spend,impressions,clicks,reach");
    url.searchParams.set("time_range", JSON.stringify({ since, until }));
    url.searchParams.set("level", "campaign");
    url.searchParams.set("limit", "100");

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Meta API ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json() as { data?: unknown[] };
    const items = json.data ?? [];
    logger.info("Meta Ads insights fetched", { metadata: { count: items.length } });

    // DB upsert of MarketingSpend records: Sprint 2
    return { status: "success", recordsFetched: items.length, recordsUpserted: 0 };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Meta Ads sync failed", { metadata: { errorMessage } });
    return { status: "failed", recordsFetched: 0, recordsUpserted: 0, errorMessage };
  }
}
