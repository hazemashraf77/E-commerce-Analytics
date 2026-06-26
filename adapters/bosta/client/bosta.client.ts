/**
 * Bosta API client.
 * Production HTTP client — no mock, no placeholder responses.
 * Bosta API: https://app.bosta.co/api/v2
 *
 * Auth: API key in X-API-Key header.
 * Rate limit: ~120 req/min per account.
 */

import { createLogger } from "@/lib/logger";
import type { BostaRawShipment, BostaRawSettlement } from "../types/bosta.types";

const logger = createLogger("BostaClient");
const BOSTA_BASE_URL = "https://app.bosta.co/api/v2";

interface BostaListResponse<T> {
  success: boolean;
  data: {
    list: T[];
    count: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}

export class BostaClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    attempt = 1,
  ): Promise<T> {
    const url = `${BOSTA_BASE_URL}${path}`;
    const headers: Record<string, string> = {
      "Authorization": this.apiKey,
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
        signal: AbortSignal.timeout(30_000),
      });

      if (res.status === 429 && attempt <= 3) {
        const wait = parseInt(res.headers.get("Retry-After") ?? "30", 10) * 1000;
        logger.warn("Bosta rate limited", { metadata: { attempt, wait } });
        await sleep(wait);
        return this.request<T>(path, options, attempt + 1);
      }

      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt <= 3) {
        const delay = attempt * 5_000;
        logger.warn("Bosta transient error", { metadata: { status: res.status, attempt } });
        await sleep(delay);
        return this.request<T>(path, options, attempt + 1);
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Bosta API error ${res.status}: ${body}`);
      }

      return res.json() as Promise<T>;
    } catch (err) {
      if (attempt <= 3 && isTransientError(err)) {
        await sleep(attempt * 5_000);
        return this.request<T>(path, options, attempt + 1);
      }
      throw err;
    }
  }

  /**
   * Fetch all shipments (paginated).
   * Pass updatedAfter for incremental sync.
   */
  async *fetchDeliveries(params: {
    pageSize?: number;
    updatedAfter?: string;
    state?: number;
  } = {}): AsyncGenerator<BostaRawShipment[]> {
    let page = 0;
    const pageSize = params.pageSize ?? 100;

    while (true) {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(params.updatedAfter ? { updatedAfter: params.updatedAfter } : {}),
        ...(params.state != null ? { state: String(params.state) } : {}),
      });

      logger.debug("Fetching Bosta deliveries page", { metadata: { page, pageSize } });

      const response = await this.request<BostaListResponse<BostaRawShipment>>(
  `/deliveries/search`,
  {
    method: "POST",
    body: JSON.stringify({
      page,
      pageSize,
      ...(params.state != null ? { state: params.state } : {}),
      ...(params.updatedAfter ? { updatedAfter: params.updatedAfter } : {}),
    }),
  },
);

      if (!response.success || !response.data?.list?.length) break;
      yield response.data.list;

      const { count } = response.data;
      const fetched = (page + 1) * pageSize;
      if (fetched >= count) break;
      page++;
      await sleep(200);
    }
  }

  /**
   * Fetch a single delivery by Bosta tracking number.
   */
  async fetchDelivery(trackingNumber: string): Promise<BostaRawShipment> {
    return this.request<BostaRawShipment>(`/deliveries/${trackingNumber}`);
  }

  /**
   * Fetch settlements (paginated).
   */
  async *fetchSettlements(params: {
    pageSize?: number;
    from?: string;
    to?: string;
  } = {}): AsyncGenerator<BostaRawSettlement[]> {
    let page = 0;
    const pageSize = params.pageSize ?? 50;

    while (true) {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(params.from ? { from: params.from } : {}),
        ...(params.to ? { to: params.to } : {}),
      });

      const response = await this.request<BostaListResponse<BostaRawSettlement>>(
        `/settlements?${qs.toString()}`,
      );

      if (!response.success || !response.data?.list?.length) break;
      yield response.data.list;

      const { count } = response.data;
      const fetched = (page + 1) * pageSize;
      if (fetched >= count) break;
      page++;
      await sleep(200);
    }
  }

  /**
   * Fetch tracking history for a shipment.
   */
  async fetchTracking(trackingNumber: string): Promise<BostaRawShipment> {
    return this.request<BostaRawShipment>(`/deliveries/${trackingNumber}/tracking`);
  }
}

function isTransientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("timeout") || msg.includes("econnreset") || msg.includes("econnrefused") || msg.includes("network");
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
