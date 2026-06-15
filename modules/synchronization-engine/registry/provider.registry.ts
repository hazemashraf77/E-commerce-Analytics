/**
 * Provider registry.
 * Repository: 073_API_INTEGRATION_BIBLE.md — Provider Registry
 *             012_API_ARCHITECTURE.md — SUPPORTED PROVIDERS
 *
 * Single source of truth for all integration connectors.
 * Every provider is registered here.
 * No module may communicate with a provider without going through this registry.
 */

export type ProviderKey = "EAZY_ORDER" | "BOSTA" | "META" | "TIKTOK" | "GOOGLE";

export type ProviderCategory =
  | "ORDER_MANAGEMENT"
  | "SHIPPING"
  | "ADVERTISING";

export type ProviderStatus =
  | "ACTIVE"          // credentials present, sync enabled
  | "DEGRADED"        // partial failures, retrying
  | "DISCONNECTED"    // credentials missing or expired
  | "MOCK";           // no credentials, using mock data (preview mode)

export interface ProviderDefinition {
  key: ProviderKey;
  displayName: string;
  category: ProviderCategory;
  /** Sync scopes this provider supports */
  scopes: string[];
  /** Env vars required for real credentials */
  requiredEnvVars: string[];
  /** Sync frequency in minutes */
  defaultSyncIntervalMinutes: number;
  /** Maximum retries per sync attempt (073: Retry Engine) */
  maxRetries: number;
  /** Read-only per 073: External APIs remain read-only */
  readOnly: true;
}

/** All registered providers — extend this as new providers are added */
export const PROVIDER_REGISTRY: Record<ProviderKey, ProviderDefinition> = {
  EAZY_ORDER: {
    key: "EAZY_ORDER",
    displayName: "EasyOrders",
    category: "ORDER_MANAGEMENT",
    scopes: ["ORDERS", "PRODUCTS", "CUSTOMERS"],
    requiredEnvVars: ["EAZY_ORDER_API_KEY", "EAZY_ORDER_STORE_URL"],
    defaultSyncIntervalMinutes: 10,
    maxRetries: 3,
    readOnly: true,
  },
  BOSTA: {
    key: "BOSTA",
    displayName: "Bosta",
    category: "SHIPPING",
    scopes: ["SHIPMENTS", "TRACKING", "SETTLEMENTS"],
    requiredEnvVars: ["BOSTA_API_KEY"],
    defaultSyncIntervalMinutes: 15,
    maxRetries: 3,
    readOnly: true,
  },
  META: {
    key: "META",
    displayName: "Meta Ads",
    category: "ADVERTISING",
    scopes: ["CAMPAIGNS", "AD_SETS", "ADS", "SPEND", "INSIGHTS"],
    requiredEnvVars: ["META_APP_ID", "META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID"],
    defaultSyncIntervalMinutes: 60,
    maxRetries: 3,
    readOnly: true,
  },
  TIKTOK: {
    key: "TIKTOK",
    displayName: "TikTok Ads",
    category: "ADVERTISING",
    scopes: ["CAMPAIGNS", "AD_GROUPS", "ADS", "SPEND"],
    requiredEnvVars: ["TIKTOK_ACCESS_TOKEN", "TIKTOK_ADVERTISER_ID"],
    defaultSyncIntervalMinutes: 60,
    maxRetries: 3,
    readOnly: true,
  },
  GOOGLE: {
    key: "GOOGLE",
    displayName: "Google Ads",
    category: "ADVERTISING",
    scopes: ["CAMPAIGNS", "AD_GROUPS", "KEYWORDS", "SPEND"],
    requiredEnvVars: ["GOOGLE_DEVELOPER_TOKEN", "GOOGLE_CUSTOMER_ID", "GOOGLE_REFRESH_TOKEN"],
    defaultSyncIntervalMinutes: 60,
    maxRetries: 3,
    readOnly: true,
  },
};

/**
 * Resolve provider status based on environment.
 * Returns MOCK when credentials are absent (preview mode).
 */
export function resolveProviderStatus(key: ProviderKey): ProviderStatus {
  const def = PROVIDER_REGISTRY[key];
  const hasCredentials = def.requiredEnvVars.every(
    (v) => !!process.env[v] && !process.env[v]?.includes("placeholder"),
  );
  return hasCredentials ? "ACTIVE" : "MOCK";
}

/**
 * Returns all providers and their current status.
 * Used by Integration Health dashboard.
 */
export function getProviderStatuses(): Array<{
  provider: ProviderDefinition;
  status: ProviderStatus;
}> {
  return Object.values(PROVIDER_REGISTRY).map((p) => ({
    provider: p,
    status: resolveProviderStatus(p.key),
  }));
}
