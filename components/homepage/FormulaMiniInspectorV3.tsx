"use client";
/**
 * FormulaMiniInspector V3 — full numeric substitution, line by line.
 * Every calculated number shows: name, ID, definition, full expression,
 * numeric breakdown, result, sources, dependencies, version.
 */
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FORMULA_REGISTRY } from "@/modules/formula-engine";
import { cn } from "@/lib/utils";

export interface InspectorInputLine {
  label: string;
  value: string;
  isSubtracted?: boolean;
  isResult?: boolean;
}

interface Props {
  formulaId: string;
  resultValue?: string;
  inputLines?: InspectorInputLine[];
  dataSources?: string[];
  lastUpdated?: string;
  locale?: "en" | "ar";
  className?: string;
  /** Position override: "left" | "right" (default: "left") */
  position?: "left" | "right";
}

export function FormulaMiniInspector({
  formulaId, resultValue, inputLines, dataSources,
  lastUpdated, locale = "en", className, position = "left",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const formula = FORMULA_REGISTRY[formulaId];

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const isAr = locale === "ar";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn("text-gray-300 hover:text-indigo-500 transition-colors text-xs leading-none px-0.5", className)}
        aria-label={`Formula: ${formulaId}`}
      >
        ⓘ
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 top-5 w-80 bg-white border border-gray-200 rounded-xl shadow-xl text-left",
            position === "right" ? "right-0" : "left-0",
          )}
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {isAr && formula ? (formula as any).nameAr ?? formula.name : formula?.name ?? formulaId}
              </p>
              <p className="text-xs font-mono text-indigo-500 mt-0.5">{formulaId}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 text-base leading-none mt-0.5">✕</button>
          </div>

          {/* Body */}
          <div className="p-3 space-y-3">
            {/* Business definition */}
            {formula && (
              <p className="text-xs text-gray-600">{formula.businessMeaning}</p>
            )}

            {/* Expression */}
            {formula && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {isAr ? "التعبير" : "Expression"}
                </p>
                <p className="text-xs font-mono text-indigo-700 leading-relaxed">{formula.expression}</p>
              </div>
            )}

            {/* Full numeric substitution — line by line */}
            {inputLines && inputLines.length > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {isAr ? "هذه الفترة" : "This Period"}
                </p>
                <div className="space-y-0.5">
                  {inputLines.map((line, i) => (
                    <div key={i} className={cn(
                      "flex justify-between items-center text-xs font-mono py-0.5",
                      line.isResult
                        ? "border-t border-blue-200 pt-1 mt-1 font-bold text-indigo-700"
                        : line.isSubtracted
                        ? "text-red-600"
                        : "text-gray-700",
                    )}>
                      <span>{line.isSubtracted ? "− " : line.isResult ? "= " : "  "}{line.label}</span>
                      <span>{line.value}</span>
                    </div>
                  ))}
                  {resultValue && !inputLines.some(l => l.isResult) && (
                    <div className="flex justify-between items-center text-xs font-mono font-bold text-indigo-700 border-t border-blue-200 pt-1 mt-1">
                      <span>= {isAr ? "النتيجة" : "Result"}</span>
                      <span>{resultValue}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data sources */}
            {dataSources && dataSources.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {isAr ? "مصادر البيانات" : "Data Sources"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {dataSources.map(s => (
                    <span key={s} className="rounded-full bg-gray-100 text-gray-600 text-xs px-2 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {formula && formula.dependencies.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {isAr ? "يعتمد على" : "Depends on"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {formula.dependencies.map(d => (
                    <span key={d} className="rounded bg-indigo-50 border border-indigo-100 text-xs font-mono text-indigo-600 px-1.5 py-0.5">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer: version + link */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {isAr ? "الإصدار" : "v"}{formula?.version ?? "1.0.0"}
                {lastUpdated && <> · {lastUpdated}</>}
              </span>
              <Link href="/en/dashboard/formula-settings"
                onClick={() => setOpen(false)}
                className="text-xs text-indigo-500 hover:underline">
                {isAr ? "فتح الإعدادات" : "Open Formula Settings"} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
