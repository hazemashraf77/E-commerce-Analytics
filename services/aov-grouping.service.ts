/**
 * AOV Grouping Service — Sprint 2A
 *
 * Segments orders into value buckets instead of returning a single average.
 *
 * Strategies:
 *   - AUTO     (default): quartile-based buckets derived from the actual order distribution
 *   - QUARTILE: explicit quartile buckets (Q1-Q4)
 *   - FIXED:   user-configured buckets from AOVGroupingConfig.customBuckets
 *
 * Suggested threshold = dominant bucket's average * (1 + upliftPercentage).
 * Default uplift = 25% — produces "free shipping above X" recommendation.
 *
 * Example:
 *   100 orders, 80 around 700 EGP, 20 around 2500 EGP
 *   dominant bucket = 700 average
 *   suggested threshold = 700 * 1.25 = 875 EGP
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";

const logger = createLogger("AOVGroupingService");

export interface AOVBucket {
  label:           string;       // e.g. "Low" | "Mid" | "High" | "Premium" | user-defined
  min:             number;       // inclusive
  max:             number | null; // exclusive; null = unbounded
  orderCount:      number;
  percentage:      number;       // 0–100
  averageValue:    number;       // average order value within this bucket
  totalRevenue:    number;
  isDominant:      boolean;
}

export interface AOVGroupingResult {
  totalOrders:                number;
  overallAOV:                 number;
  buckets:                    AOVBucket[];
  dominantBucket:             AOVBucket | null;
  suggestedOfferThreshold:    number | null;  // dominant.averageValue * (1 + upliftPercentage)
  upliftPercentage:           number;          // applied uplift (0.25 = 25 %)
  strategy:                   string;
  recommendation:             string;          // human-readable
}

export interface AOVGroupingOptions {
  storeId:      string;
  from?:        Date;            // default: 30 days ago
  to?:          Date;            // default: now
  strategy?:    "AUTO" | "QUARTILE" | "FIXED";
  upliftOverride?: number;       // override store config
}

/**
 * Compute AOV bucket grouping for a store.
 * Returns deterministic buckets + offer threshold suggestion.
 */
export async function computeAOVGrouping(opts: AOVGroupingOptions): Promise<AOVGroupingResult> {
  const from = opts.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to   = opts.to   ?? new Date();

  // Load store config
  const config = await prisma.aOVGroupingConfig.findUnique({
    where: { storeId: opts.storeId },
  }).catch(() => null);

  const strategy = opts.strategy ?? (config?.bucketStrategy as "AUTO"|"QUARTILE"|"FIXED" | undefined) ?? "AUTO";
  const uplift   = opts.upliftOverride ?? (config ? Number(config.upliftPercentage) : 0.25);

  // Fetch order values
  // OrderValue = sum of (unitPrice * quantity - discount) across OrderItems + customerShippingFee
  const orders = await prisma.order.findMany({
    where: {
      storeId:   opts.storeId,
      orderDate: { gte: from, lte: to },
      orderStatus: { in: ["CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED", "CLOSED"] },
    },
    select: {
      id: true,
      customerShippingFee: true,
      orderItems: {
        select: { quantity: true, unitPrice: true, discount: true },
      },
    },
  });

  const values: number[] = orders.map((o) => {
    const itemsTotal = o.orderItems.reduce(
      (s, i) => s + Number(i.unitPrice) * Number(i.quantity) - Number(i.discount),
      0,
    );
    return itemsTotal + Number(o.customerShippingFee);
  }).filter((v) => isFinite(v) && v > 0);

  if (values.length === 0) {
    return {
      totalOrders: 0,
      overallAOV:  0,
      buckets:     [],
      dominantBucket: null,
      suggestedOfferThreshold: null,
      upliftPercentage: uplift,
      strategy,
      recommendation: "No completed orders in selected period.",
    };
  }

  const overallAOV = values.reduce((s, v) => s + v, 0) / values.length;

  let bucketRanges: Array<{ label: string; min: number; max: number | null }>;

  if (strategy === "FIXED" && config?.customBuckets) {
    bucketRanges = (config.customBuckets as Array<{ label: string; min: number; max: number | null }>) ?? [];
  } else {
    bucketRanges = computeQuartileBuckets(values);
  }

  // Place each value into a bucket
  const buckets: AOVBucket[] = bucketRanges.map((b) => ({
    label:        b.label,
    min:          b.min,
    max:          b.max,
    orderCount:   0,
    percentage:   0,
    averageValue: 0,
    totalRevenue: 0,
    isDominant:   false,
  }));

  for (const v of values) {
    const bucket = buckets.find((b) =>
      v >= b.min && (b.max === null || v < b.max),
    );
    if (bucket) {
      bucket.orderCount++;
      bucket.totalRevenue += v;
    }
  }

  for (const b of buckets) {
    b.percentage   = (b.orderCount / values.length) * 100;
    b.averageValue = b.orderCount > 0 ? b.totalRevenue / b.orderCount : 0;
  }

  // Dominant = bucket with highest order count
  const nonEmpty = buckets.filter((b) => b.orderCount > 0);
  const dominant = nonEmpty.sort((a, b) => b.orderCount - a.orderCount)[0] ?? null;
  if (dominant) dominant.isDominant = true;

  const suggestedOfferThreshold = dominant
    ? Math.round(dominant.averageValue * (1 + uplift))
    : null;

  const recommendation = dominant && suggestedOfferThreshold
    ? `Most orders (${dominant.percentage.toFixed(0)}%) are around EGP ${dominant.averageValue.toFixed(0)}. ` +
      `Suggested free-shipping threshold: EGP ${suggestedOfferThreshold} ` +
      `(${(uplift * 100).toFixed(0)}% above dominant bucket).`
    : "Not enough data to suggest a threshold.";

  logger.info("AOV grouping computed", {
    metadata: {
      storeId: opts.storeId,
      totalOrders: values.length,
      strategy,
      dominantLabel: dominant?.label,
      suggestedOfferThreshold,
    },
  });

  return {
    totalOrders:             values.length,
    overallAOV:              Math.round(overallAOV),
    buckets,
    dominantBucket:          dominant,
    suggestedOfferThreshold,
    upliftPercentage:        uplift,
    strategy,
    recommendation,
  };
}

/**
 * Compute quartile-based buckets from the actual distribution.
 * Returns 4 buckets: Low | Mid | High | Premium.
 */
function computeQuartileBuckets(values: number[]): Array<{ label: string; min: number; max: number | null }> {
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p: number) => {
    const idx = Math.floor(sorted.length * p);
    return sorted[Math.min(idx, sorted.length - 1)] ?? 0;
  };
  const q25 = q(0.25);
  const q50 = q(0.50);
  const q75 = q(0.75);

  return [
    { label: "Low",     min: 0,   max: q25  },
    { label: "Mid",     min: q25, max: q50  },
    { label: "High",    min: q50, max: q75  },
    { label: "Premium", min: q75, max: null },
  ];
}

/**
 * Get or create the AOV config for a store.
 */
export async function getOrCreateAOVConfig(storeId: string) {
  const existing = await prisma.aOVGroupingConfig.findUnique({ where: { storeId } });
  if (existing) return existing;

  return prisma.aOVGroupingConfig.create({
    data: { storeId, bucketStrategy: "AUTO", upliftPercentage: 0.25 },
  });
}
