"use client";
/**
 * AI Daily Brief UI component.
 * Repository: 011_AI_ENGINE.md v2.0.0 — AI DAILY BRIEF
 * "Daily Brief narrates Score and Decision Engine outputs. Does NOT generate them." (011)
 *
 * ER-002: fetches from /api/v1/ai/brief — zero calculation in component.
 */

import { useState, useEffect } from "react";
import type { AiDailyBrief } from "@/modules/ai-engine/types/ai.types";
import { cn } from "@/lib/utils";

interface AiDailyBriefWidgetProps {
  storeId: string;
  locale?: "en" | "ar";
  onInspect?: (entityId: string) => void;
}

export function AiDailyBriefWidget({ storeId, locale = "en", onInspect }: AiDailyBriefWidgetProps) {
  const [brief, setBrief] = useState<AiDailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/ai/brief?storeId=${storeId}&locale=${locale}`)
      .then(r => r.json())
      .then(data => { if (data.success) setBrief(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId, locale]);

  const criticalCount = brief?.priorityActions.length ?? 0;

  return (
    <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-semibold text-indigo-900 text-sm">AI Daily Brief</p>
            <p className="text-xs text-indigo-600">
              {loading ? "Generating..." : `Narrates Score + Decision outputs · ${criticalCount} action${criticalCount === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <span className="text-indigo-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-indigo-100">
          {loading ? (
            <div className="space-y-2 pt-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-indigo-100" />)}
            </div>
          ) : brief ? (
            <>
              {/* Scores summary */}
              <div className="pt-3">
                <p className="text-xs font-semibold text-indigo-700 mb-1">Score Engine Summary</p>
                <p className="text-xs text-gray-600">{brief.scoresSummary}</p>
              </div>

              {/* Sections */}
              {brief.sections.map(s => (
                <div key={s.sectionKey} className="rounded-lg bg-white border border-indigo-100 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">{s.title}</p>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{s.content}</p>

                  {/* Score/Decision refs as clickable pills */}
                  {(s.kpiRefs.length > 0 || s.decisionRefs.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[...s.kpiRefs, ...s.decisionRefs].slice(0, 5).map(ref => (
                        <button key={ref} onClick={() => onInspect?.(ref)}
                          className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-xs text-indigo-700 hover:bg-indigo-100">
                          {ref}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Priority actions from Decision Engine */}
              {brief.priorityActions.length > 0 && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                  <p className="text-xs font-semibold text-orange-700 mb-2">Priority Actions (from Decision Engine)</p>
                  {brief.priorityActions.map((a, i) => (
                    <p key={i} className="text-xs text-orange-700 mb-1">• {a}</p>
                  ))}
                </div>
              )}

              {/* Confidence + timestamp */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Confidence: {Math.round(brief.confidence * 100)}%</span>
                <span>{new Date(brief.generatedAt).toLocaleTimeString()}</span>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-indigo-300 text-center italic">
                AI narrates engine outputs · Scores from Score Engine · Recommendations from Decision Engine
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 pt-3 text-center">
              No brief available. Run Score Engine and Decision Engine first.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
