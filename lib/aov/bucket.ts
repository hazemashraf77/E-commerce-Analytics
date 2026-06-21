export interface AOVBucketRange {
  label: string;
  min: number;
  max: number | null;
}

export interface AOVBucketResult extends AOVBucketRange {
  orderCount: number;
  percentage: number;
  averageValue: number;
  totalRevenue: number;
  isDominant: boolean;
}

export function computeQuartileBucketRanges(values: number[]): AOVBucketRange[] {
  const sorted = [...values].filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);

  if (sorted.length === 0) return [];

  const q = (p: number) => {
    const idx = Math.floor(sorted.length * p);
    return sorted[Math.min(idx, sorted.length - 1)] ?? 0;
  };

  const q25 = q(0.25);
  const q50 = q(0.5);
  const q75 = q(0.75);

  return [
    { label: "Low", min: 0, max: q25 },
    { label: "Mid", min: q25, max: q50 },
    { label: "High", min: q50, max: q75 },
    { label: "Premium", min: q75, max: null },
  ];
}

export function assignValuesToBuckets(
  values: number[],
  ranges: AOVBucketRange[],
): AOVBucketResult[] {
  const buckets: AOVBucketResult[] = ranges.map((r) => ({
    ...r,
    orderCount: 0,
    percentage: 0,
    averageValue: 0,
    totalRevenue: 0,
    isDominant: false,
  }));

  const cleanValues = values.filter((v) => Number.isFinite(v) && v > 0);

  for (const value of cleanValues) {
    const bucket = buckets.find((b) => value >= b.min && (b.max === null || value < b.max));
    if (!bucket) continue;

    bucket.orderCount += 1;
    bucket.totalRevenue += value;
  }

  for (const bucket of buckets) {
    bucket.percentage = cleanValues.length > 0 ? (bucket.orderCount / cleanValues.length) * 100 : 0;
    bucket.averageValue = bucket.orderCount > 0 ? bucket.totalRevenue / bucket.orderCount : 0;
  }

  const dominant = buckets
    .filter((b) => b.orderCount > 0)
    .sort((a, b) => b.orderCount - a.orderCount)[0];

  if (dominant) dominant.isDominant = true;

  return buckets;
}