"use client";
/**
 * Formula Inspector — full UI implementation.
 * Repository: 007_FINANCIAL_ENGINE.md — FORMULA INSPECTOR INTEGRATION
 *             009_FORMULA_ENGINE.md — Formula Inspector
 *             014_DASHBOARD_ARCHITECTURE.md — "Every KPI supports Formula Inspector"
 *
 * Fetches definitions from:
 *   /api/v1/formulas/inspect?kpiId=     → KPI definition + formula ref
 *   /api/v1/scores?storeId=             → Score definition (for SCORE-xxx IDs)
 *   /api/v1/decisions?storeId=          → Decision details (for DEC-xxx IDs)
 *
 * ER-002: displays pre-computed values only. Zero calculation in component.
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type InspectorEntityType = "FORMULA" | "KPI" | "SCORE" | "DECISION";

interface InspectorEntity {
  type: InspectorEntityType;
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  expression?: string;      // formula expression
  version?: string;
  formulaRef?: string;
  components?: Array<{ name: string; weight?: number; contribution?: number }>;
  recommendedActions?: string[];
  supportingRefs?: string[];
  decisionRule?: string;
  expectedImpact?: string;
  confidence?: number;
  notes?: string[];
}

interface FormulaInspectorFullProps {
  entityId?: string;        // KPI-FIN-001, SCORE-001, DEC-001, FIN-001, etc.
  storeId?: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (id: string) => void;  // navigate to referenced entity
  /** When true: renders inline (no fixed positioning, no overlay). Default: false (side panel). */
  inline?: boolean;
}

const typeColors: Record<InspectorEntityType, { badge: string; border: string }> = {
  FORMULA:  { badge: "bg-purple-100 text-purple-800", border: "border-purple-300" },
  KPI:      { badge: "bg-blue-100   text-blue-800",   border: "border-blue-300"   },
  SCORE:    { badge: "bg-green-100  text-green-800",  border: "border-green-300"  },
  DECISION: { badge: "bg-orange-100 text-orange-800", border: "border-orange-300" },
};

const FORMULA_CATALOG: Record<string, Omit<InspectorEntity, "type">> = {
  "FIN-001": { id: "FIN-001", name: "Revenue",           nameAr: "الإيرادات",     expression: "Product Revenue + Customer Shipping Fee",          version: "1.0.0", notes: ["Realized only at DELIVERED status (BR-005)"] },
  "FIN-002": { id: "FIN-002", name: "Net Profit",        nameAr: "صافي الربح",    expression: "Revenue − COGS − Shipping − Marketing − Variable − Fixed ± Adjustments", version: "1.0.0" },
  "FIN-003": { id: "FIN-003", name: "Gross Profit",      nameAr: "إجمالي الربح",  expression: "Revenue − COGS",                                   version: "1.0.0" },
  "FIN-004": { id: "FIN-004", name: "Profit Contribution",nameAr: "مساهمة الربح", expression: "Revenue − FIFO Cost − Advertising − Shipping ± Adjustments (Campaign Product) | Revenue − FIFO Cost ± Adjustments (Non-campaign)", version: "1.0.0", notes: ["Advertising & Shipping allocated exclusively to Campaign Product (BR-FIN-004-01/02)"] },
  "INV-001": { id: "INV-001", name: "FIFO Cost",         nameAr: "تكلفة فايفو",   expression: "Σ (Quantity × Unit Cost per Layer)",                version: "1.0.0" },
  "SHIP-001":{ id: "SHIP-001",name: "Shipping Subsidy",  nameAr: "دعم الشحن",     expression: "Actual Shipping Cost − Customer Shipping Fee",      version: "1.0.0", notes: ["May be positive, zero, or negative (BR-009)"] },
  "OPS-001": { id: "OPS-001", name: "Delivery Rate",     nameAr: "معدل التسليم",  expression: "Delivered Orders / Total Shipped Orders",            version: "1.0.0" },
  "OPS-002": { id: "OPS-002", name: "Return Rate",       nameAr: "معدل الإرجاع",  expression: "Returned Orders / Delivered Orders",                 version: "1.0.0" },
  "OPS-003": { id: "OPS-003", name: "Refusal Rate",      nameAr: "معدل الرفض",    expression: "Refused Orders / Total Shipped Orders",              version: "1.0.0" },
  "MKT-002": { id: "MKT-002", name: "True CPA",          nameAr: "تكلفة الاكتساب",expression: "Marketing Spend / Delivered Orders",                version: "1.0.0" },
  "MKT-003": { id: "MKT-003", name: "Marketing ROI",     nameAr: "عائد التسويق",  expression: "(Revenue − Marketing Spend) / Marketing Spend",     version: "1.0.0" },
};

function resolveLocalEntity(id: string): InspectorEntity | null {
  if (id.startsWith("KPI-")) {
    const formulaId = id.replace("KPI-FIN-001","FIN-001").replace("KPI-FIN-002","FIN-003").replace("KPI-FIN-003","FIN-002").replace("KPI-MKT-002","MKT-002");
    const f = FORMULA_CATALOG[formulaId];
    return f ? { type: "KPI", ...f, formulaRef: formulaId } : null;
  }
  if (FORMULA_CATALOG[id]) return { type: "FORMULA", ...FORMULA_CATALOG[id] };
  if (id.startsWith("SCORE-"))   return { type: "SCORE",    id, name: `Score ${id}`,    nameAr: `درجة ${id}`,    description: "See Score Engine output for full details." };
  if (id.startsWith("DEC-"))     return { type: "DECISION",  id, name: `Decision ${id}`, nameAr: `قرار ${id}`,    description: "See Decision Engine output for full details." };
  return null;
}

export function FormulaInspectorFull({ entityId, storeId, isOpen, onClose, onNavigate, inline = false }: FormulaInspectorFullProps) {
  const [entity, setEntity] = useState<InspectorEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState(entityId ?? "");

  useEffect(() => {
    if (!isOpen || !currentId) return;
    setLoading(true);
    const local = resolveLocalEntity(currentId);
    if (local) { setEntity(local); setLoading(false); return; }

    fetch(`/api/v1/formulas/inspect?kpiId=${currentId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const d = data.data;
          setEntity({ type: "KPI", id: d.kpiId, name: d.kpiName, nameAr: d.nameAr, description: d.description, formulaRef: d.formulaId, version: d.formulaVersion });
        }
      })
      .catch(() => setEntity({ type: "FORMULA", id: currentId, name: currentId, description: "Could not load — check API." }))
      .finally(() => setLoading(false));
  }, [currentId, isOpen]);

  const navigate = (id: string) => {
    setHistory(h => [...h, currentId]);
    setCurrentId(id);
    onNavigate?.(id);
  };

  const goBack = () => {
    const prev = history.at(-1);
    if (prev) { setHistory(h => h.slice(0, -1)); setCurrentId(prev); }
  };

  if (!isOpen) return null;

  const colors = entity ? (typeColors[entity.type as InspectorEntityType] ?? typeColors.FORMULA) : typeColors.FORMULA;

  const wrapperClass = inline
    ? "flex flex-col bg-white h-full"
    : "fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl border-l border-gray-200 w-80 sm:w-96";

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className={cn("flex items-center justify-between p-4 border-b-2", colors.border)}>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button onClick={goBack} className="text-gray-400 hover:text-gray-700 text-lg">←</button>
          )}
          <div>
            <p className="text-xs font-mono text-gray-400">{currentId}</p>
            <h3 className="font-semibold text-gray-800 text-sm">Formula Inspector</h3>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />)}
          </div>
        )}

        {!loading && entity && (
          <>
            {/* Type badge + name */}
            <div>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", colors.badge)}>{entity.type}</span>
              <h4 className="font-bold text-gray-900 mt-1">{entity.name}</h4>
              {entity.nameAr && <p className="text-sm text-gray-500" dir="rtl">{entity.nameAr}</p>}
            </div>

            {/* Formula expression */}
            {entity.expression && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Expression</p>
                <code className="text-sm text-indigo-700 font-mono leading-relaxed">{entity.expression}</code>
              </div>
            )}

            {/* Description */}
            {entity.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700">{entity.description}</p>
              </div>
            )}

            {/* Version */}
            {entity.version && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Version {entity.version}</span>
                <span>·</span>
                <span>033_FORMULA_CATALOG.md</span>
              </div>
            )}

            {/* Formula reference (for KPIs) */}
            {entity.formulaRef && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Formula Reference</p>
                <button
                  onClick={() => navigate(entity.formulaRef!)}
                  className="inline-flex items-center gap-1 rounded bg-purple-50 border border-purple-200 px-2 py-1 text-xs text-purple-700 hover:bg-purple-100"
                >
                  ƒ {entity.formulaRef} →
                </button>
              </div>
            )}

            {/* Components (for Scores) */}
            {entity.components && entity.components.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Components</p>
                <div className="space-y-1">
                  {entity.components.map(c => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{c.name}</span>
                      <div className="flex gap-2">
                        {c.weight !== undefined && <span className="text-gray-400">{(c.weight * 100).toFixed(0)}%</span>}
                        {c.contribution !== undefined && <span className="font-semibold text-indigo-700">{c.contribution.toFixed(1)} pts</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supporting refs */}
            {entity.supportingRefs && entity.supportingRefs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Supporting References</p>
                <div className="flex flex-wrap gap-1">
                  {entity.supportingRefs.map(ref => (
                    <button key={ref} onClick={() => navigate(ref)}
                      className="rounded bg-gray-50 border border-gray-200 px-1.5 py-0.5 text-xs hover:bg-gray-100">
                      {ref} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {entity.notes && entity.notes.length > 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                {entity.notes.map((n, i) => <p key={i} className="text-xs text-amber-700">• {n}</p>)}
              </div>
            )}

            {/* Recommended actions (Scores) */}
            {entity.recommendedActions && entity.recommendedActions.length > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">Recommended Actions</p>
                {entity.recommendedActions.map((a, i) => <p key={i} className="text-xs text-blue-700">• {a}</p>)}
              </div>
            )}
          </>
        )}

        {!loading && !entity && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No entity loaded.</p>
            <p className="text-xs text-gray-300 mt-1">Pass a Formula ID, KPI ID, Score ID, or Decision ID.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 text-xs text-gray-300 text-center">
        Repository: 033_FORMULA_CATALOG · 034_KPI_CATALOG · 054_SCORE_CATALOG · 055_DECISION_ENGINE
      </div>
    </div>
  );
}
