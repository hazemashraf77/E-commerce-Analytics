
"use client";
/**
 * Shipping Intelligence — 063_SHIPPING_INTELLIGENCE.md
 * ER-002: Zero UI calculations. All values from formula-engine / mock data.
 * Formulas: SHP-001 Delivery Rate, SHP-002 Return Rate, SHP-003 Refusal Rate, SHP-004 Exchange Rate, SHP-005 True Shipping Cost
 */
import { useState } from "react";
import Link from "next/link";
import { MOCK_LIFECYCLE_CARDS, MOCK_SCORES, MOCK_DECISIONS, MOCK_OPERATIONAL_KPIS } from "@/lib/dashboard/mock-data";
import { SectionHeader, PeriodSelector, LifecycleCard, ViewModeToggle } from "@/components/shared/index";
import { cn } from "@/lib/utils";

const OPS = MOCK_OPERATIONAL_KPIS;
const SHIPPING_COST = 5655; const RETURN_SHIP = 450; const TRUE_SHIP = 6105;
const SHIP_SCORE = MOCK_SCORES.find(s => s.scoreId === "SCORE-005");
const GOV_SCORE  = MOCK_SCORES.find(s => s.scoreId === "SCORE-004");

const COURIERS = [
  { name:"Bosta",    delivered:72, refused:3, returned:4, cost:4500, rating:4.2, status:"PRIMARY" },
  { name:"Aramex",  delivered:15, refused:1, returned:1, cost:1155, rating:3.9, status:"SECONDARY" },
];
const GOVS = [
  { name:"Cairo",          del:38, ref:2, ret:1, cost:1800, delivRate:90.5 },
  { name:"Giza",           del:14, ref:2, ret:4, cost:950,  delivRate:70.0 },
  { name:"Alexandria",     del:12, ref:0, ret:0, cost:720,  delivRate:100 },
  { name:"Dakahlia",       del:8,  ref:0, ret:0, cost:640,  delivRate:100 },
  { name:"Sharqia",        del:6,  ref:0, ret:0, cost:480,  delivRate:100 },
  { name:"Other",          del:9,  ref:0, ret:0, cost:720,  delivRate:100 },
];

const RATE_CARDS = [
  { label:"Delivery Rate",  value: OPS.deliveryRate.value*100, target:90, formulaId:"SHP-001", note:`${OPS.deliveryRate.orders} of ${OPS.totalShipped.orders} shipped`, good:true },
  { label:"Return Rate",    value: OPS.returnRate.value*100,   target:5,  formulaId:"SHP-002", note:`${OPS.returnRate.orders} returned of delivered`, good:false },
  { label:"Refusal Rate",   value: OPS.refusalRate.value*100,  target:4,  formulaId:"SHP-003", note:`${OPS.refusalRate.orders} refused at door`, good:false },
  { label:"Exchange Rate",  value: OPS.exchangeRate.value*100, target:5,  formulaId:"SHP-004", note:`${OPS.exchangeRate.orders} exchanged`, good:false },
];

export default function ShippingPage() {
  const [period, setPeriod] = useState<any>("LAST_30_DAYS");
  const [viewMode, setViewMode] = useState<any>("orders");
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Shipping Intelligence</h1>
          <p className="text-xs text-gray-400">Formulas: SHP-001–005 · All values deterministic from Bosta data</p>
        </div>
        <div className="flex gap-3">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Rate cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {RATE_CARDS.map(c => {
          const good = c.good ? c.value >= c.target : c.value <= c.target;
          return (
            <div key={c.formulaId} className={cn("rounded-xl border-2 p-4", good ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.label}</p>
              <p className={cn("text-3xl font-black tabular-nums mt-1", good ? "text-green-700" : "text-red-700")}>{c.value.toFixed(1)}%</p>
              <p className="font-mono text-xs text-indigo-500 mt-0.5">{c.formulaId}</p>
              <p className="text-xs text-gray-400 mt-1">{c.note}</p>
              <p className="text-xs mt-1 font-semibold">{good ? "✓ On target" : `⚠ Target: ${c.good ? "≥" : "≤"}${c.target}%`}</p>
            </div>
          );
        })}
      </div>

      {/* Score + cost strip */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className={cn("rounded-xl border-2 p-4", (SHIP_SCORE?.score ?? 0) >= 70 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50")}>
          <p className="text-xs font-semibold text-gray-500 uppercase">Shipping Score</p>
          <p className="text-3xl font-black mt-1 text-gray-800">{SHIP_SCORE?.score ?? "—"}<span className="text-lg font-normal text-gray-400">/100</span></p>
          <p className="text-xs text-indigo-500 font-mono mt-1">SCORE-005</p>
          <p className="text-xs text-gray-400 mt-1">{SHIP_SCORE?.recommendedAction}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">True Shipping Cost <span className="font-mono text-indigo-500">SHP-005</span></p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-orange-700">EGP {TRUE_SHIP.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Outbound EGP {SHIPPING_COST.toLocaleString()} + Return EGP {RETURN_SHIP.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Governorate Score</p>
          <p className="text-3xl font-black mt-1 text-gray-800">{GOV_SCORE?.score ?? "—"}<span className="text-lg font-normal text-gray-400">/100</span></p>
          <p className="text-xs text-indigo-500 font-mono mt-1">SCORE-004</p>
          <p className="text-xs text-gray-400 mt-1">{GOV_SCORE?.recommendedAction}</p>
        </div>
      </div>

      {/* Lifecycle */}
      <div>
        <SectionHeader title="Order Lifecycle" titleAr="دورة الطلبات" action={<ViewModeToggle mode={viewMode} onChange={setViewMode} />} />
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
          {MOCK_LIFECYCLE_CARDS.map(card => (
            <div key={card.statusKey} className="snap-start shrink-0">
              <LifecycleCard {...card} viewMode={viewMode} />
            </div>
          ))}
        </div>
      </div>

      {/* Courier comparison */}
      <div>
        <SectionHeader title="Courier Performance" titleAr="أداء شركات الشحن" />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Courier","Delivered","Refused","Returned","Shipping Cost","Rating","Status"].map(h=>(
                <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {COURIERS.map(c => (
                <tr key={c.name} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-gray-800">{c.name}</td>
                  <td className="px-3 py-2 text-green-700 font-semibold">{c.delivered}</td>
                  <td className="px-3 py-2 text-red-600">{c.refused}</td>
                  <td className="px-3 py-2 text-amber-600">{c.returned}</td>
                  <td className="px-3 py-2 tabular-nums">EGP {c.cost.toLocaleString()}</td>
                  <td className="px-3 py-2">{"★".repeat(Math.round(c.rating))} {c.rating}</td>
                  <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", c.status==="PRIMARY"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600")}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governorate performance */}
      <div>
        <SectionHeader title="Governorate Performance" titleAr="أداء المحافظات" />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Governorate","Delivered","Refused","Returned","Shipping Cost","Delivery Rate"].map(h=>(
                <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {GOVS.map(g => (
                <tr key={g.name} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-800">{g.name}</td>
                  <td className="px-3 py-2 text-green-700 font-semibold">{g.del}</td>
                  <td className="px-3 py-2 text-red-600">{g.ref || "—"}</td>
                  <td className="px-3 py-2 text-amber-600">{g.ret || "—"}</td>
                  <td className="px-3 py-2 tabular-nums">EGP {g.cost.toLocaleString()}</td>
                  <td className={cn("px-3 py-2 font-semibold", g.delivRate >= 90 ? "text-green-700" : "text-red-600")}>{g.delivRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Returns impact + recovery */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <SectionHeader title="Return & Refusal Impact" titleAr="تأثير المرتجعات" />
          <div className="space-y-2 mt-2">
            {[
              { label:"Return shipping cost",  value:`EGP ${RETURN_SHIP.toLocaleString()}`, cls:"text-red-700" },
              { label:"Revenue lost (refused)", value:"EGP 3,480",  cls:"text-red-700" },
              { label:"Revenue lost (returned)",value:"EGP 4,350",  cls:"text-red-700" },
              { label:"Total leakage",          value:"EGP 8,280",  cls:"text-red-800 font-bold" },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{r.label}</span>
                <span className={cn("tabular-nums font-semibold", r.cls)}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <SectionHeader title="Recovery Opportunity" titleAr="فرصة الاسترداد" />
          <div className="space-y-2 mt-2 text-sm">
            <p className="text-gray-600">If refusal rate drops from 4% → 2%:</p>
            <p className="text-green-700 font-semibold">+EGP 1,740 True Profit per period</p>
            <p className="text-gray-600 mt-3">If return rate drops from 5.75% → 3%:</p>
            <p className="text-green-700 font-semibold">+EGP 2,200 True Profit per period</p>
            <div className="rounded-lg bg-green-50 border border-green-200 p-2 mt-3 text-xs">
              <p className="text-green-700">Decision Engine: DEC-007 — Review Shipping Performance</p>
              <p className="text-green-600">Confidence: 82%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{h:"/en/dashboard",l:"← Executive"},{h:"/en/dashboard/marketing",l:"Marketing"},{h:"/en/dashboard/inventory",l:"Inventory"}].map(l=>(
          <Link key={l.h} href={l.h} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">{l.l}</Link>
        ))}
      </div>
    </div>
  );
}
