"use client";

import { useEffect, useMemo, useState } from "react";
import type { Terms, DimMode } from "./locale";
import type { ProductKpiRow } from "@/modules/formula-engine";
import { cn } from "@/lib/utils";

interface GridProps {
  t: Terms;
  locale: "en" | "ar";
  dimMode: DimMode;
  products: ProductKpiRow[];
  search: string;
  activeView?: "executive" | "finance" | "marketing" | "inventory" | "shipping" | "orders" | "all";
  loading?: boolean;
  emptyLabel?: string;
}

type ProductRow = ProductKpiRow & Record<string, number | string | null | undefined>;

type ColumnGroupKey =
  | "easy"
  | "bosta"
  | "finance"
  | "marketing"
  | "inventory"
  | "decision";

const GROUP_LABELS: Record<ColumnGroupKey, string> = {
  easy: "EasyOrders",
  bosta: "Bosta",
  finance: "الماليات",
  marketing: "التسويق",
  inventory: "المخزون",
  decision: "القرار",
};

const GROUP_STYLES: Record<ColumnGroupKey, string> = {
  easy: "bg-blue-50 text-blue-700 border-blue-100",
  bosta: "bg-amber-50 text-amber-700 border-amber-100",
  finance: "bg-green-50 text-green-700 border-green-100",
  marketing: "bg-purple-50 text-purple-700 border-purple-100",
  inventory: "bg-orange-50 text-orange-700 border-orange-100",
  decision: "bg-red-50 text-red-700 border-red-100",
};

const GROUP_COL_SPAN: Record<ColumnGroupKey, number> = {
  easy: 10,
  bosta: 13,
  finance: 7,
  marketing: 3,
  inventory: 2,
  decision: 2,
};

const INV_SHORT: Record<string, string> = {
  IN_STOCK: "OK",
  LOW_STOCK: "Low",
  OUT_OF_STOCK: "Out",
  DEAD_STOCK: "Dead",
};

function asNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function egp(n: number | null | undefined): string {
  return n == null || !Number.isFinite(n) ? "—" : `EGP ${Math.round(n).toLocaleString("en-EG")}`;
}

function pct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const value = Math.abs(n) <= 1 ? n * 100 : n;
  return `${value.toFixed(1)}%`;
}

function mult(n: number | null | undefined): string {
  return n == null || !Number.isFinite(n) ? "—" : `${n.toFixed(2)}×`;
}

function countValue(value: unknown, className?: string) {
  const n = asNumber(value);
  return (
    <span className={cn("tabular-nums", className)}>
      {n > 0 ? n.toLocaleString("en-EG") : "—"}
    </span>
  );
}

function moneyCell(value: number | null | undefined, className?: string) {
  return <span className={cn("tabular-nums", className)}>{egp(value)}</span>;
}

function NameCell({ p }: { p: ProductRow }) {
  const initials = String(p.sku || p.productName || "P").slice(0, 2).toUpperCase();

  return (
    <td className="w-[280px] min-w-[280px] px-3 py-2 sticky left-0 bg-white border-r border-slate-300 z-20">
      <div className="flex items-center gap-2">
        {p.imageUrl ? (
          <img
            src={String(p.imageUrl)}
            alt={String(p.productName)}
            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xs text-gray-400 font-mono">
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate max-w-[190px] text-xs" title={String(p.productName)}>
            {p.productName}
          </div>
          <div className="text-gray-400 font-mono text-[11px] truncate">{p.sku}</div>
          {p.category ? (
            <div className="text-[10px] text-gray-300 truncate">{p.category}</div>
          ) : null}
        </div>
      </div>
    </td>
  );
}

function calcHealthScore(p: ProductRow): number {
  const deliveryRate = typeof p.deliveryRate === "number" ? p.deliveryRate : null;
  const returnRate = typeof p.returnRate === "number" ? p.returnRate : null;
  const trueProfit = Number(p.trueProfit ?? 0);
  const stockStatus = String(p.inventoryStatus ?? "IN_STOCK");

  if (trueProfit < 0) return 25;
  if (stockStatus === "OUT_OF_STOCK") return 35;
  if (stockStatus === "DEAD_STOCK") return 45;
  if (deliveryRate != null && asNumber(p.ordersShipped) > 0 && deliveryRate < 0.6) return 40;
  if (returnRate != null && returnRate > 0.15) return 45;
  if (stockStatus === "LOW_STOCK") return 60;
  if (trueProfit > 0 && (deliveryRate == null || deliveryRate >= 0.8)) return 80;
  return 70;
}

function alertForProduct(p: ProductRow): string {
  const invStatus = String(p.inventoryStatus ?? "IN_STOCK");
  if (invStatus !== "IN_STOCK") return INV_SHORT[invStatus] ?? invStatus;
  if (Number(p.trueProfit ?? 0) < 0) return "Loss";
  if (typeof p.trueCpa === "number" && p.trueCpa > 200) return "High CPA";
  if (typeof p.returnRate === "number" && p.returnRate > 0.15) return "Returns";
  return "";
}

export function ProductIntelligenceGrid({
  t,
  locale,
  dimMode,
  products,
  search,
  activeView,
  loading,
  emptyLabel,
}: GridProps) {
  const [visibleGroups, setVisibleGroups] = useState<Record<ColumnGroupKey, boolean>>({
    easy: true,
    bosta: true,
    finance: true,
    marketing: true,
    inventory: true,
    decision: true,
  });

  const [columnsOpen, setColumnsOpen] = useState(false);

  useEffect(() => {
    void activeView;
    void dimMode;
  }, [activeView, dimMode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const name = String(p.productName ?? "").toLowerCase();
      const sku = String(p.sku ?? "").toLowerCase();
      return !q || name.includes(q) || sku.includes(q);
    });
  }, [products, search]);

  const visibleColSpan =
    1 +
    (Object.entries(visibleGroups) as [ColumnGroupKey, boolean][])
      .filter(([, visible]) => visible)
      .reduce((sum, [group]) => sum + GROUP_COL_SPAN[group], 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-3 pt-3 pb-2 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-gray-800">جدول المنتجات الرئيسي</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{filtered.length} منتج</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">EasyOrders + Bosta + الماليات + التسويق + المخزون</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setColumnsOpen((v) => !v)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              الأعمدة ⚙
            </button>

            {columnsOpen && (
              <div className="absolute top-9 right-0 z-50 w-60 rounded-xl border border-slate-200 bg-white shadow-lg p-3 space-y-2">
                {(Object.entries(GROUP_LABELS) as [ColumnGroupKey, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between text-xs text-gray-600">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={visibleGroups[key]}
                      onChange={() => setVisibleGroups((v) => ({ ...v, [key]: !v[key] }))}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-0">
          <thead className="sticky top-0 z-30">
            <tr className="bg-white border-b border-slate-200">
              <th className="w-[280px] min-w-[280px] px-3 py-2 sticky left-0 bg-white z-40 text-xs font-bold text-gray-600 border-r border-slate-300">
                المنتج
              </th>

              {(Object.entries(GROUP_LABELS) as [ColumnGroupKey, string][]).map(([key, label]) =>
                visibleGroups[key] ? (
                  <th
                    key={key}
                    colSpan={GROUP_COL_SPAN[key]}
                    className={cn(
                      "px-2 py-2 text-center text-xs font-bold border-x",
                      GROUP_STYLES[key],
                    )}
                  >
                    {label}
                  </th>
                ) : null,
              )}
            </tr>

            <tr className="bg-gray-50 border-b border-slate-200">
              <th className="w-[280px] min-w-[280px] px-3 py-2 text-left text-xs font-semibold text-gray-500 sticky left-0 bg-gray-50 z-40 whitespace-nowrap border-r border-slate-300">
                {t.col.product}
              </th>

              {visibleGroups.easy && (
                <>
                  <th className="px-2 py-2 border-r border-l border-slate-300 bg-blue-50 text-gray-600">جديد</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">معلق</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">مؤكد</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">قيد التجهيز</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">جاهز للشحن</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">إلى بوسطة</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">تم التسليم</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">ملغي</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">Spam</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-blue-50 text-gray-600">يحتاج مراجعة</th>
                </>
              )}

              {visibleGroups.bosta && (
                <>
                  <th className="px-2 py-2 border-r border-l border-slate-300 bg-amber-50 text-gray-600">بوسطة جديد</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">تم الاستلام</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">في الطريق</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">خارج للتسليم</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">مُسلّم</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">مرفوض</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">مرتجع</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">استرجاع تم</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">استبدال</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">استبدال تم</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">ملغي</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">مشكلة</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-amber-50 text-gray-600">Lost</th>
                </>
              )}

              {visibleGroups.finance && (
                <>
                  <th className="px-2 py-2 border-r border-l border-slate-300 bg-green-50 text-gray-600">الإيراد</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-green-50 text-gray-600">تكلفة البضاعة</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-green-50 text-gray-600">شحن</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-green-50 text-gray-600">شحن مرتجع</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-green-50 text-gray-600">إجمالي التكلفة</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-green-50 text-gray-600">الربح الحقيقي</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-green-50 text-gray-600">الهامش</th>
                </>
              )}

              {visibleGroups.marketing && (
                <>
                  <th className="px-2 py-2 border-r border-l border-slate-300 bg-purple-50 text-gray-600">إعلانات</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-purple-50 text-gray-600">True CPA</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-purple-50 text-gray-600">True ROAS</th>
                </>
              )}

              {visibleGroups.inventory && (
                <>
                  <th className="px-2 py-2 border-r border-l border-slate-300 bg-orange-50 text-gray-600">المخزون</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-orange-50 text-gray-600">أيام متبقية</th>
                </>
              )}

              {visibleGroups.decision && (
                <>
                  <th className="px-2 py-2 border-r border-l border-slate-300 bg-red-50 text-gray-600">الصحة</th>
                  <th className="px-2 py-2 border-r border-slate-200 bg-red-50 text-gray-600">تنبيه</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && filtered.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-3 py-3 sticky left-0 bg-white border-r border-slate-300">
                    <div className="h-4 w-28 bg-gray-100 rounded animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
                  </td>
                  {Array.from({ length: Math.max(6, visibleColSpan - 1) }).map((_, j) => (
                    <td key={j} className="px-2 py-3">
                      <div className="h-4 w-16 bg-gray-50 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={visibleColSpan} className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-400 font-medium">
                    {emptyLabel ?? (locale === "ar" ? "لا توجد منتجات أو لم يتم مزامنة البيانات" : "No products found")}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {locale === "ar"
                      ? "قم بإنشاء منتجات يدوياً أو قم بمزامنة بيانات المتجر"
                      : "Create products manually or sync store data"}
                  </p>
                </td>
              </tr>
            )}

            {filtered.map((product) => {
              const p = product as ProductRow;
              const totalCost =
                asNumber(p.cogs) +
                asNumber(p.packagingCost) +
                asNumber(p.shippingCost) +
                asNumber(p.returnShippingCost) +
                asNumber(p.adSpend);

              const healthScore = calcHealthScore(p);
              const alert = alertForProduct(p);

              return (
                <tr key={String(p.productId)} className="hover:bg-gray-50/60 transition-colors">
                  <NameCell p={p} />

                  {visibleGroups.easy && (
                    <>
                      <td className="px-2 py-2 text-center border-r border-l border-slate-300">{countValue(p.ordersNew)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersPending)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersConfirmed)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersProcessing)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersReadyToShip)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersSentToBosta ?? p.ordersShippedStatus)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersDeliveredStatus, "text-green-600 font-semibold")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersCancelled, "text-red-500")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersSpam, "text-gray-400")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.ordersNeedsReview, "text-amber-600")}</td>
                    </>
                  )}

                  {visibleGroups.bosta && (
                    <>
                      <td className="px-2 py-2 text-center border-r border-l border-slate-300">{countValue(p.bostaNew)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaReceived)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaInTransit)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaOutForDelivery)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaDelivered, "text-green-600 font-semibold")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaRefused || p.ordersRefused, "text-red-500")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaReturned || p.ordersReturned, "text-amber-600")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaReturnCompleted, "text-amber-700")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaExchange, "text-blue-500")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaExchangeCompleted, "text-blue-700")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaCancelled, "text-gray-400")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaException, "text-amber-500")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{countValue(p.bostaLost, "text-red-600")}</td>
                    </>
                  )}

                  {visibleGroups.finance && (
                    <>
                      <td className="px-2 py-2 text-center border-r border-l border-slate-300">{moneyCell(p.revenue)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{moneyCell(p.cogs)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{moneyCell(p.shippingCost)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{moneyCell(p.returnShippingCost)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{moneyCell(totalCost)}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">
                        {moneyCell(p.trueProfit, Number(p.trueProfit ?? 0) >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold")}
                      </td>
                      <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">{pct(p.profitMarginPct)}</td>
                    </>
                  )}

                  {visibleGroups.marketing && (
                    <>
                      <td className="px-2 py-2 text-center border-r border-l border-slate-300">{Number(p.adSpend ?? 0) > 0 ? moneyCell(p.adSpend) : "—"}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{p.trueCpa != null ? moneyCell(p.trueCpa) : "—"}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">{p.trueRoas != null ? mult(p.trueRoas) : "—"}</td>
                    </>
                  )}

                  {visibleGroups.inventory && (
                    <>
                      <td className="px-2 py-2 text-center font-semibold border-r border-l border-slate-300">{asNumber(p.stockAvailable).toLocaleString("en-EG")}</td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">{p.daysRemaining != null ? `${Math.round(Number(p.daysRemaining))}d` : "∞"}</td>
                    </>
                  )}

                  {visibleGroups.decision && (
                    <>
                      <td
                        className={cn(
                          "px-2 py-2 text-center font-semibold border-r border-l border-slate-300",
                          healthScore >= 70 ? "text-green-600" : healthScore >= 50 ? "text-amber-500" : "text-red-600",
                        )}
                      >
                        {healthScore}
                      </td>
                      <td className="px-2 py-2 text-center border-r border-slate-200">
                        {alert ? <span className="text-red-500">{alert}</span> : "—"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-slate-100 text-xs text-gray-300">
        {filtered.length} {locale === "ar" ? "منتج" : "products"} · ⓘ {locale === "ar" ? "لعرض تفاصيل المعادلة" : "for formula details"}
      </div>
    </div>
  );
}
