"use client";
/**
 * Reports page — Pre-Preview Fix 3.
 * Repository: 017_REPORTING_ENGINE.md v2.0.0
 * - CSV export: fully functional (calls /api/v1/reports then exports).
 * - PDF/Excel: scaffold — clearly labeled, production libs not installed.
 * - Reports consume Reporting Engine outputs only (ER-002).
 */
import { useState } from "react";
import { cn } from "@/lib/utils";

type ReportCategory = "EXECUTIVE" | "FINANCIAL" | "INVENTORY" | "MARKETING" | "SHIPPING" | "SCORE" | "DECISION" | "PRODUCT" | "CASH_FLOW";
type ExportFormat   = "CSV" | "PDF" | "EXCEL";

const REPORT_CATEGORIES: Array<{ id: ReportCategory; label: string; labelAr: string; icon: string; desc: string }> = [
  { id: "EXECUTIVE",  label: "Executive Report",  labelAr: "التقرير التنفيذي",     icon: "📊", desc: "Full P&L, lifecycle, scores, decisions, cost evolution" },
  { id: "FINANCIAL",  label: "Financial Report",  labelAr: "التقرير المالي",       icon: "💰", desc: "Revenue, COGS, Gross/Net Profit, Profit Leakage, FIN-001–004" },
  { id: "MARKETING",  label: "Marketing Report",  labelAr: "تقرير التسويق",        icon: "📣", desc: "CPA, ROAS, campaigns, SCORE-003, SCORE-007" },
  { id: "INVENTORY",  label: "Inventory Report",  labelAr: "تقرير المخزون",       icon: "📦", desc: "FIFO, turnover, dead stock, SCORE-006" },
  { id: "SHIPPING",   label: "Shipping Report",   labelAr: "تقرير الشحن",          icon: "🚚", desc: "Lifecycle, delivery rates, SCORE-005, governorates" },
  { id: "SCORE",      label: "Score Report",      labelAr: "تقرير الدرجات",       icon: "🏆", desc: "All 9 scores, history, component breakdown" },
  { id: "DECISION",   label: "Decision Report",   labelAr: "تقرير القرارات",      icon: "🎯", desc: "Active decisions, lifecycle, structured impact" },
  { id: "PRODUCT",    label: "Product Report",    labelAr: "تقرير المنتجات",       icon: "🏷️", desc: "Profit contribution per product, FIN-004" },
  { id: "CASH_FLOW",  label: "Cash Flow Report",  labelAr: "تقرير التدفق النقدي", icon: "💵", desc: "Realized/Pending/Expected/Lost cash, settlements, FR-004" },
];

const PERIOD_OPTIONS = ["TODAY","LAST_7_DAYS","LAST_30_DAYS","THIS_MONTH","LAST_MONTH","THIS_QUARTER","THIS_YEAR"];

const MOCK_STORE_ID = "00000000-0000-0000-0000-000000000001";

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("EXECUTIVE");
  const [selectedFormat,   setSelectedFormat]   = useState<ExportFormat>("CSV");
  const [period, setPeriod] = useState("LAST_30_DAYS");
  const [generating, setGenerating] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [error, setError]     = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: MOCK_STORE_ID,
          category: selectedCategory,
          period,
          format: selectedFormat,
          includeAppendices: true,
          viewMode: "ORDERS",
          showProjected: false,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message ?? "Report generation failed");

      if (selectedFormat === "CSV") {
        // Download CSV
        const csvRes = await fetch("/api/v1/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: MOCK_STORE_ID, category: selectedCategory, period,
            format: "CSV", includeAppendices: true, viewMode: "ORDERS", showProjected: false,
          }),
        });
        const csvData = await csvRes.json();
        const report = csvData.data;
        // Build CSV from sections
        const rows: string[] = ["reportId,category,section,field,value"];
        for (const s of (report.sections ?? [])) {
          for (const [k, v] of Object.entries(s.data ?? {})) {
            rows.push(`"${report.reportId}","${report.category}","${s.title}","${k}","${JSON.stringify(v).replace(/"/g, '""')}"`);
          }
        }
        const blob = new Blob([rows.join("\n")], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `${selectedCategory}_${period}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setResult({ ...data.data, csvDownloaded: true });
      } else {
        setResult(data.data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">All reports consume Reporting Engine outputs only (ER-002).</p>
      </div>

      {/* Export format notice */}
      <div className="grid grid-cols-3 gap-3">
        {(["CSV","PDF","EXCEL"] as ExportFormat[]).map(fmt => (
          <button key={fmt}
            onClick={() => setSelectedFormat(fmt)}
            className={cn(
              "rounded-xl border-2 p-3 text-sm font-medium transition-all",
              selectedFormat === fmt ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
            )}>
            {fmt === "CSV"   && <><span className="block text-xl">📊</span>CSV<br/><span className="text-xs font-normal text-green-600">✓ Fully functional</span></>}
            {fmt === "PDF"   && <><span className="block text-xl">📄</span>PDF<br/><span className="text-xs font-normal text-amber-600">⚠ Scaffold / Preview</span></>}
            {fmt === "EXCEL" && <><span className="block text-xl">📋</span>Excel<br/><span className="text-xs font-normal text-amber-600">⚠ Scaffold / Preview</span></>}
          </button>
        ))}
      </div>

      {(selectedFormat === "PDF" || selectedFormat === "EXCEL") && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          <span className="font-semibold">{selectedFormat} export is a scaffold</span> — production rendering libraries
          (puppeteer for PDF, ExcelJS for Excel) are not installed in this preview environment.
          The report structure, sections, and data are fully correct. CSV export is fully functional and recommended for this preview.
        </div>
      )}

      {/* Report category grid */}
      <div className="grid md:grid-cols-3 gap-3">
        {REPORT_CATEGORIES.map(cat => (
          <button key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "rounded-xl border-2 p-3 text-left transition-all hover:shadow-md",
              selectedCategory === cat.id
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300",
            )}>
            <p className="text-lg">{cat.icon}</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{cat.label}</p>
            <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{cat.labelAr}</p>
            <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
          </button>
        ))}
      </div>

      {/* Period + generate */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none">
          {PERIOD_OPTIONS.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
        </select>
        <button
          onClick={generate}
          disabled={generating}
          className="rounded-xl bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : `Generate ${selectedCategory} Report (${selectedFormat})`}
        </button>
        {error && <p className="text-sm text-red-600">Error: {error}</p>}
      </div>

      {/* Result preview */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{result.title}</p>
              <p className="text-xs text-gray-400">{result.titleAr} · {result.periodLabel} · {result.generatedAt?.slice(0,19)}</p>
            </div>
            <span className="rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5 font-medium">{result.status}</span>
          </div>

          {result.csvDownloaded && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700">
              ✓ CSV downloaded — {result.sections?.length ?? 0} sections exported.
            </div>
          )}

          {/* Sections summary */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sections ({result.sections?.length ?? 0})</p>
            {(result.sections ?? []).map((s: any, i: number) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">{s.title}</p>
                  <p className="text-xs text-gray-400" dir="rtl">{s.titleAr}</p>
                </div>
                {s.formulaRefs?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.formulaRefs.map((ref: string) => (
                      <span key={ref} className="rounded bg-purple-50 border border-purple-200 px-1.5 py-0.5 text-xs font-mono text-purple-700">{ref}</span>
                    ))}
                  </div>
                )}
                {s.notes?.map((note: string, ni: number) => (
                  <p key={ni} className="text-xs text-gray-500 mt-1 italic">• {note}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Appendices summary */}
          {result.appendices?.formulas?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Formula Appendix</p>
              <div className="flex flex-wrap gap-1">
                {result.appendices.formulas.map((f: any) => (
                  <span key={f.formulaId} className="rounded bg-gray-50 border border-gray-200 px-1.5 py-0.5 text-xs font-mono">{f.formulaId}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
