/**
 * Score Engine orchestrator.
 * Repository: 054_SCORE_CATALOG.md — SCORE LIFECYCLE, SCORE DEPENDENCIES
 * "Scores consume ONLY: Formula Engine → Analytics Engine → KPI Registry → Score Engine"
 * "Dashboard SHALL NEVER calculate scores." (BR-SCORE-006)
 */

import { createLogger } from "@/lib/logger";
import type { HealthScoreInputs, ScoreResult } from "../types/score.types";
import {
  calculateBusinessHealthScore,
  calculateProductScore,
  calculateCampaignScore,
  calculateGovernorateScore,
  calculateShippingScore,
  calculateInventoryHealthScore,
  calculateMarketingHealthScore,
  calculateOpportunityScore,
  calculateRiskScore,
} from "./score.calculator";
import { saveScore, getAllLatestScores } from "../repositories/score.repository";
import { persistScoreSnapshot } from "../repositories/historical-score.repository";

const logger = createLogger("ScoreEngine");

export interface ScoreEngineInput {
  storeId: string;
  // KPI values from Analytics Engine (all pre-calculated)
  deliveryRate: number;
  returnRate: number;
  refusalRate: number;
  profitMargin: number;
  marketingRoi: number;
  trueCpa: number;
  deliveredRoas: number;
  inventoryTurnover: number;
  avgFifoAgeDays: number;
  deadStockPct: number;
  stockAvailabilityPct: number;
  lowStockProductPct: number;
  cashPosition: number;
  monthlyRevenue: number;
  settlementCompletionRate: number;
  trendDelta: number;         // period-over-period change
  growthVelocity: number;     // % growth
  deliveredOrders: number;
  deliveredItems: number;
  totalProducts: number;
}

export interface ScoreEngineOutput {
  storeId: string;
  scores: ScoreResult[];
  computedAt: string;
}

export async function computeAllScores(input: ScoreEngineInput): Promise<ScoreEngineOutput> {
  logger.info("Score Engine: computing all 9 scores", { metadata: { storeId: input.storeId } });

  const healthInputs: HealthScoreInputs = {
    profitMargin:              input.profitMargin,
    deliveryRate:              input.deliveryRate,
    returnRate:                input.returnRate,
    refusalRate:               input.refusalRate,
    inventoryTurnover:         input.inventoryTurnover,
    marketingRoi:              input.marketingRoi,
    cashPosition:              input.cashPosition,
    settlementCompletionRate:  input.settlementCompletionRate,
    trendDelta:                input.trendDelta,
  };

  // Compute in dependency order (054: SCORE LIFECYCLE)
  const inv = await calculateInventoryHealthScore(
    input.inventoryTurnover, input.avgFifoAgeDays, input.deadStockPct,
    input.stockAvailabilityPct, input.lowStockProductPct, input.trendDelta,
    63, input.totalProducts,
  );

  const mkt = await calculateMarketingHealthScore(
    input.trueCpa, input.deliveredRoas, input.profitMargin,
    input.deliveryRate, input.trendDelta, 65, input.deliveredOrders,
  );

  // Inject downstream sub-scores into health inputs
  healthInputs.inventoryHealth = inv.score;
  healthInputs.marketingHealth = mkt.score;

  const biz  = calculateBusinessHealthScore(healthInputs, 72, input.deliveredOrders);
  const prod = calculateProductScore(healthInputs, 78, input.deliveredItems);
  const camp = calculateCampaignScore(healthInputs, 67, input.deliveredOrders);
  const gov  = calculateGovernorateScore(healthInputs, 75, input.deliveredOrders);
  const ship = calculateShippingScore(healthInputs, 72, input.deliveredOrders);

  const opp  = calculateOpportunityScore(
    prod.score, camp.score, mkt.score, inv.score,
    input.growthVelocity, input.trendDelta, 71,
  );

  const risk = calculateRiskScore(healthInputs, inv.score, 28);

  const allScores = [biz, prod, camp, gov, ship, inv, mkt, opp, risk];

  // Persist all scores + historical snapshots (Repository Consistency Pass — Task 2, Task 6)
  const prevScores = await getAllLatestScores(input.storeId);
  const prevMap = new Map(prevScores.map(s => [s.scoreId, s.score]));
  await Promise.all(allScores.map(async s => {
    const prev = prevMap.get(s.scoreId) ?? s.score;
    await saveScore(input.storeId, s);
    await persistScoreSnapshot(input.storeId, s, prev);
  }));

  logger.info("Score Engine: all 9 scores computed and saved", {
    metadata: {
      storeId: input.storeId,
      businessHealth: biz.score,
      opportunity: opp.score,
      risk: risk.score,
    },
  });

  return { storeId: input.storeId, scores: allScores, computedAt: new Date().toISOString() };
}

export { getAllLatestScores } from "../repositories/score.repository";
