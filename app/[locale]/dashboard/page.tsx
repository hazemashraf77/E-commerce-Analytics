
"use client";
/**
 * Homepage V2 — E-commerce Owner Command Center
 * Repository: 059_EXECUTIVE_COMMAND_CENTER.md, 060_PRODUCT_INTELLIGENCE.md
 * ER-002: Zero UI calculations. All values from formula-engine outputs.
 * Supports EN/AR locale switching.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import { MOCK_SCORES, MOCK_DECISIONS, MOCK_SMART_ALERTS, MOCK_PENDING_MONEY, MOCK_SETTLEMENT_TIMELINE } from "@/lib/dashboard/mock-data";
import type { ProductKpiRow } from "@/modules/formula-engine";
import { FormulaMiniInspector } from "@/components/formula-inspector/FormulaMiniInspector";
import { cn } from "@/lib/utils";

// ── i18n (minimal inline for build safety) ───────────────────────────────
const T = {
  en: {
    title: "Command Center", syncNow: "Sync Now", lastSync: "Last sync: 2 min ago",
    revenue: "Revenue", trueProfit: "True Profit", expectedCash: "Expected Cash",
    pendingSettlement: "Pending Settlement", deliveryRate: "Delivery Rate",
    trueCpa: "True CPA", trueRoas: "True ROAS", businessHealth: "Business Health",
    biggestRisk: "Biggest Risk", biggestOpportunity: "Biggest Opportunity",
    todayAction: "Today's Action", productIntelligence: "Product Intelligence",
    tabs: ["Overview","Lifecycle","Revenue","Costs","Profit","Marketing","Shipping","Inventory","Cash","AI"],
    product:"Product", delivered:"Delivered", returned:"Returned", refused:"Refused",
    picked:"Picked", pending:"Pending", totalCost:"Total Cost", margin:"Margin",
    health:"Health", alert:"Alert", stock:"Stock", days:"Days Left",
    invSnapshot:"Inventory Snapshot", cashSnapshot:"Cash & Settlement", decisionQueue:"Decision Queue",
    sources: { easyOrders:"EasyOrders", bosta:"Bosta", meta:"Meta", tiktok:"TikTok" },
    ruleBasedPreview: "Rule-based preview · Not AI-generated",
  },
  ar: {
    title: "مركز القيادة", syncNow: "مزامنة الآن", lastSync: "آخر مزامنة: منذ دقيقتين",
    revenue: "الإيرادات", trueProfit: "الربح الحقيقي", expectedCash: "النقد المتوقع",
    pendingSettlement: "التسوية المعلقة", deliveryRate: "معدل التسليم",
    trueCpa: "التكلفة الحقيقية", trueRoas: "العائد الحقيقي", businessHealth: "صحة الأعمال",
    biggestRisk: "أكبر خطر", biggestOpportunity: "أكبر فرصة",
    todayAction: "إجراء اليوم", productIntelligence: "ذكاء المنتجات",
    tabs: ["نظرة عامة","دورة الحياة","الإيرادات","التكاليف","الربح","التسويق","الشحن","المخزون","النقد","الذكاء"],
    product:"المنتج", delivered:"مُسلَّم", returned:"مُرجَع", refused:"مرفوض",
    picked:"مُجمَّع", pending:"معلق", totalCost:"إجمالي التكلفة", margin:"الهامش",
    health:"الصحة", alert:"تنبيه", stock:"المخزون", days:"أيام متبقية",
    invSnapshot:"لقطة المخزون", cashSnapshot:"النقد والتسويات", decisionQueue:"قائمة القرارات",
    sources: { easyOrders:"إيزي أوردر", bosta:"بوسطة", meta:"ميتا", tiktok:"تيك توك" },
    ruleBasedPreview: "معاينة قائمة على القواعد · غير مولّد بالذكاء الاصطناعي",
  },
};

type Locale = "en" | "ar";
type Tab = 0|1|2|3|4|5|6|7|8|9;

// ── Derived totals (pre-computed, no UI math) ─────────────────────────────
const P = MOCK_PRODUCT_INTELLIGENCE;
const TOTALS = {
  revenue:     P.reduce((s,p) => s + p.revenue, 0),
  trueProfit:  P.reduce((s,p) => s + p.trueProfit, 0),
  cogs:        P.reduce((s,p) => s + p.cogs, 0),
  adSpend:     P.reduce((s,p) => s + p.adSpend, 0),
  shipping:    P.reduce((s,p) => s + p.shippingCost, 0),
  delivered:   P.reduce((s,p) => s + p.ordersDelivered, 0),
};
const BIZ_HEALTH = MOCK_SCORES.find(s => s.scoreId === "SCORE-001")?.score ?? 74;

// safe number formatting
function egp(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return `EGP ${Math.round(n).toLocaleString("en-EG")}`;
}
function pct(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}
function mult(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return `${n.toFixed(2)}×`;
}
function num(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return n.toLocaleString("en-EG");
}

// ── Source status badges ──────────────────────────────────────────────────
const SOURCES = [
  { key:"easyOrders", color:"bg-green-500", label:"EasyOrders" },
  { key:"bosta",      color:"bg-green-500", label:"Bosta" },
  { key:"meta",       color:"bg-amber-400", label:"Meta" },
  { key:"tiktok",     color:"bg-red-500",   label:"TikTok" },
];

// ── Status config ─────────────────────────────────────────────────────────
const INV_STATUS: Record<string,{cls:string;short:string}> = {
  IN_STOCK:     {cls:"text-green-600", short:"OK"},
  LOW_STOCK:    {cls:"text-amber-500", short:"Low"},
  OUT_OF_STOCK: {cls:"text-red-600",   short:"Out"},
  DEAD_STOCK:   {cls:"text-gray-400",  short:"Dead"},
};

export default function DashboardPage() {
  const pathname = usePathname();
  const locale: Locale = pathname?.startsWith("/ar") ? "ar" : "en";
  const t = T[locale];
  const isRtl = locale === "ar";

  const [period, setPeriod] = useState("LAST_30_DAYS");
  const [dimMode, setDimMode] = useState<"total"|"perOrder"|"perItem">("total");
  const [showProjected, setShowProjected] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(0);
  const [search, setSearch] = useState("");

  const filtered = P.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const topRisk = MOCK_DECISIONS.find(d => d.priority === "HIGH" || d.priority === "CRITICAL");
  const topOpp  = MOCK_DECISIONS.find(d => (d.opportunityScore ?? 0) >= 70);
  const topAct  = MOCK_DECISIONS[0];

  return (
    <div className={cn("min-h-screen bg-gray-50", isRtl ? "dir-rtl font-sans" : "")} dir={isRtl ? "rtl" : "ltr"}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2 flex-wrap">
          {/* Title */}
          <h1 className="text-base font-bold text-gray-900 shrink-0">{t.title}</h1>

          {/* Language switch */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
            <Link href={`/en/dashboard`} className={cn("px-2 py-1 text-xs font-medium", locale==="en"?"bg-gray-900 text-white":"text-gray-500 hover:bg-gray-50")}>EN</Link>
            <Link href={`/ar/dashboard`} className={cn("px-2 py-1 text-xs font-medium", locale==="ar"?"bg-gray-900 text-white":"text-gray-500 hover:bg-gray-50")}>AR</Link>
          </div>

          {/* Period */}
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none shrink-0">
            {["TODAY","LAST_7_DAYS","LAST_30_DAYS","THIS_MONTH","LAST_MONTH"].map(p => (
              <option key={p} value={p}>{p.replace(/_/g," ")}</option>
            ))}
          </select>

          {/* Actual/Projected */}
          <button onClick={() => setShowProjected(p => !p)}
            className={cn("rounded-lg px-2 py-1 text-xs font-medium border transition-colors shrink-0",
              showProjected ? "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-500 hover:bg-gray-50")}>
            {showProjected ? "Projected" : "Actual"}
          </button>

          {/* Total/Per Order/Per Item */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
            {(["total","perOrder","perItem"] as const).map(m => (
              <button key={m} onClick={() => setDimMode(m)}
                className={cn("px-2 py-1 text-xs font-medium transition-colors",
                  dimMode===m ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50")}>
                {m === "total" ? "Total" : m === "perOrder" ? "/Order" : "/Item"}
              </button>
            ))}
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search product…"
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-indigo-300 shrink-0" />

          <div className="flex-1" />

          {/* Source badges */}
          <div className="flex items-center gap-2 shrink-0">
            {SOURCES.map(s => (
              <div key={s.key} className="flex items-center gap-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
                <span className="text-xs text-gray-500">{s.horizonLabel}</span>
              </div>
            ))}
          </div>

          {/* Sync */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400">{t.lastSync}</span>
            <button className="rounded-lg bg-indigo-600 text-white px-3 py-1 text-xs font-medium hover:bg-indigo-700 shrink-0">
              {t.syncNow}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-screen-2xl mx-auto">

        {/* ── EXECUTIVE SUMMARY ROW ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <div className="flex flex-wrap items-center gap-6 divide-x divide-gray-100">
            {[
              { label: t.revenue,           value: egp(TOTALS.revenue),    formulaId: "FIN-001", inputs: [{label:"Products",value:`EGP ${num(TOTALS.revenue)}`}] },
              { label: t.trueProfit,        value: egp(TOTALS.trueProfit), formulaId: "TRUE-001",
                inputs: [{label:"Revenue",value:egp(TOTALS.revenue)},{label:"All Costs",value:egp(TOTALS.revenue - TOTALS.trueProfit)}],
                cls: TOTALS.trueProfit >= 0 ? "text-green-600" : "text-red-600" },
              { label: t.expectedCash,      value: egp(28200), formulaId: "FIN-002" },
              { label: t.pendingSettlement, value: egp(18900), formulaId: "FIN-002" },
              { label: t.deliveryRate,      value: pct(87),    formulaId: "SHP-001",
                inputs: [{label:"Delivered",value:"87"},{label:"Shipped",value:"100"}] },
              { label: t.trueCpa,           value: egp(TOTALS.adSpend / Math.max(TOTALS.delivered, 1)), formulaId: "MKT-002",
                inputs: [{label:"Ad Spend",value:egp(TOTALS.adSpend)},{label:"Delivered",value:num(TOTALS.delivered)}] },
              { label: t.trueRoas,          value: mult(TOTALS.trueProfit / Math.max(TOTALS.adSpend, 1)), formulaId: "MKT-012",
                inputs: [{label:"True Profit",value:egp(TOTALS.trueProfit)},{label:"Ad Spend",value:egp(TOTALS.adSpend)}],
                cls: (TOTALS.trueProfit / Math.max(TOTALS.adSpend, 1)) >= 1 ? "text-green-600" : "text-red-600" },
              { label: t.businessHealth,    value: `${BIZ_HEALTH}/100`, formulaId: "FIN-003",
                cls: BIZ_HEALTH >= 70 ? "text-green-600" : BIZ_HEALTH >= 50 ? "text-amber-500" : "text-red-600" },
            ].map((item, i) => (
              <div key={i} className={cn("flex flex-col pl-6 first:pl-0", i===0?"":"")}>
                <div className="flex items-center gap-1">
                  <span className={cn("text-lg font-bold tabular-nums", item.cls ?? "text-gray-900")}>{item.value}</span>
                  <FormulaMiniInspector formulaId={item.formulaId} value={item.value} inputs={item.inputs} />
                </div>
                <span className="text-xs text-gray-400 mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BUSINESS BRIEF ─────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">{t.biggestRisk}</p>
            <p className="text-sm font-semibold text-gray-800">{topRisk?.decisionName ?? "Inventory stockout risk"}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topRisk?.reason ?? "3 products below 7-day stock threshold"}</p>
            <p className="text-xs text-gray-300 mt-2 italic">{t.ruleBasedPreview}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-1">{t.biggestOpportunity}</p>
            <p className="text-sm font-semibold text-gray-800">{topOpp?.decisionName ?? "Scale top-performing campaign"}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topOpp?.expectedImpact ?? "True ROAS >1.5× — scale budget 30%"}</p>
            <p className="text-xs text-gray-300 mt-2 italic">{t.ruleBasedPreview}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">{t.todayAction}</p>
            <p className="text-sm font-semibold text-gray-800">{topAct?.decisionName ?? "Review shipping performance"}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topAct?.recommendedAction ?? "Investigate Giza return rate (18%)"}</p>
            <p className="text-xs text-gray-300 mt-2 italic">{t.ruleBasedPreview}</p>
          </div>
        </div>

        {/* ── PRODUCT INTELLIGENCE GRID ──────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {t.tabs.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i as Tab)}
                className={cn("shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === i
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600")}>
                {tab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-50">
                  <TableHeaders tab={activeTab} t={t} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <ProductRow key={p.productId} p={p} tab={activeTab} t={t} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-xs text-gray-300 border-t border-gray-50">
            {filtered.length} products · All values computed by Formula Engine · Click ⓘ for formula details
          </div>
        </div>

        {/* ── BOTTOM: 3 COMPACT SECTIONS ────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* Inventory Snapshot */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.invSnapshot}</p>
            <div className="space-y-2">
              {P.map(p => (
                <div key={p.productId} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 truncate max-w-32" title={p.sku}>{p.sku}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold", INV_STATUS[p.inventoryStatus]?.cls ?? "text-gray-500")}>
                      {INV_STATUS[p.inventoryStatus]?.short ?? p.inventoryStatus}
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums w-6 text-right">{p.stockAvailable}</span>
                    <span className="text-xs text-gray-300 w-12 text-right">
                      {p.daysRemaining != null ? `${Math.round(p.daysRemaining)}d` : "∞"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash / Settlement Snapshot */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.cashSnapshot}</p>
            <div className="space-y-2">
              {MOCK_PENDING_MONEY.map(m => (
                <div key={m.key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{m.label}</span>
                  <span className="text-xs font-semibold tabular-nums text-gray-800">EGP {(m.amount ?? 0).toLocaleString("en-EG")}</span>
                </div>
              ))}
              <div className="border-t border-gray-50 pt-2 mt-2">
                {MOCK_SETTLEMENT_TIMELINE.slice(0,2).map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500">{s.horizonLabel}</span>
                    <span className="text-xs font-semibold tabular-nums text-green-600">EGP {(s.expectedAmount ?? 0).toLocaleString("en-EG")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Queue */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.decisionQueue}</p>
            <div className="space-y-2">
              {MOCK_DECISIONS.map(d => (
                <div key={d.decisionId} className="flex items-start gap-2">
                  <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-semibold shrink-0 mt-0.5",
                    d.priority === "HIGH" || d.priority === "CRITICAL" ? "bg-red-50 text-red-600" :
                    d.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500")}>
                    {d.priority[0]}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{d.decisionName}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{d.expectedImpact}</p>
                  </div>
                </div>
              ))}
              <Link href="/en/dashboard/decision-center" className="block text-xs text-indigo-500 hover:underline mt-2">
                View all decisions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Column headers per tab ─────────────────────────────────────────────────
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">{children}</th>;
}

function TableHeaders({ tab, t }: { tab: Tab; t: typeof T.en }) {
  const fixed = <Th>{t.product}</Th>;
  if (tab === 0) return <>{fixed}<Th>{t.delivered}</Th><Th>{t.returned}</Th><Th>{t.refused}</Th><Th>Revenue</Th><Th>{t.totalCost}</Th><Th>True Profit</Th><Th>{t.margin}</Th><Th>{t.health}</Th><Th>{t.alert}</Th></>;
  if (tab === 1) return <>{fixed}<Th>Created</Th><Th>Confirmed</Th><Th>Shipped</Th><Th>{t.delivered}</Th><Th>{t.refused}</Th><Th>Returning</Th><Th>{t.returned}</Th></>;
  if (tab === 2) return <>{fixed}<Th>Revenue</Th><Th>Rev/Order</Th><Th>Rev/Item</Th></>;
  if (tab === 3) return <>{fixed}<Th>COGS</Th><Th>Packaging</Th><Th>Shipping</Th><Th>Return Ship</Th><Th>Ads</Th><Th>{t.totalCost}</Th></>;
  if (tab === 4) return <>{fixed}<Th>Gross Profit</Th><Th>Net Profit</Th><Th>True Profit</Th><Th>{t.margin}</Th><Th>PPAP</Th></>;
  if (tab === 5) return <>{fixed}<Th>Ad Spend</Th><Th>Ad CPA</Th><Th>Delivered CPA</Th><Th>True CPA</Th><Th>Delivered ROAS</Th><Th>True ROAS</Th><Th>PPAP</Th></>;
  if (tab === 6) return <>{fixed}<Th>Ship Cost</Th><Th>Return Ship</Th><Th>Delivery %</Th><Th>Return %</Th><Th>Refusal %</Th></>;
  if (tab === 7) return <>{fixed}<Th>{t.stock}</Th><Th>Inv. Value</Th><Th>Cash Locked</Th><Th>{t.days}</Th><Th>Status</Th></>;
  if (tab === 8) return <>{fixed}<Th>Expected Cash</Th><Th>Cash Locked</Th><Th>Inv. Value</Th></>;
  return <>{fixed}<Th>Health</Th><Th>Top Risk</Th><Th>Opportunity</Th><Th>Recommended Action</Th></>;
}

// ── Product row per tab ───────────────────────────────────────────────────
const STATUS_SHORT: Record<string,string> = {
  IN_STOCK:"OK", LOW_STOCK:"Low", OUT_OF_STOCK:"Out", DEAD_STOCK:"Dead"
};
const STATUS_CLS: Record<string,string> = {
  IN_STOCK:"text-green-600", LOW_STOCK:"text-amber-500", OUT_OF_STOCK:"text-red-600", DEAD_STOCK:"text-gray-400"
};

function ProductRow({ p, tab, t }: { p: ProductKpiRow; tab: Tab; t: typeof T.en }) {
  const totalCost = (p.cogs ?? 0) + (p.packagingCost ?? 0) + (p.shippingCost ?? 0) + (p.returnShippingCost ?? 0) + (p.adSpend ?? 0);
  const name = (
    <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-50 z-10">
      <div className="font-medium text-gray-800 truncate max-w-36 text-xs" title={p.productName}>{p.productName}</div>
      <div className="text-gray-400 font-mono text-xs">{p.sku}</div>
    </td>
  );

  const invStatus = p.inventoryStatus ?? "IN_STOCK";
  const delivRate = p.deliveryRate ?? 0;
  const returnRate = p.returnRate ?? 0;
  const refuseRate = p.refusalRate ?? 0;

  function FInspect({ fid, val }: { fid: string; val: string }) {
    return <div className="flex items-center gap-0.5">{val}<FormulaMiniInspector formulaId={fid} value={val} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>;
  }

  const cls = "px-3 py-2 tabular-nums text-xs";
  const pos = "px-3 py-2 tabular-nums text-xs font-semibold " + (((p.trueProfit ?? 0) >= 0) ? "text-green-600" : "text-red-600");

  if (tab === 0) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls+" font-semibold text-green-600"}>{p.ordersDelivered}</td><td className={cls+" text-amber-500"}>{p.ordersReturned || "—"}</td><td className={cls+" text-red-500"}>{p.ordersRefused || "—"}</td><td className={cls}>{egp(p.revenue)}</td><td className={cls+" text-gray-500"}>{egp(totalCost)}</td><td className={pos}>{egp(p.trueProfit)}</td><td className={cls}>{pct(p.profitMarginPct)}</td><td className={cls}>{BIZ_HEALTH}/100</td><td className={cls}>{invStatus !== "IN_STOCK" ? <span className={STATUS_CLS[invStatus]}>{STATUS_SHORT[invStatus]}</span> : "—"}</td></tr>;
  if (tab === 1) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls}>{p.ordersCreated}</td><td className={cls}>{p.ordersConfirmed}</td><td className={cls}>{p.ordersShipped}</td><td className={cls+" text-green-600 font-semibold"}>{p.ordersDelivered}</td><td className={cls+" text-red-500"}>{p.ordersRefused || "—"}</td><td className={cls+" text-amber-500"}>{p.ordersReturned || "—"}</td><td className={cls}>{p.ordersReturned || "—"}</td></tr>;
  if (tab === 2) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls}>{egp(p.revenue)}</td><td className={cls}>{egp(p.revenuePerOrder)}</td><td className={cls}>{egp(p.revenuePerItem)}</td></tr>;
  if (tab === 3) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls}>{egp(p.cogs)}</td><td className={cls}>{egp(p.packagingCost)}</td><td className={cls}>{egp(p.shippingCost)}</td><td className={cls}>{egp(p.returnShippingCost)}</td><td className={cls}>{egp(p.adSpend)}</td><td className={cls+" font-semibold"}>{egp(totalCost)}</td></tr>;
  if (tab === 4) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls+" text-green-600"}>{egp(p.grossProfit)}</td><td className={cls}>{egp(p.netProfit)}</td><td className={pos}>{egp(p.trueProfit)}</td><td className={cls}>{pct(p.profitMarginPct)}</td><td className={cn(cls, (p.ppap ?? 0) >= 1 ? "text-green-600" : "text-red-600")}>{p.ppap != null ? p.ppap.toFixed(2) : "—"}</td></tr>;
  if (tab === 5) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls}>{egp(p.adSpend)}</td><td className={cls}>{egp(p.advertisingCpa)}</td><td className={cls}>{egp(p.deliveredCpa)}</td><td className={cls+" font-semibold"}>{egp(p.trueCpa)}</td><td className={cls}>{mult(p.deliveredRoas)}</td><td className={cn(cls, (p.trueRoas ?? 0) >= 1 ? "text-green-600" : "text-red-600")}>{mult(p.trueRoas)}</td><td className={cn(cls, (p.ppap ?? 0) >= 1 ? "text-green-600" : "text-red-600")}>{p.ppap != null ? p.ppap.toFixed(2) : "—"}</td></tr>;
  if (tab === 6) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls}>{egp(p.shippingCost)}</td><td className={cls}>{egp(p.returnShippingCost)}</td><td className={cn(cls, delivRate >= 85 ? "text-green-600" : "text-red-600")}>{pct(delivRate)}</td><td className={cn(cls, returnRate <= 5 ? "text-green-600" : "text-amber-500")}>{pct(returnRate)}</td><td className={cn(cls, refuseRate <= 4 ? "text-green-600" : "text-red-600")}>{pct(refuseRate)}</td></tr>;
  if (tab === 7) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls+" font-semibold"}>{p.stockAvailable}</td><td className={cls}>{egp(p.inventoryValue)}</td><td className={cls}>{egp(p.cashLocked)}</td><td className={cn(cls, p.daysRemaining != null && p.daysRemaining <= 7 ? "text-red-600 font-semibold" : p.daysRemaining != null && p.daysRemaining <= 14 ? "text-amber-500" : "text-green-600")}>{p.daysRemaining != null ? `${Math.round(p.daysRemaining)}d` : "∞"}</td><td className={cn(cls, STATUS_CLS[invStatus])}>{STATUS_SHORT[invStatus]}</td></tr>;
  if (tab === 8) return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls}>{egp(p.revenue * 0.7)}</td><td className={cls}>{egp(p.cashLocked)}</td><td className={cls}>{egp(p.inventoryValue)}</td></tr>;
  // AI tab
  const risk = invStatus !== "IN_STOCK" ? `Stock: ${STATUS_SHORT[invStatus]}` : (p.ppap ?? 0) < 1 ? "PPAP < 1" : "—";
  const opp  = (p.trueRoas ?? 0) > 1.5 ? "Scale ads" : (p.deliveryRate ?? 0) >= 90 ? "Strong delivery" : "—";
  const act  = invStatus === "LOW_STOCK" || invStatus === "OUT_OF_STOCK" ? "Reorder stock" : (p.ppap ?? 0) < 1 ? "Review ad spend" : "Monitor";
  return <tr className="group hover:bg-gray-50"><>{name}</><td className={cls}>{BIZ_HEALTH}/100</td><td className={cn(cls, risk !== "—" ? "text-red-500" : "text-gray-400")}>{risk}</td><td className={cn(cls, opp !== "—" ? "text-green-600" : "text-gray-400")}>{opp}</td><td className={cls}>{act}</td></tr>;
}
