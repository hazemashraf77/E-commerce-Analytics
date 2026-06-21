/**
 * AOV Grouping Service — Sprint 2A
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import {
  assignValuesToBuckets,
  computeQuartileBucketRanges,
  type AOVBucketResult,
} from "@/lib/aov/bucket";
import { getDominantAOVBucket } from "@/lib/aov/dominantBucket";
import { buildOfferThresholdRecommendation } from "@/lib/aov/offerRecommendation";

const logger = createLogger("AOVGroupingService");

export type AOVBucket = AOVBucketResult;

export interface AOVGroupingResult {
  totalOrders: number;
  overallAOV: number;
  buckets: AOVBucket[];
  dominantBucket: AOVBucket | null;
  suggestedOfferThreshold: number | null;
  upliftPercentage: number;
  strategy: string;
  recommendation: string;
}

export interface AOVGroupingOptions {
  storeId: string;
  from?: Date;
  to?: Date;
  strategy?: "AUTO" | "QUARTILE" | "FIXED";
  upliftOverride?: number;
}

export async function computeAOVGrouping(opts: AOVGroupingOptions): Promise<AOVGroupingResult> {
  const from = opts.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = opts.to ?? new Date();

  const config = await prisma.aOVGroupingConfig.findUnique({
    where: { storeId: opts.storeId },
  }).catch(() => null);

  const strategy =
    opts.strategy ??
    (config?.bucketStrategy as "AUTO" | "QUARTILE" | "FIXED" | undefined) ??
    "AUTO";

  const uplift =
    opts.upliftOverride ??
    (config ? Number(config.upliftPercentage) : 0.25);

  const orders = await prisma.order.findMany({
    where: {
      storeId: opts.storeId,
      orderDate: { gte: from, lte: to },
      orderStatus: {
        in: ["CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED", "CLOSED"],
      },
    },
    select: {
      id: true,
      customerShippingFee: true,
      orderItems: {
        select: { quantity: true, unitPrice: true, discount: true },
      },
    },
  });

  const values = orders
    .map((order) => {
      const itemsTotal = order.orderItems.reduce(
        (sum, item) =>
          sum +
          Number(item.unitPrice) * Number(item.quantity) -
          Number(item.discount),
        0,
      );

      return itemsTotal + Number(order.customerShippingFee);
    })
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return {
      totalOrders: 0,
      overallAOV: 0,
      buckets: [],
      dominantBucket: null,
      suggestedOfferThreshold: null,
      upliftPercentage: uplift,
      strategy,
      recommendation: "No completed orders in selected period.",
    };
  }

  const overallAOV = values.reduce((sum, value) => sum + value, 0) / values.length;

  const bucketRanges =
    strategy === "FIXED" && config?.customBuckets
      ? (config.customBuckets as Array<{ label: string; min: number; max: number | null }>)
      : computeQuartileBucketRanges(values);

  const buckets = assignValuesToBuckets(values, bucketRanges);
  const dominantBucket = getDominantAOVBucket(buckets);

  const { suggestedOfferThreshold, recommendation } =
    buildOfferThresholdRecommendation(dominantBucket, uplift);

  logger.info("AOV grouping computed", {
    metadata: {
      storeId: opts.storeId,
      totalOrders: values.length,
      strategy,
      dominantLabel: dominantBucket?.label,
      suggestedOfferThreshold,
    },
  });

  return {
    totalOrders: values.length,
    overallAOV: Math.round(overallAOV),
    buckets,
    dominantBucket,
    suggestedOfferThreshold,
    upliftPercentage: uplift,
    strategy,
    recommendation,
  };
}

export async function getOrCreateAOVConfig(storeId: string) {
  const existing = await prisma.aOVGroupingConfig.findUnique({ where: { storeId } });
  if (existing) return existing;

  return prisma.aOVGroupingConfig.create({
    data: { storeId, bucketStrategy: "AUTO", upliftPercentage: 0.25 },
  });
}