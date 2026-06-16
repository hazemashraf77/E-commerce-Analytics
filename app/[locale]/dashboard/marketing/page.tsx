
"use client";
/**
 * Marketing Intelligence — 062_MARKETING_INTELLIGENCE.md
 * ER-002: Zero UI calculations. All values from formula-engine / mock data.
 * Formulas: MKT-002–006 (CPA family), MKT-010–012 (ROAS family), MKT-013 (PPAP)
 */
import { useState } from "react";
import Link from "next/link";
import { MOCK_CPA_BY_STAGE, MOCK_ROAS_FULL_LIFECYCLE, MOCK_SCORES, MOCK_DECISIONS, MOCK_OPERATIONAL_KPIS } from "@/lib/dashboard/mock-data";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import { SectionHeader, PeriodSelector } from "@/components/shared/index";
import { CpaEvolutionChart, RoasEvolutionChart } from "@/components/charts/index";
import { cn } from "@/lib/utils";

const AD_SPEND = 8700; const DELIVERED = 87; const CONFIRMED = 115; const SHIPPED = 100; const TOTAL_ORDERS = 120;
const REVENUE = 84750; const TRUE_PROFIT = 8190; const PLATFORM_REV = 92000;

const CPAS = [
  { label: "Ad CPA",        value: 72.5, formulaId: "MKT-004", note: "per created order" },
  { label: "Confirmed CPA", value: 75.6, formulaId: "MKT-005", note: "per confirmed order" },
  { label: "Shipped CPA",   value: 87.0, formulaId: "MKT-006", note: "per shipped order" },
  { label: "Delivered CPA", value: 100.0, formulaId: "MKT-003", note: "per delivered order" },
  { label: "True CPA",      value: 100.0, formulaId: "MKT-002", note: "final — True cost" },
];
const ROASES = [
  { label: "Platform ROAS",  value: 10.57, formulaId: "MKT-010", note: "platform-reported", warn: true },
  { label: "Delivered ROAS", value: 9.74,  formulaId: "MKT-011", note: "realized revenue ÷ spend" },
  { label: "True ROAS",      value: 0.94,  formulaId: "MKT-012", note: "True Profit ÷ Ad Spend" },
];
const PPAP = 0.94;
const MOCK_CAMPAIGNS = [
  { id:"C1", name:"Summer Collection", platform:"Meta",   spend:3200, delivered:31, revenue:29000, trueProfit:3100, cpa:103, truRoas:0.97, ppap:0.97, status:"ACTIVE" },
  { id:"C2", name:"Clearance Sale",    platform:"Meta",   spend:2800, delivered:22, revenue:18700, trueProfit:1200, cpa:127, truRoas:0.43, ppap:0.43, status:"ACTIVE" },
  { id:"C3", name:"Brand Awareness",   platform:"TikTok", spend:1700, delivered:18, revenue:16400, trueProfit:2290, cpa:94,  truRoas:1.35, ppap:1.35, status:"ACTIVE" },
  { id:"C4", name:"Product Demo",      platform:"TikTok", spend:1000, delivered:16, revenue:20650, trueProfit:1600, cpa:63,  truRoas:1.60, ppap:1.60, status:"PAUSED" },
];
const mktScore = MOCK_SCORES.find(s => s.scoreId === "SCORE-007");
const campScore = MOCK_SCORES.find(s => s.scoreId === "SCORE-003");

export default function MarketingPage() {
  const [period, setPeriod] = useState<any>("LAST_30_DAYS");
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Marketing Intelligence</h1>
          <p className="text-xs text-gray-400">Formulas: MKT-002–006 (CPA) · MKT-010–012 (ROAS) · MKT-013 (PPAP) · Deterministic outputs</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Health strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Marketing Health", score: mktScore?.score ?? 65, id: "SCORE-007", note: mktScore?.recommendedAction ?? "" },
          { label: "Campaign Score",   score: campScore?.score ?? 67, id: "SCORE-003", note: campScore?.recommendedAction ?? "" },
          { label: "Total Ad Spend",   text: `EGP ${AD_SPEND.toLocaleString()}`, note: "Last 30 days" },
          { label: "PPAP",             text: `${PPAP.toFixed(2)}×`, note: "True Profit ÷ Ad Spend · MKT-013", warn: PPAP < 1 },
        ].map((c: any, i) => (
          <div key={i} className={cn("rounded-xl border-2 p-4", c.warn ? "border-red-200 bg-red-50" : c.score !== undefined ? (c.score >= 70 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50") : "border-gray-200 bg-white")}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.label}</p>
            {c.score !== undefined
              ? <p className="text-3xl font-black mt-1 text-gray-800">{c.score}<span className="text-lg font-normal text-gray-400">/100</span></p>
              : <p className={cn("text-2xl font-bold tabular-nums mt-1", c.warn ? "text-red-700" : "text-gray-800")}>{c.text}</p>}
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.id ?? c.note}</p>
          </div>
        ))}
      </div>

      {/* CPA Family */}
      <div>
        <SectionHeader title="CPA Family — Lifecycle" titleAr="عائلة تكلفة الاكتساب" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          {CPAS.map(c => (
            <div key={c.formulaId} className={cn("rounded-xl border-2 p-3", c.formulaId === "MKT-002" ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white")}>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold tabular-nums mt-1">EGP {c.value.toFixed(0)}</p>
              <p className="font-mono text-xs text-indigo-500 mt-0.5">{c.formulaId}</p>
              <p className="text-xs text-gray-400">{c.note}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <CpaEvolutionChart data={MOCK_CPA_BY_STAGE} />
        </div>
      </div>

      {/* ROAS Family */}
      <div>
        <SectionHeader title="ROAS Family" titleAr="عائلة عائد الإنفاق" />
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          {ROASES.map(r => (
            <div key={r.formulaId} className={cn("rounded-xl border-2 p-4", r.warn ? "border-amber-200 bg-amber-50" : r.value >= 2 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
              <p className="text-xs font-semibold text-gray-500 uppercase">{r.label}</p>
              <p className="text-3xl font-black tabular-nums mt-1">{r.value.toFixed(2)}<span className="text-lg font-normal">×</span></p>
              <p className="font-mono text-xs text-indigo-500 mt-0.5">{r.formulaId}</p>
              <p className="text-xs text-gray-400 mt-1">{r.note}</p>
              {r.warn && <p className="text-xs text-amber-600 mt-1 font-semibold">⚠ Platform may over-attribute revenue</p>}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <RoasEvolutionChart data={MOCK_ROAS_FULL_LIFECYCLE} />
        </div>
      </div>

      {/* Campaign table */}
      <div>
        <SectionHeader title="Campaign Comparison" titleAr="مقارنة الحملات" />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Campaign","Platform","Spend","Delivered","Revenue","True Profit","CPA","True ROAS","PPAP","Status"].map(h=>(
                  <th key={h} className="px-2 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_CAMPAIGNS.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 font-medium text-gray-800">{c.name}</td>
                    <td className="px-2 py-2 text-gray-500">{c.platform}</td>
                    <td className="px-2 py-2 tabular-nums">EGP {c.spend.toLocaleString()}</td>
                    <td className="px-2 py-2 text-center font-semibold text-green-700">{c.delivered}</td>
                    <td className="px-2 py-2 tabular-nums">EGP {c.revenue.toLocaleString()}</td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", c.trueProfit >= 0 ? "text-green-700":"text-red-600")}>EGP {c.trueProfit.toLocaleString()}</td>
                    <td className="px-2 py-2 tabular-nums">EGP {c.cpa}</td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", c.truRoas >= 1 ? "text-green-700":"text-red-600")}>{c.truRoas.toFixed(2)}×</td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", c.ppap >= 1 ? "text-green-700":"text-red-600")}>{c.ppap.toFixed(2)}</td>
                    <td className="px-2 py-2"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", c.status==="ACTIVE"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600")}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-50 text-xs text-gray-400">All values from KPI Calculator · MKT-002–013</div>
        </div>
      </div>

      {/* Decision */}
      {MOCK_DECISIONS.filter(d => d.category === "Marketing").map(d => (
        <div key={d.decisionId} className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-purple-900">{d.decisionName} ({d.decisionId})</p>
            <span className="rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5">{d.priority}</span>
          </div>
          <p className="text-xs text-gray-700">{d.recommendedAction}</p>
          <p className="text-xs text-indigo-600 mt-1">Expected impact: {d.expectedImpact}</p>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {[{h:"/en/dashboard",l:"← Executive"},{h:"/en/dashboard/finance",l:"Finance"},{h:"/en/dashboard/shipping",l:"Shipping"},{h:"/en/dashboard/formula-inspector",l:"ƒ Formulas"}].map(l=>(
          <Link key={l.h} href={l.h} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">{l.l}</Link>
        ))}
      </div>
    </div>
  );
}
