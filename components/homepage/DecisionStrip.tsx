"use client";
import type { Terms } from "./locale";
import { cn } from "@/lib/utils";

interface DecisionStripProps {
  t: Terms;
  locale: "en" | "ar";
  decision: {
    name: string; reason: string;
    profitImpact: string; cashImpact: string;
    confidence: number; priority: string; id: string;
  };
}

export function DecisionStrip({ t, locale, decision }: DecisionStripProps) {
  const isHigh = decision.priority === "HIGH" || decision.priority === "CRITICAL";
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5">
        {/* Priority badge */}
        <div className="shrink-0">
          <span className={cn("rounded-full text-xs font-bold px-2.5 py-1",
            isHigh ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600")}>
            {decision.priority}
          </span>
        </div>

        {/* Action */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{decision.name}</p>
          <p className="text-xs text-gray-500 truncate">{decision.reason}</p>
        </div>

        {/* Impact */}
        <div className="flex items-center gap-4 shrink-0 text-xs">
          <div>
            <span className="text-gray-400">{t.profitImpact}: </span>
            <span className="font-semibold text-green-600">{decision.profitImpact}</span>
          </div>
          <div>
            <span className="text-gray-400">{t.cashImpact}: </span>
            <span className="font-semibold text-green-600">{decision.cashImpact}</span>
          </div>
          <div>
            <span className="text-gray-400">{t.confidence}: </span>
            <span className="font-semibold text-gray-700">{Math.round(decision.confidence * 100)}%</span>
          </div>
          <span className="text-gray-300 italic hidden md:block">{t.rulePreview}</span>
        </div>
      </div>
    </div>
  );
}
