"use client";
/**
 * Formula Inspector page — Pre-Preview Fix 1.
 * Primary: fetches from /api/v1/formulas/inspect (backend API).
 * Fallback: local Formula Catalog only when API unavailable.
 * Supports Formula IDs, KPI IDs, Score IDs, Decision IDs.
 * Repository: 009_FORMULA_ENGINE.md, 033_FORMULA_CATALOG.md, 034_KPI_CATALOG.md,
 *             054_SCORE_CATALOG.md, 055_DECISION_ENGINE.md
 */
import { useState } from "react";
import { FormulaInspectorFull } from "@/components/formula-inspector/FormulaInspectorFull";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { group: "Financial (FIN)", ids: ["FIN-001", "FIN-002", "FIN-003", "FIN-004", "TRUE-001", "MARG-001", "SHIP-001"] },
  { group: "Inventory (INV)", ids: ["INV-001", "INV-002", "INV-003", "INV-004", "INV-005"] },
  { group: "Marketing (MKT)", ids: ["MKT-002", "MKT-003", "MKT-004", "MKT-005", "MKT-006", "MKT-010", "MKT-011", "MKT-012", "MKT-013"] },
  { group: "Shipping (SHP)",  ids: ["SHP-001", "SHP-002", "SHP-003", "SHP-004", "SHP-005"] },
  { group: "Scores (054)",    ids: ["SCORE-001", "SCORE-002", "SCORE-003", "SCORE-004", "SCORE-005", "SCORE-006", "SCORE-007", "SCORE-008", "SCORE-009"] },
  { group: "Decisions (055)", ids: ["DEC-001", "DEC-002", "DEC-003", "DEC-004", "DEC-005", "DEC-006", "DEC-007", "DEC-008", "DEC-009", "DEC-010"] },
];

export default function FormulaInspectorPage() {
  const [selectedId, setSelectedId] = useState<string>("FIN-001");
  const [inputId, setInputId]   = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  // Mock storeId — production would come from auth context
  const MOCK_STORE_ID = "00000000-0000-0000-0000-000000000001";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Formula Inspector</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Inspect Formula IDs, KPI IDs, Score IDs, and Decision IDs.
          Primary source: <code className="text-xs bg-gray-100 px-1 rounded">/api/v1/formulas/inspect</code> — local catalog as fallback.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <input
          value={inputId}
          onChange={e => setInputId(e.target.value.toUpperCase())}
          placeholder="Enter ID: FIN-001, KPI-FIN-001, SCORE-001, DEC-003..."
          className="flex-1 max-w-md rounded-xl border border-gray-200 px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-300 focus:outline-none"
        />
        <button
          onClick={() => { if (inputId.trim()) { setSelectedId(inputId.trim()); setPanelOpen(true); } }}
          className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          Inspect
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick links panel */}
        <div className="lg:col-span-1 space-y-4">
          {QUICK_LINKS.map(group => (
            <div key={group.group} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{group.group}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.ids.map(id => (
                  <button key={id}
                    onClick={() => { setSelectedId(id); setPanelOpen(true); }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-colors border",
                      selectedId === id && panelOpen
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200",
                    )}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* SCORE-001 special note */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <p className="font-semibold mb-1">SCORE-001 Business Stability</p>
            <p>RESERVED / INACTIVE v1.0. Active in v2.0.0 when ≥90 days historical data exists.
              Active weight table: 7 components, Σ=100%. (Repository Consistency Pass 2026-06-12)</p>
          </div>
        </div>

        {/* Inspector detail */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-96">
            {panelOpen && selectedId ? (
              <FormulaInspectorFull
                entityId={selectedId}
                storeId={MOCK_STORE_ID}
                isOpen={true}
                onClose={() => setPanelOpen(false)}
                onNavigate={id => setSelectedId(id)}
                inline={true}
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-center p-8">
                <div>
                  <p className="text-4xl mb-3">ƒ</p>
                  <p className="text-sm text-gray-500">Select an ID from the left or search above to inspect.</p>
                  <p className="text-xs text-gray-400 mt-1">Supports: FIN-xxx · KPI-xxx · SCORE-xxx · DEC-xxx</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
