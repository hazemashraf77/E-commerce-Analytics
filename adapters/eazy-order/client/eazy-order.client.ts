/**
 * EasyOrders API client.
 * Production HTTP client — no mock, no placeholder responses.
 * Uses bearer token auth per EasyOrders API documentation.
 *
 * Rate limiting: EasyOrders allows ~60 requests/minute per store.
 * Retry: up to 3 attempts with exponential backoff on 429 / 5xx.
 */

import { createLogger } from "@/lib/logger";
import type {
  EazyOrderRawOrder,
  EazyOrderRawProduct,
  EazyOrderRawCustomer,
} from "../types/eazy-order.types";

const logger = createLogger("EasyOrdersClient");

// Base URL: https://api.easyorders.io/v2 (or v1 depending on plan)
const EAZY_BASE_URL = "https://api.easyorders.io";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

type EazyListOrdersParams = {
  page?: number;
  per_page?: number;
  status?: string;
  updated_after?: string;  // ISO datetime for incremental sync
  created_after?: string;
};

type EazyListProductsParams = {
  page?: number;
  per_page?: number;
  updated_after?: string;
};

export class EasyOrdersClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly storeUrl: string;

  constructor(apiKey: string, storeUrl: string) {
    this.apiKey = apiKey;
    this.storeUrl = storeUrl.replace(/\/$/, "");
    // EasyOrders uses store-specific subdomain or their central API
    this.baseUrl = `${EAZY_BASE_URL}`;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    attempt = 1,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Store-URL": this.storeUrl,
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
        signal: AbortSignal.timeout(30_000), // 30s timeout
      });

      // Rate limiting — wait and retry
      if (res.status === 429 && attempt <= 3) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "60", 10);
        logger.warn("EasyOrders rate limited — waiting", { metadata: { attempt, retryAfter } });
        await sleep(retryAfter * 1000);
        return this.request<T>(path, options, attempt + 1);
      }

      // Transient server error — retry with backoff
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt <= 3) {
        const delay = attempt * 5_000;
        logger.warn("EasyOrders transient error — retrying", { metadata: { status: res.status, attempt, delay } });
        await sleep(delay);
        return this.request<T>(path, options, attempt + 1);
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`EasyOrders API error ${res.status}: ${body}`);
      }

      return res.json() as Promise<T>;
    } catch (err) {
      if (attempt <= 3 && isTransientError(err)) {
        const delay = attempt * 5_000;
        logger.warn("EasyOrders request failed — retrying", {
          metadata: { path, attempt, delay, error: String(err) },
        });
        await sleep(delay);
        return this.request<T>(path, options, attempt + 1);
      }
      throw err;
    }
  }

  /**
   * Fetch all orders (paginated).
   * For incremental sync, pass updated_after to fetch only changed orders.
   */
  async *fetchOrders(params: EazyListOrdersParams = {}): AsyncGenerator<EazyOrderRawOrder[]> {
    let page = params.page ?? 1;
    const perPage = params.per_page ?? 100;

    while (true) {
      const qs = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        ...(params.status ? { status: params.status } : {}),
        ...(params.updated_after ? { updated_after: params.updated_after } : {}),
        ...(params.created_after ? { created_after: params.created_after } : {}),
      });

      logger.debug("Fetching EasyOrders orders page", { metadata: { page, perPage } });

      const response = await this.request<PaginatedResponse<EazyOrderRawOrder>>(
        `/v2/orders?${qs.toString()}`,
      );

      if (response.data.length === 0) break;
      yield response.data;

      if (page >= response.meta.last_page) break;
      page++;

      // Polite delay between pages
      await sleep(200);
    }
  }

  /**
   * Fetch a single order by provider ID.
   */
  async fetchOrder(orderId: string): Promise<EazyOrderRawOrder> {
    return this.request<EazyOrderRawOrder>(`/v2/orders/${orderId}`);
  }

  /**
   * Fetch all products (paginated).
   */
  async *fetchProducts(params: EazyListProductsParams = {}): AsyncGenerator<EazyOrderRawProduct[]> {
    let page = params.page ?? 1;
    const perPage = 100;

    while (true) {
      const qs = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        ...(params.updated_after ? { updated_after: params.updated_after } : {}),
      });

      const response = await this.request<PaginatedResponse<EazyOrderRawProduct>>(
        `/v2/products?${qs.toString()}`,
      );

      if (response.data.length === 0) break;
      yield response.data;

      if (page >= response.meta.last_page) break;
      page++;
      await sleep(200);
    }
  }

  /**
   * Fetch customer by ID.
   */
  async fetchCustomer(customerId: string): Promise<EazyOrderRawCustomer> {
    return this.request<EazyOrderRawCustomer>(`/v2/customers/${customerId}`);
  }
}

function isTransientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes("timeout") || msg.includes("econnreset") || msg.includes("econnrefused") || msg.includes("network");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
