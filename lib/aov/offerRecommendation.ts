import type { AOVBucketResult } from "./bucket";

export interface OfferThresholdRecommendation {
  suggestedOfferThreshold: number | null;
  recommendation: string;
}

export function buildOfferThresholdRecommendation(
  dominantBucket: AOVBucketResult | null,
  upliftPercentage: number,
): OfferThresholdRecommendation {
  if (!dominantBucket || dominantBucket.averageValue <= 0) {
    return {
      suggestedOfferThreshold: null,
      recommendation: "Not enough data to suggest an offer threshold.",
    };
  }

  const suggestedOfferThreshold = Math.round(
    dominantBucket.averageValue * (1 + upliftPercentage),
  );

  return {
    suggestedOfferThreshold,
    recommendation:
      `Most orders (${dominantBucket.percentage.toFixed(0)}%) are around EGP ` +
      `${dominantBucket.averageValue.toFixed(0)}. Suggested free-shipping threshold: ` +
      `EGP ${suggestedOfferThreshold} (${(upliftPercentage * 100).toFixed(0)}% above dominant bucket).`,
  };
}