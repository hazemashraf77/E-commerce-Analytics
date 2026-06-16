"use client";
/**
 * Formula Mini Inspector — inline tooltip showing formula details.
 * Used on every calculated number in the dashboard.
 * Repository: 068_FORMULA_ENGINE.md — Formula Inspector
 * ER-002: Display only. No calculation here.
 */
import { useState, useRef, useEffect } from "react";
import { FORMULA_REGISTRY } from "@/modules/formula-engine";
import { cn } from "@/lib/utils";

interface FormulaMiniProps {
  formulaId: string;
  /** The actual computed value to show in the numeric substitution */
  value?: number | string;
  /** Additional context values for substitution display */
  inputs?: Array<{ label: string; value: string }>;
  className?: string;
}

export function FormulaMiniInspector({ formulaId, value, inputs, className }: FormulaMiniProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const formula = FORMULA_REGISTRY[formulaId];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (!formula) {
    return (
      <span className={cn("text-xs font-mono text-gray-300 cursor-default", className)}>
        ⓘ
      </span>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn("text-xs text-gray-400 hover:text-indigo-500 transition-colors leading-none", className)}
        title={`${formula.name} (${formulaId})`}
        aria-label={`Formula inspector: ${formula.name}`}
      >
        ⓘ
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-5 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-left"
          style={{ minWidth: 280 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-gray-900">{formula.name}</p>
              <p className="text-xs font-mono text-indigo-500">{formulaId}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
          </div>

          {/* Expression */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Formula</p>
            <p className="text-xs text-indigo-700 font-mono leading-relaxed">{formula.expression}</p>
          </div>

          {/* Numeric substitution */}
          {(inputs && inputs.length > 0 || value !== undefined) && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">This Period</p>
              {inputs?.map((inp, i) => (
                <p key={i} className="text-xs text-gray-700 font-mono">{inp.label} = {inp.value}</p>
              ))}
              {value !== undefined && (
                <p className="text-xs font-bold text-indigo-700 font-mono mt-1">= {value}</p>
              )}
            </div>
          )}

          {/* Business meaning */}
          <p className="text-xs text-gray-600 mb-2">{formula.businessMeaning}</p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>v{formula.version}</span>
            <span>{formula.owner}</span>
            <span className={cn("rounded-full px-1.5 py-0.5 font-medium",
              formula.lifecycleAware ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500")}>
              {formula.lifecycleAware ? "Lifecycle-aware" : "Always active"}
            </span>
          </div>

          {/* Dependencies */}
          {formula.dependencies.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">Depends on: {formula.dependencies.join(" · ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Inline wrapper: number + formula ⓘ side by side */
export function KpiWithInspector({
  label, labelAr, value, formulaId, inputs, valueClass,
}: {
  label: string; labelAr?: string; value: string | number;
  formulaId: string; inputs?: Array<{ label: string; value: string }>;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <span className={cn("font-bold tabular-nums", valueClass)}>{value}</span>
        <FormulaMiniInspector formulaId={formulaId} value={String(value)} inputs={inputs} />
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
