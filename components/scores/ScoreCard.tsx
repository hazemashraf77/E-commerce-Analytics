"use client";
/**
 * ScoreCard component.
 * Repository: 054_SCORE_CATALOG.md — BR-SCORE-006: Dashboard displays; NEVER calculates.
 * Renders: score, grade, trend, confidence, stability, recommended action, inspector trigger.
 */

import type { ScoreCardProps, ScoreGrade } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

const gradeConfig: Record<ScoreGrade, { label: string; bar: string; bg: string; border: string }> = {
  excellent:   { label: "Excellent",  bar: "bg-green-500",  bg: "bg-green-50",  border: "border-green-400" },
  "very-good": { label: "Very Good",  bar: "bg-green-400",  bg: "bg-green-50",  border: "border-green-300" },
  good:        { label: "Good",       bar: "bg-yellow-400", bg: "bg-yellow-50", border: "border-yellow-300" },
  average:     { label: "Average",    bar: "bg-orange-400", bg: "bg-orange-50", border: "border-orange-300" },
  poor:        { label: "Poor",       bar: "bg-orange-500", bg: "bg-orange-50", border: "border-orange-400" },
  critical:    { label: "Critical",   bar: "bg-red-500",    bg: "bg-red-50",    border: "border-red-500" },
};

const trendIcon: Record<string, string> = {
  stable: "→", improving: "↑", declining: "↓", volatile: "↕", "critical-decline": "↓↓",
};

const confidenceColors = { high: "text-green-600", medium: "text-amber-600", low: "text-red-600" };

export function ScoreCard({
  scoreId, scoreName, scoreNameAr, score, grade, trend, stability,
  confidence, confidencePct, delta, recommendedAction, lastUpdated,
  loading, onInspect, history,
}: ScoreCardProps) {
  const cfg = gradeConfig[grade];

  return (
    <div className={cn(
      "rounded-xl border-2 p-4 shadow-sm transition-shadow hover:shadow-md",
      cfg.bg, cfg.border,
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-mono text-gray-400">{scoreId}</p>
          <p className="text-sm font-semibold text-gray-800">{scoreName}</p>
          <p className="text-xs text-gray-400" dir="rtl">{scoreNameAr}</p>
        </div>
        <button
          onClick={onInspect}
          className="rounded px-1.5 py-0.5 text-xs font-mono text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shrink-0"
          title="Score Inspector"
        >
          ƒ
        </button>
      </div>

      {/* Score value + gauge */}
      {loading ? (
        <div className="h-10 w-full animate-pulse rounded bg-gray-200 mb-3" />
      ) : (
        <>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-4xl font-bold text-gray-900 tabular-nums">{score}</span>
            <span className="text-sm text-gray-500 mb-1">/ 100</span>
            <span className="ml-auto text-sm font-semibold text-gray-700">{cfg.label}</span>
          </div>
          {/* Score bar */}
          <div className="h-2 w-full rounded-full bg-gray-200 mb-3 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", cfg.bar)}
              style={{ width: `${score}%` }}
            />
          </div>
        </>
      )}

      {/* Trend + delta + sparkline (UI Polish 4) */}
      <div className="flex items-center gap-3 text-xs mb-2">
        <span className={cn("font-medium", delta >= 0 ? "text-green-600" : "text-red-600")}>
          {trendIcon[trend]} {delta >= 0 ? "+" : ""}{delta} pts
        </span>
        <span className="text-gray-400">{stability}</span>
        <span className={cn("ml-auto", confidenceColors[confidence])}>
          {confidencePct}% confidence
        </span>
        {/* Sparkline from Score Engine historical data (UI Polish 4, zero calculation) */}
        {history && history.length > 1 && (
          <ScoreSparkline history={history} color={grade === "critical" ? "#ef4444" : grade === "average" || grade === "poor" ? "#f59e0b" : "#10b981"} />
        )}
      </div>

      {/* Recommended action */}
      <p className="text-xs text-gray-600 border-t border-gray-200 pt-2 line-clamp-2">
        {recommendedAction}
      </p>

      <p className="text-xs text-gray-300 mt-1">
        Updated {new Date(lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
}

// ── Sparkline component (UI Polish 4) ─────────────────────────────────────
// Renders precomputed historical score data from Score Engine.
// Zero calculation — values arrive from Score Engine API.

interface SparklineProps {
  history: Array<{ date: string; score: number }>;
  color?: string;
}

export function ScoreSparkline({ history, color = "#4f46e5" }: SparklineProps) {
  if (!history || history.length < 2) return null;

  const scores = history.map(h => h.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const W = 80, H = 24;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W;
    const y = H - ((s - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={W} height={H} className="overflow-visible" aria-label="Score trend sparkline">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
