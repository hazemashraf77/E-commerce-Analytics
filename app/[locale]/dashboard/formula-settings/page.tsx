
"use client";
/**
 * Formula Settings — /[locale]/dashboard/formula-settings
 * Repository: 068_FORMULA_ENGINE.md — Formula Configuration
 * Allows safe formula component inclusion/exclusion.
 * NO unsafe free-code execution. Checkbox-based configuration only.
 * Supports EN/AR based on locale.
 */
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FORMULA_REGISTRY, FINANCIAL_FORMULA_IDS, MARKETING_FORMULA_IDS, SHIPPING_FORMULA_IDS, INVENTORY_FORMULA_IDS } from "@/modules/formula-engine";
import type { FormulaDefinition } from "@/modules/formula-engine";
import { cn } from "@/lib/utils";

const T = {
  en: {
    title: "Formula Settings", subtitle: "Configure which cost components are included in each formula.",
    categories: "Categories", financial:"Financial", marketing:"Marketing",
    shipping:"Shipping", inventory:"Inventory", cash:"Cash", custom:"Custom",
    components:"Components", dependencies:"Dependencies", affectedKpis:"Affected KPIs",
    preview:"Live Preview", version:"Version", save:"Save", discard:"Discard",
    reset:"Reset to Default", test:"Test Formula", history:"View History",
    expression:"Expression", meaning:"Business Meaning",
    safeNote:"⚙ Safe configuration only — no custom code execution.",
    restored:"Reset to default values", saved:"Settings saved",
    locale:"Language", en:"English", ar:"العربية",
  },
  ar: {
    title: "إعدادات المعادلات", subtitle: "تكوين مكونات التكلفة المدرجة في كل معادلة.",
    categories: "الفئات", financial:"مالية", marketing:"تسويق",
    shipping:"شحن", inventory:"مخزون", cash:"نقد", custom:"مخصص",
    components:"المكونات", dependencies:"التبعيات", affectedKpis:"المؤشرات المتأثرة",
    preview:"معاينة مباشرة", version:"الإصدار", save:"حفظ", discard:"تجاهل",
    reset:"إعادة تعيين", test:"اختبار", history:"السجل",
    expression:"التعبير", meaning:"المعنى التجاري",
    safeNote:"⚙ تكوين آمن فقط — لا تنفيذ كود مخصص.",
    restored:"تم إعادة التعيين", saved:"تم الحفظ",
    locale:"اللغة", en:"English", ar:"العربية",
  },
};
type Locale = "en" | "ar";

// Configurable formulas with component toggles
const CONFIGURABLE: Array<{
  id: string; label: string; labelAr: string;
  components: Array<{ key: string; label: string; labelAr: string; defaultOn: boolean; required: boolean }>;
  mockValues: Record<string, number>;
}> = [
  {
    id: "TRUE-001", label: "True Profit", labelAr: "الربح الحقيقي",
    components: [
      {key:"revenue",      label:"Revenue",        labelAr:"الإيرادات",     defaultOn:true,  required:true},
      {key:"cogs",         label:"COGS",           labelAr:"تكلفة البضاعة", defaultOn:true,  required:true},
      {key:"packaging",    label:"Packaging",      labelAr:"تغليف",         defaultOn:true,  required:false},
      {key:"shipping",     label:"Shipping",       labelAr:"شحن",           defaultOn:true,  required:false},
      {key:"returnShip",   label:"Return Shipping",labelAr:"شحن مرتجع",    defaultOn:true,  required:false},
      {key:"ads",          label:"Ads",            labelAr:"إعلانات",       defaultOn:true,  required:false},
      {key:"refunds",      label:"Refunds",        labelAr:"استردادات",     defaultOn:true,  required:false},
      {key:"compensations",label:"Compensations",  labelAr:"تعويضات",       defaultOn:true,  required:false},
      {key:"varExp",       label:"Variable Exp.",  labelAr:"مصاريف متغيرة", defaultOn:true,  required:false},
      {key:"fixedExp",     label:"Fixed Exp.",     labelAr:"مصاريف ثابتة",  defaultOn:true,  required:false},
    ],
    mockValues: {revenue:120000,cogs:45000,packaging:3000,shipping:8500,returnShip:1200,ads:20000,refunds:800,compensations:400,varExp:2000,fixedExp:2500},
  },
  {
    id: "MKT-002", label: "True CPA", labelAr: "التكلفة الحقيقية للاكتساب",
    components: [
      {key:"ads",          label:"Ads Spend",      labelAr:"إنفاق إعلاني",  defaultOn:true,  required:true},
      {key:"deliveredOrds",label:"Delivered Orders",labelAr:"طلبات مُسلَّمة",defaultOn:true,  required:true},
    ],
    mockValues: {ads:22000, deliveredOrds:191},
  },
  {
    id: "MKT-012", label: "True ROAS", labelAr: "عائد الإنفاق الحقيقي",
    components: [
      {key:"trueProfit",   label:"True Profit",    labelAr:"الربح الحقيقي",  defaultOn:true, required:true},
      {key:"ads",          label:"Ads Spend",      labelAr:"إنفاق إعلاني",   defaultOn:true, required:true},
    ],
    mockValues: {trueProfit:36600, ads:22000},
  },
  {
    id: "MKT-013", label: "PPAP", labelAr: "الربح لكل جنيه إعلاني",
    components: [
      {key:"trueProfit",   label:"True Profit",    labelAr:"الربح الحقيقي",  defaultOn:true, required:true},
      {key:"ads",          label:"Ads Spend",      labelAr:"إنفاق إعلاني",   defaultOn:true, required:true},
    ],
    mockValues: {trueProfit:36600, ads:22000},
  },
  {
    id: "SHP-005", label: "True Shipping Cost", labelAr: "تكلفة الشحن الحقيقية",
    components: [
      {key:"outbound",     label:"Outbound Shipping",labelAr:"شحن صادر",    defaultOn:true,  required:true},
      {key:"returnShip",   label:"Return Shipping",  labelAr:"شحن مرتجع",   defaultOn:true,  required:false},
      {key:"exchangeShip", label:"Exchange Shipping",labelAr:"شحن استبدال", defaultOn:true,  required:false},
    ],
    mockValues: {outbound:8500, returnShip:1200, exchangeShip:600},
  },
  {
    id: "INV-002", label: "Inventory Value", labelAr: "قيمة المخزون",
    components: [
      {key:"remainingQty", label:"Remaining Quantity",labelAr:"الكمية المتبقية",defaultOn:true,required:true},
      {key:"unitCost",     label:"FIFO Unit Cost",    labelAr:"التكلفة الوحدوية",defaultOn:true,required:true},
    ],
    mockValues: {remainingQty:850, unitCost:112},
  },
];

// Compute preview from enabled components
function computePreview(formulaId: string, enabled: Record<string, boolean>, values: Record<string, number>): string {
  const v = values;
  const on = (k: string) => enabled[k] !== false;
  try {
    if (formulaId === "TRUE-001") {
      const result = (on("revenue")?v.revenue:0) - (on("cogs")?v.cogs:0) - (on("packaging")?v.packaging:0) - (on("shipping")?v.shipping:0) - (on("returnShip")?v.returnShip:0) - (on("ads")?v.ads:0) - (on("refunds")?v.refunds:0) - (on("compensations")?v.compensations:0) - (on("varExp")?v.varExp:0) - (on("fixedExp")?v.fixedExp:0);
      return `EGP ${result.toLocaleString("en-EG")}`;
    }
    if (formulaId === "MKT-002") return `EGP ${(v.ads / Math.max(v.deliveredOrds, 1)).toFixed(2)}`;
    if (formulaId === "MKT-012" || formulaId === "MKT-013") return `${(v.trueProfit / Math.max(v.ads, 1)).toFixed(2)}×`;
    if (formulaId === "SHP-005") {
      const r = (on("outbound")?v.outbound:0) + (on("returnShip")?v.returnShip:0) + (on("exchangeShip")?v.exchangeShip:0);
      return `EGP ${r.toLocaleString("en-EG")}`;
    }
    if (formulaId === "INV-002") return `EGP ${(v.remainingQty * v.unitCost).toLocaleString("en-EG")}`;
  } catch { return "Error"; }
  return "—";
}

const CATEGORIES: Array<{key:string; label:string; ids:string[]}> = [
  {key:"financial", label:"Financial",  ids:["TRUE-001","MKT-013"]},
  {key:"marketing", label:"Marketing",  ids:["MKT-002","MKT-012","MKT-013"]},
  {key:"shipping",  label:"Shipping",   ids:["SHP-005"]},
  {key:"inventory", label:"Inventory",  ids:["INV-002"]},
];

export default function FormulaSettingsPage() {
  const pathname = usePathname();
  const locale: Locale = pathname?.startsWith("/ar") ? "ar" : "en";
  const t = T[locale];
  const isRtl = locale === "ar";

  const [selectedCat, setSelectedCat] = useState("financial");
  const [selectedFormula, setSelectedFormula] = useState(CONFIGURABLE[0]!);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string|null>(null);
  const [history] = useState([
    {version:"1.0.0", date:"2024-01-01", note:"Default"},
    {version:"1.1.0", date:"2024-02-15", note:"Excluded fixed expenses from True Profit"},
  ]);
  const [showHistory, setShowHistory] = useState(false);

  const formula = FORMULA_REGISTRY[selectedFormula.id];

  const catFormulas = CONFIGURABLE.filter(f => {
    const cat = CATEGORIES.find(c => c.key === selectedCat);
    return cat?.ids.includes(f.id) ?? true;
  });

  function isEnabled(key: string, def: boolean): boolean {
    return enabled[`${selectedFormula.id}:${key}`] ?? def;
  }
  function toggle(key: string, def: boolean) {
    setEnabled(prev => ({...prev, [`${selectedFormula.id}:${key}`]: !isEnabled(key, def)}));
  }

  const enabledMap = Object.fromEntries(
    selectedFormula.components.map(c => [c.key, isEnabled(c.key, c.defaultOn)])
  );
  const preview = computePreview(selectedFormula.id, enabledMap, selectedFormula.mockValues);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg">{toast}</div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{t.subtitle}</p>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">{t.safeNote}</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">

        {/* Left: Category sidebar */}
        <div className="w-44 shrink-0 bg-white border-r border-gray-100 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">{t.categories}</p>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => { setSelectedCat(cat.key); const first = CONFIGURABLE.find(f => cat.ids.includes(f.id)); if (first) setSelectedFormula(first); }}
              className={cn("w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                selectedCat === cat.key ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50")}>
              {(t as any)[cat.key] ?? cat.label}
            </button>
          ))}
        </div>

        {/* Middle: Formula list + builder */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Formula selector */}
          <div className="flex gap-2 flex-wrap">
            {catFormulas.map(f => (
              <button key={f.id} onClick={() => setSelectedFormula(f)}
                className={cn("rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                  selectedFormula.id === f.id ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
                <span className="font-mono mr-1 opacity-60">{f.id}</span>
                {locale === "ar" ? f.labelAr : f.label}
              </button>
            ))}
          </div>

          {/* Formula info */}
          {formula && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">{locale === "ar" ? selectedFormula.labelAr : selectedFormula.label}</h2>
                  <p className="text-xs font-mono text-indigo-500 mt-0.5">{selectedFormula.id} · v{formula.version}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1">{formula.domain}</span>
              </div>

              {/* Expression */}
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{t.expression}</p>
                <p className="text-xs font-mono text-indigo-700 leading-relaxed">{formula.expression}</p>
              </div>

              <p className="text-xs text-gray-500">{formula.businessMeaning}</p>

              {/* Components with toggles */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.components}</p>
                <div className="space-y-2">
                  {selectedFormula.components.map(comp => {
                    const on = isEnabled(comp.key, comp.defaultOn);
                    return (
                      <div key={comp.key} className={cn("flex items-center justify-between rounded-lg border p-3 transition-colors",
                        on ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50")}>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => !comp.required && toggle(comp.key, comp.defaultOn)}
                            disabled={comp.required}
                            className={cn("w-9 h-5 rounded-full transition-colors relative shrink-0",
                              on ? "bg-gray-900" : "bg-gray-200",
                              comp.required ? "opacity-60 cursor-not-allowed" : "cursor-pointer")}>
                            <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                              on ? "translate-x-4" : "translate-x-0.5")} />
                          </button>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{locale === "ar" ? comp.labelAr : comp.label}</p>
                            {comp.required && <p className="text-xs text-gray-400">Required</p>}
                          </div>
                        </div>
                        <span className="text-xs tabular-nums text-gray-500 font-mono">
                          {on ? `EGP ${(selectedFormula.mockValues[comp.key] ?? 0).toLocaleString("en-EG")}` : "excluded"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dependencies */}
              {formula.dependencies.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{t.dependencies}</p>
                  <div className="flex flex-wrap gap-1">
                    {formula.dependencies.map(d => (
                      <span key={d} className="rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-mono text-indigo-600">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Affected KPIs */}
              {formula.relatedKpis.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{t.affectedKpis}</p>
                  <div className="flex flex-wrap gap-1">
                    {formula.relatedKpis.map(k => (
                      <span key={k} className="rounded bg-gray-50 border border-gray-100 px-2 py-0.5 text-xs text-gray-500">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                <button onClick={() => showToast(t.saved)} className="rounded-lg bg-gray-900 text-white px-4 py-1.5 text-xs font-semibold hover:bg-gray-800">{t.save}</button>
                <button onClick={() => setEnabled({})} className="rounded-lg border border-gray-200 text-gray-600 px-4 py-1.5 text-xs hover:bg-gray-50">{t.discard}</button>
                <button onClick={() => { setEnabled({}); showToast(t.restored); }} className="rounded-lg border border-gray-200 text-gray-600 px-4 py-1.5 text-xs hover:bg-gray-50">{t.reset}</button>
                <button onClick={() => showToast(`Test result: ${preview}`)} className="rounded-lg border border-indigo-200 text-indigo-600 px-4 py-1.5 text-xs hover:bg-indigo-50">{t.test}</button>
                <button onClick={() => setShowHistory(h => !h)} className="rounded-lg border border-gray-200 text-gray-500 px-4 py-1.5 text-xs hover:bg-gray-50">{t.history}</button>
              </div>

              {/* Version history scaffold */}
              {showHistory && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Version History</p>
                  {history.map(h => (
                    <div key={h.version} className="flex items-center justify-between py-1 text-xs">
                      <span className="font-mono text-gray-500">v{h.version}</span>
                      <span className="text-gray-400">{h.date}</span>
                      <span className="text-gray-600">{h.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="w-60 shrink-0 bg-white border-l border-gray-100 p-4 space-y-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.preview}</p>

          {/* Result */}
          <div className="rounded-xl bg-gray-900 text-white p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{locale === "ar" ? selectedFormula.labelAr : selectedFormula.label}</p>
            <p className="text-2xl font-black tabular-nums">{preview}</p>
            <p className="text-xs font-mono text-gray-400 mt-1">{selectedFormula.id}</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-1">
            {selectedFormula.components.map(comp => {
              const on = isEnabled(comp.key, comp.defaultOn);
              const val = selectedFormula.mockValues[comp.key] ?? 0;
              return (
                <div key={comp.key} className={cn("flex justify-between text-xs py-1 border-b border-gray-50", !on && "opacity-40 line-through")}>
                  <span className="text-gray-600">{locale === "ar" ? comp.labelAr : comp.label}</span>
                  <span className="font-mono tabular-nums text-gray-700">EGP {val.toLocaleString("en-EG")}</span>
                </div>
              );
            })}
          </div>

          {/* Formula ID info */}
          {formula && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs">
              <p className="font-mono text-indigo-500 mb-1">{selectedFormula.id} · v{formula.version}</p>
              <p className="text-gray-500">{formula.outputUnit}</p>
              <p className="text-gray-400 mt-1">{formula.owner}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
