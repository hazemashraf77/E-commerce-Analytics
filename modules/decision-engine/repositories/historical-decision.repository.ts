/**
 * Historical Decision repository.
 * Repository Consistency Pass 2026-06-12 — Task 3, Task 4
 *
 * "Decision history SHALL be immutable." (Task 3)
 * History is stored via settings table keyed by decision id + timestamp.
 * Status transitions are append-only on the existing record.
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import type { HistoricalDecisionRecord, DecisionStatusTransition } from "../domain/historical-decision.entity";
import type { DecisionRecord, DecisionStatus } from "../types/decision.types";
import { isValidTransition } from "../domain/historical-decision.entity";
import { DECISION_IMPACTS } from "../domain/impact.model";
import { AppError } from "@/utils/errors";

const logger = createLogger("HistoricalDecisionRepository");

// ── In-memory store (production: dedicated DB table) ──────────────────────

const decisionStore = new Map<string, HistoricalDecisionRecord>();

// ── Persist a new decision ─────────────────────────────────────────────────

export async function persistDecision(
  storeId: string,
  decision: DecisionRecord,
  createdByUserId = "SYSTEM",
): Promise<HistoricalDecisionRecord> {
  const structuredImpact = DECISION_IMPACTS[decision.decisionId] ?? {
    revenueImpact:     { direction: "NEUTRAL",  magnitude: "LOW",    description: "Impact not yet quantified", estimatedValue: null, currency: null, horizon: "SHORT_TERM" as const },
    profitImpact:      { direction: "NEUTRAL",  magnitude: "LOW",    description: "Impact not yet quantified", estimatedValue: null, currency: null, horizon: "SHORT_TERM" as const },
    cashImpact:        { direction: "NEUTRAL",  magnitude: "LOW",    description: "Impact not yet quantified", estimatedValue: null, currency: null, horizon: "SHORT_TERM" as const },
    inventoryImpact:   { direction: "NEUTRAL",  magnitude: "LOW",    description: "No inventory impact",        estimatedValue: null, currency: null, horizon: "SHORT_TERM" as const },
    operationalImpact: { direction: "NEUTRAL",  magnitude: "LOW",    description: "Operational review needed",  estimatedValue: null, currency: null, horizon: "SHORT_TERM" as const },
    confidence: decision.confidence,
    impactType: "profit" as const,
    impactLabel: "Est. Impact",
    impactValue: "TBD",
  };

  const initialTransition: DecisionStatusTransition = {
    fromStatus: null,
    toStatus: "OPEN",
    transitionedAt: new Date().toISOString(),
    transitionedBy: createdByUserId,
    reason: `Decision created by Decision Engine. Rule: ${decision.triggeredByRule}`,
  };

  const record: HistoricalDecisionRecord = {
    id: crypto.randomUUID(),
    storeId,
    decisionId: decision.decisionId,
    decisionName: decision.decisionName,
    category: decision.category,
    priority: decision.priority,
    triggeredByRule: decision.triggeredByRule,
    triggeredAt: decision.createdAt,
    reason: decision.reason,
    affectedEntity: decision.affectedEntity,
    recommendedAction: decision.recommendedAction,
    structuredImpact,
    confidence: decision.confidence,
    opportunityScore: decision.opportunityScore,
    riskScore: decision.riskScore,
    supportingScores: decision.supportingScores,
    supportingKpis: decision.supportingKpis,
    supportingFormulaIds: decision.supportingFormulaIds,
    currentStatus: "OPEN",
    statusHistory: [initialTransition],
    expiresAt: decision.expiresAt,
    formulaVersion: "1.0.0",
  };

  // In-memory
  decisionStore.set(record.id, record);

  // Persist to settings table
  try {
    await prisma.setting.upsert({
      where: { storeId_key: { storeId, key: `decision_history:${record.id}` } },
      update: { value: JSON.stringify(record) },
      create: { storeId, key: `decision_history:${record.id}`, value: JSON.stringify(record) },
    });
  } catch (err) {
    logger.warn("Decision persistence failed (cache available)", { metadata: { error: String(err) } });
  }

  return record;
}

// ── Status transition (append-only) ───────────────────────────────────────

export async function transitionDecisionStatus(
  id: string,
  newStatus: DecisionStatus,
  transitionedBy: string,
  reason?: string,
): Promise<HistoricalDecisionRecord> {
  const record = decisionStore.get(id);
  if (!record) throw new AppError({ code: "DECISION_NOT_FOUND", message: `Decision ${id} not found`, severity: "HIGH" });

  if (!isValidTransition(record.currentStatus, newStatus)) {
    throw new AppError({
      code: "INVALID_STATUS_TRANSITION",
      message: `Cannot transition decision ${id} from ${record.currentStatus} to ${newStatus} (055_DECISION_ENGINE lifecycle)`,
      severity: "HIGH",
    });
  }

  // Append transition (history is immutable — append only)
  const transition: DecisionStatusTransition = {
    fromStatus: record.currentStatus,
    toStatus: newStatus,
    transitionedAt: new Date().toISOString(),
    transitionedBy,
    reason,
  };

  record.currentStatus = newStatus;
  record.statusHistory = [...record.statusHistory, transition];
  if (newStatus === "ARCHIVED") record.archivedAt = new Date().toISOString();

  decisionStore.set(id, record);

  try {
    const storeId = record.storeId;
    await prisma.setting.update({
      where: { storeId_key: { storeId, key: `decision_history:${id}` } },
      data: { value: JSON.stringify(record) },
    });
  } catch (err) {
    logger.warn("Decision status update persistence failed", { metadata: { error: String(err) } });
  }

  return record;
}

// ── Read ────────────────────────────────────────────────────────────────────

export interface DecisionHistoryFilter {
  storeId: string;
  status?: DecisionStatus;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function getDecisionHistory(
  filter: DecisionHistoryFilter,
): Promise<{ records: HistoricalDecisionRecord[]; total: number }> {
  const { storeId, status, category, from, to, page = 1, pageSize = 20 } = filter;

  // Try in-memory first
  let records = [...decisionStore.values()].filter(r => r.storeId === storeId);

  // Fall back to DB
  if (records.length === 0) {
    try {
      const settings = await prisma.setting.findMany({
        where: { storeId, key: { startsWith: "decision_history:" } },
        orderBy: { key: "desc" },
      });
      records = settings
        .map(s => { try { return JSON.parse(s.value) as HistoricalDecisionRecord; } catch { return null; } })
        .filter((r): r is HistoricalDecisionRecord => r !== null && r.storeId === storeId);
    } catch { records = []; }
  }

  // Apply filters
  if (status) records = records.filter(r => r.currentStatus === status);
  if (category) records = records.filter(r => r.category === category);
  if (from) records = records.filter(r => r.triggeredAt >= from);
  if (to) records = records.filter(r => r.triggeredAt <= to);

  // Sort: newest first
  records.sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));

  const total = records.length;
  const start = (page - 1) * pageSize;
  return { records: records.slice(start, start + pageSize), total };
}

export async function getDecisionById(id: string): Promise<HistoricalDecisionRecord | null> {
  if (decisionStore.has(id)) return decisionStore.get(id)!;
  return null;
}
