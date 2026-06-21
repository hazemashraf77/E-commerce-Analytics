import type { AOVBucketResult } from "./bucket";

export function getDominantAOVBucket(buckets: AOVBucketResult[]): AOVBucketResult | null {
  return buckets
    .filter((bucket) => bucket.orderCount > 0)
    .sort((a, b) => b.orderCount - a.orderCount)[0] ?? null;
}