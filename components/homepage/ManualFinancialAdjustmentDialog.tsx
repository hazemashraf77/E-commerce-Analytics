"use client";
/**
 * Manual Financial Adjustment Dialog
 * Orders are NOT created manually — only adjustments to existing order IDs.
 * Empty optional fields default to 0.
 */
import { useState } from "react";
import type { Terms } from "./locale";
import { cn } from "@/lib/utils";

type AdjType = "refund" | "exchange" | "discount" | "compensation" | "expense" | "settlement" | "accounting";

interface Props {
  t: Terms;
  locale: "en" | "ar";
  isOpen: boolean;
  onClose: () => void;
}

interface AdjState {
  type: AdjType;
  orderId: string;
  product: string;
  oldProduct: string;
  newProduct: string;
  amount: string;
  diffAmount: string;
  payMethod: string;
  direction: string;
  reason: string;
  notes: string;
  category: string;
  status: string;
}

const EMPTY: AdjState = {
  type: "refund", orderId: "", product: "", oldProduct: "", newProduct: "",
  amount: "", diffAmount: "", payMethod: "", direction: "",
  reason: "", notes: "", category: "", status: "PENDING",
};

function computeImpact(s: AdjState) {
  const amt = parseFloat(s.amount) || 0;
  const diff = parseFloat(s.diffAmount) || 0;
  switch (s.type) {
    case "refund":       return { rev: 0, cash: -amt, profit: -amt, balance: `+EGP ${amt.toLocaleString("en-EG")} to customer` };
    case "exchange":     return { rev: 0, cash: diff > 0 ? diff : 0, profit: diff, balance: diff > 0 ? `Customer pays EGP ${diff}` : diff < 0 ? `We pay EGP ${Math.abs(diff)}` : "No change" };
    case "discount":     return { rev: -amt, cash: -amt, profit: -amt, balance: "N/A" };
    case "compensation": return { rev: 0, cash: -amt, profit: -amt, balance: `+EGP ${amt.toLocaleString("en-EG")} to customer` };
    case "expense":      return { rev: 0, cash: -amt, profit: -amt, balance: "N/A" };
    case "settlement":   return { rev: 0, cash: s.direction.includes("Customer paid") ? amt : -amt, profit: 0, balance: s.direction };
    case "accounting":   return { rev: 0, cash: s.direction.includes("cash") ? (s.direction.includes("Increase") ? amt : -amt) : 0, profit: s.direction.includes("profit") ? (s.direction.includes("Increase") ? amt : -amt) : 0, balance: "N/A" };
    default:             return { rev: 0, cash: 0, profit: 0, balance: "N/A" };
  }
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";
const selectCls = inputCls;

export function ManualFinancialAdjustmentDialog({ t, locale, isOpen, onClose }: Props) {
  const [state, setState] = useState<AdjState>(EMPTY);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const isAr = locale === "ar";
  const set = (k: keyof AdjState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setState(s => ({ ...s, [k]: e.target.value }));

  const impact = computeImpact(state);

  function handleSave() {
    // Preview only — no real API call in scaffold
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); setState(EMPTY); }, 1500);
  }

  const adjTypeList = Object.entries(t.adjTypes) as [AdjType, string][];
  const payMethodList = Object.entries(t.payMethods) as [string, string][];
  const directionMap = t.directions;

  function DirectionsFor({ type }: { type: AdjType }) {
    const dirs =
      type === "refund" || type === "compensation" ? [["wePaidCustomer", directionMap.wePaidCustomer]] :
      type === "exchange" ? [["customerPaidUs", directionMap.customerPaidUs], ["wePaidCustomer", directionMap.wePaidCustomer]] :
      type === "settlement" ? [["customerOwes", directionMap.customerOwes], ["weOwe", directionMap.weOwe], ["customerPaidUs", directionMap.customerPaidUs], ["wePaidCustomer", directionMap.wePaidCustomer]] :
      type === "accounting" ? [["increaseProfit", directionMap.increaseProfit], ["decreaseProfit", directionMap.decreaseProfit], ["increaseCash", directionMap.increaseCash], ["decreaseCash", directionMap.decreaseCash]] :
      null;
    if (!dirs) return null;
    return (
      <Field label={t.direction}>
        <select value={state.direction} onChange={set("direction")} className={selectCls}>
          <option value="">—</option>
          {dirs.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" dir={isAr ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{t.adjTitle}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {saved ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-2">✓</p>
              <p className="text-sm font-semibold text-green-700">
                {isAr ? "تم الحفظ بنجاح" : "Saved successfully"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-5 py-4 grid md:grid-cols-2 gap-4">
              {/* Left: form */}
              <div className="space-y-3">
                {/* Type selector */}
                <Field label={isAr ? "نوع العملية" : "Adjustment Type"} required>
                  <div className="flex flex-wrap gap-1.5">
                    {adjTypeList.map(([k, v]) => (
                      <button key={k} onClick={() => setState(s => ({ ...s, type: k, direction: "" }))}
                        className={cn("rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors",
                          state.type === k ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
                        {v}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Order ID */}
                {state.type !== "expense" && state.type !== "accounting" && (
                  <Field label={t.orderId} required>
                    <input value={state.orderId} onChange={set("orderId")} placeholder="ORD-00123" className={inputCls} />
                  </Field>
                )}

                {/* Exchange: old/new product */}
                {state.type === "exchange" && (
                  <>
                    <Field label={t.oldProduct}><input value={state.oldProduct} onChange={set("oldProduct")} className={inputCls} /></Field>
                    <Field label={t.newProduct}><input value={state.newProduct} onChange={set("newProduct")} className={inputCls} /></Field>
                    <Field label={t.diffAmount}><input type="number" value={state.diffAmount} onChange={set("diffAmount")} placeholder="0" className={inputCls} /></Field>
                  </>
                )}

                {/* Amount */}
                {state.type !== "exchange" && (
                  <Field label={t.amount} required>
                    <input type="number" value={state.amount} onChange={set("amount")} placeholder="0" min="0" className={inputCls} />
                  </Field>
                )}

                {/* Payment method */}
                {["refund","exchange","compensation","settlement"].includes(state.type) && (
                  <Field label={t.payMethod}>
                    <select value={state.payMethod} onChange={set("payMethod")} className={selectCls}>
                      <option value="">—</option>
                      {payMethodList.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </Field>
                )}

                {/* Direction */}
                <DirectionsFor type={state.type} />

                {/* Category (expense) */}
                {state.type === "expense" && (
                  <Field label={t.category}>
                    <input value={state.category} onChange={set("category")} className={inputCls} />
                  </Field>
                )}

                {/* Status (settlement) */}
                {state.type === "settlement" && (
                  <Field label={t.status}>
                    <select value={state.status} onChange={set("status")} className={selectCls}>
                      <option value="PENDING">{t.pendingStatus}</option>
                      <option value="SETTLED">{t.settled}</option>
                    </select>
                  </Field>
                )}

                {/* Optional fields */}
                <Field label={t.reason}>
                  <input value={state.reason} onChange={set("reason")} className={inputCls} />
                </Field>
                <Field label={t.notes}>
                  <textarea value={state.notes} onChange={set("notes")} rows={2} className={inputCls} />
                </Field>
              </div>

              {/* Right: impact preview */}
              <div className="space-y-3">
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t.impactPreview}</p>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: t.revImpact,       value: impact.rev,    prefix: "EGP " },
                      { label: t.cashImpactLbl,    value: impact.cash,   prefix: "EGP " },
                      { label: t.profitImpactLbl,  value: impact.profit, prefix: "EGP " },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-gray-500">{row.label}</span>
                        <span className={cn("font-semibold tabular-nums",
                          row.value > 0 ? "text-green-600" : row.value < 0 ? "text-red-600" : "text-gray-400")}>
                          {row.value !== 0 ? `${row.value > 0 ? "+" : ""}${row.prefix}${Math.abs(row.value).toLocaleString("en-EG")}` : "—"}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-500">{t.balanceImpact}</span>
                      <span className="text-xs text-gray-600 font-medium">{impact.balance}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                  {isAr
                    ? "التسويات المالية اليدوية للإجراءات التصحيحية فقط. الطلبات تأتي من الواجهات البرمجية فقط."
                    : "Manual adjustments are for corrective financial actions only. Orders come from APIs only."}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
              <button onClick={onClose} className="rounded-lg border border-gray-200 text-gray-600 px-4 py-2 text-sm hover:bg-gray-50">{t.cancel}</button>
              <button onClick={handleSave} className="rounded-lg bg-gray-900 text-white px-5 py-2 text-sm font-semibold hover:bg-gray-700">{t.save}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
