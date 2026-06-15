"use client";
/**
 * Order Lookup — preview page.
 * Repository: 016_DASHBOARD_PAGES.md — PAGE 010 (Order Lookup)
 *             007_FINANCIAL_ENGINE.md — Order financial display
 * Pre-preview fix: mock data enabled, no real API required.
 * ER-002: displays pre-computed values only.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Mock order data ────────────────────────────────────────────────────────
const MOCK_ORDER = {
  id: "ORD-00123",
  providerOrderId: "EO-001",
  orderDate: "2024-01-10T09:00:00Z",
  orderStatus: "DELIVERED",
  shipmentStatus: "DELIVERED",
  paymentMethod: "COD",
  paymentStatus: "PAID",
  marketingSource: "META",
  campaignId: "META-CAMP-001",
  items: [
    { id: "ITEM-A", sku: "TS-BLK-M", productName: "Classic T-Shirt (Black, M)", qty: 2, unitPrice: 299, discount: 0, fifoCost: 200, profitContribution: 233, isCampaignProduct: true },
    { id: "ITEM-B", sku: "CP-KHK-L", productName: "Cargo Pants (Khaki, L)",   qty: 1, unitPrice: 599, discount: 50, fifoCost: 300, profitContribution: 249, isCampaignProduct: false },
  ],
  financial: {
    productRevenue: 1147,
    customerShippingFee: 50,
    totalRevenue: 1197,
    cogs: 500,
    grossProfit: 697,
    shippingSubsidy: -5,
    actualShippingCost: 45,
    advertisingCost: 120,
    variableExpenses: 20,
    fixedExpenses: 30,
    netProfit: 412,
    profitMargin: 0.344,
    formulaRefs: ["FIN-001","FIN-002","FIN-003","FIN-004","INV-001","SHIP-001"],
  },
  inventory: {
    layers: [
      { layerId: "LAYER-001", purchaseDate: "2023-12-01", purchaseQty: 100, remainingQty: 63, unitCost: 100 },
      { layerId: "LAYER-002", purchaseDate: "2023-12-15", purchaseQty: 50,  remainingQty: 50, unitCost: 102 },
    ],
    fifoConsumption: [
      { layerId: "LAYER-001", sku: "TS-BLK-M", qtyConsumed: 2, unitCost: 100, totalCost: 200 },
    ],
  },
  marketing: {
    platform: "META",
    campaignName: "Summer Collection 2024",
    campaignId: "META-CAMP-001",
    advertisingCost: 120,
    trueCpa: 100,
    roi: 9.74,
    campaignProductSku: "TS-BLK-M",
    note: "Advertising cost allocated exclusively to campaign product (FIN-004, BR-FIN-004-01)",
  },
  shipping: {
    provider: "BOSTA",
    shipmentId: "BST-001",
    zone: "Cairo",
    deliveryDate: "2024-01-12T15:00:00Z",
    actualShippingCost: 45,
    customerShippingFee: 50,
    shippingSubsidy: -5,
    status: "DELIVERED",
    codAmount: 1197,
    note: "Shipping Subsidy = Actual Cost − Customer Fee = 45 − 50 = -5 (FR-002: customer pays more than actual cost)",
  },
  settlement: {
    settlementId: "SETTLE-001",
    settlementDate: "2024-01-20",
    expectedAmount: 1242,
    actualAmount: 1197,
    charges: { shipping: 45, returns: 0, additional: 0 },
    netTransfer: 1152,
    status: "RECEIVED",
  },
  adjustments: [],
};

type TabId = "financial" | "inventory" | "marketing" | "shipping" | "settlement" | "adjustments" | "formula";

const TABS: { id: TabId; label: string }[] = [
  { id: "financial",   label: "Financial" },
  { id: "inventory",   label: "Inventory / FIFO" },
  { id: "marketing",   label: "Marketing Attribution" },
  { id: "shipping",    label: "Shipping" },
  { id: "settlement",  label: "Settlement" },
  { id: "adjustments", label: "Adjustments" },
  { id: "formula",     label: "Formula Inspector" },
];

function Row({ label, value, sub, formulaId, positive }: { label: string; value: string; sub?: string; formulaId?: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <div className="text-right">
        <span className={cn("text-sm font-semibold tabular-nums", positive === false ? "text-red-600" : positive === true ? "text-green-600" : "text-gray-900")}>{value}</span>
        {formulaId && <p className="text-xs text-indigo-500 font-mono">{formulaId}</p>}
      </div>
    </div>
  );
}

function Badge({ text, color = "gray" }: { text: string; color?: string }) {
  const c = { green: "bg-green-100 text-green-800", blue: "bg-blue-100 text-blue-800", amber: "bg-amber-100 text-amber-800", gray: "bg-gray-100 text-gray-700", indigo: "bg-indigo-100 text-indigo-800" }[color] ?? "bg-gray-100 text-gray-700";
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", c)}>{text}</span>;
}

export default function OrderLookupPage() {
  const [orderId, setOrderId] = useState("EO-001");
  const [loaded, setLoaded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("financial");
  const [inspectorId, setInspectorId] = useState<string | null>(null);

  const order = MOCK_ORDER;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Search bar */}
      <div className="mb-6 flex gap-3">
        <input value={orderId} onChange={e => setOrderId(e.target.value)}
          className="flex-1 max-w-sm rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
          placeholder="Order ID, Shipment ID, or SKU..." />
        <button onClick={() => setLoaded(true)}
          className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">
          Search
        </button>
        <span className="self-center text-xs text-gray-400 italic">Mock data · No real API required</span>
      </div>

      {loaded && (
        <div className="space-y-4">
          {/* Order header */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{order.id}</h2>
                <p className="text-xs text-gray-400 font-mono">Provider: {order.providerOrderId} · {new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge text={order.orderStatus} color="green" />
                <Badge text={order.shipmentStatus} color="green" />
                <Badge text={order.paymentMethod} color="blue" />
                <Badge text={order.marketingSource} color="indigo" />
              </div>
            </div>

            {/* Items summary */}
            <div className="mt-3 divide-y divide-gray-50">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{item.productName}</span>
                    <span className="ml-2 text-xs text-gray-400 font-mono">{item.sku}</span>
                    {item.isCampaignProduct && <Badge text="Campaign Product" color="indigo" />}
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="text-gray-700">{item.qty} × EGP {item.unitPrice}</p>
                    {item.discount > 0 && <p className="text-xs text-red-500">−EGP {item.discount} discount</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-200">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50"
                      : "border-transparent text-gray-500 hover:text-gray-700")}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* FINANCIAL TAB */}
              {activeTab === "financial" && (
                <div className="space-y-4">
                  <p className="text-xs text-indigo-600 italic">All values from Financial Engine. Revenue recognized at DELIVERED (BR-005).</p>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Revenue (FIN-001)</p>
                    <Row label="Product Revenue" value={`EGP ${order.financial.productRevenue.toLocaleString()}`} formulaId="FIN-001" positive />
                    <Row label="Customer Shipping Fee" value={`EGP ${order.financial.customerShippingFee}`} sub="Independent from actual cost (BR-008)" positive />
                    <Row label="Total Revenue" value={`EGP ${order.financial.totalRevenue.toLocaleString()}`} positive />
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Profitability</p>
                    <Row label="COGS (FIFO)" value={`EGP ${order.financial.cogs}`} formulaId="INV-001" />
                    <Row label="Gross Profit" value={`EGP ${order.financial.grossProfit}`} formulaId="FIN-003" positive />
                    <Row label="Actual Shipping Cost" value={`EGP ${order.financial.actualShippingCost}`} sub="Source of Truth: Bosta (005)" />
                    <Row label="Shipping Subsidy" value={`EGP ${order.financial.shippingSubsidy}`} formulaId="SHIP-001" positive={order.financial.shippingSubsidy < 0} />
                    <Row label="Advertising Cost" value={`EGP ${order.financial.advertisingCost}`} sub="Allocated to campaign product only (FIN-004)" />
                    <Row label="Variable Expenses" value={`EGP ${order.financial.variableExpenses}`} />
                    <Row label="Fixed Expenses" value={`EGP ${order.financial.fixedExpenses}`} sub="Period-apportioned by Analytics layer" />
                    <Row label="Net Profit" value={`EGP ${order.financial.netProfit}`} formulaId="FIN-002" positive />
                    <Row label="Profit Margin" value={`${(order.financial.profitMargin * 100).toFixed(1)}%`} positive />
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Profit Contribution per Item (FIN-004)</p>
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
                        <div>
                          <span>{item.productName}</span>
                          {item.isCampaignProduct
                            ? <span className="ml-1 text-xs text-indigo-600">(bears Ads + Shipping)</span>
                            : <span className="ml-1 text-xs text-gray-400">(Ads=0, Ship=0 — FIN-004)</span>}
                        </div>
                        <span className={cn("font-semibold tabular-nums", item.profitContribution >= 0 ? "text-green-700" : "text-red-600")}>
                          EGP {item.profitContribution}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INVENTORY / FIFO TAB */}
              {activeTab === "inventory" && (
                <div className="space-y-4">
                  <p className="text-xs text-indigo-600 italic">FIFO consumption trace. Source: Inventory Engine (008_INVENTORY_FIFO_ENGINE).</p>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Active FIFO Layers</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="text-gray-400 uppercase">
                          <th className="text-left py-1">Layer ID</th><th className="text-left py-1">Purchase Date</th>
                          <th className="text-right py-1">Purchased</th><th className="text-right py-1">Remaining</th>
                          <th className="text-right py-1">Unit Cost</th>
                        </tr></thead>
                        <tbody>{order.inventory.layers.map(l => (
                          <tr key={l.layerId} className="border-t border-gray-50">
                            <td className="py-1.5 font-mono text-indigo-600">{l.layerId}</td>
                            <td className="py-1.5">{l.purchaseDate}</td>
                            <td className="py-1.5 text-right tabular-nums">{l.purchaseQty}</td>
                            <td className="py-1.5 text-right tabular-nums">{l.remainingQty}</td>
                            <td className="py-1.5 text-right tabular-nums">EGP {l.unitCost}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">FIFO Consumption for this Order (INV-001)</p>
                    {order.inventory.fifoConsumption.map((c, i) => (
                      <div key={i} className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
                        <div>
                          <span className="font-mono text-indigo-600">{c.layerId}</span>
                          <span className="ml-2 text-gray-600">{c.sku} × {c.qtyConsumed}</span>
                        </div>
                        <span className="font-semibold tabular-nums">EGP {c.totalCost}</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 mt-2">Total FIFO Cost: EGP {order.financial.cogs} · Unit cost from layer, not recalculated here (ER-002)</p>
                  </div>
                </div>
              )}

              {/* MARKETING ATTRIBUTION TAB */}
              {activeTab === "marketing" && (
                <div className="space-y-4">
                  <p className="text-xs text-indigo-600 italic">Marketing attribution per FIN-004. Source: Marketing Engine + Financial Engine.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Platform",        value: order.marketing.platform },
                      { label: "Campaign",         value: order.marketing.campaignName },
                      { label: "Campaign ID",      value: order.marketing.campaignId },
                      { label: "True CPA",         value: `EGP ${order.marketing.trueCpa}` },
                      { label: "Advertising Cost", value: `EGP ${order.marketing.advertisingCost}` },
                      { label: "Marketing ROI",    value: `${order.marketing.roi}×` },
                    ].map(f => (
                      <div key={f.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">{f.label}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{f.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-700">
                    <p className="font-semibold mb-1">FIN-004 Attribution Rule</p>
                    <p>Campaign Product: <span className="font-mono">{order.marketing.campaignProductSku}</span></p>
                    <p className="mt-1">{order.marketing.note}</p>
                  </div>
                </div>
              )}

              {/* SHIPPING TAB */}
              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <p className="text-xs text-indigo-600 italic">Shipping data from Bosta (SoT: 005_SOURCE_OF_TRUTH_MATRIX). Read-only display.</p>
                  <div className="rounded-lg border border-gray-100 p-3 space-y-1">
                    <Row label="Provider" value={order.shipping.provider} />
                    <Row label="Shipment ID" value={order.shipping.shipmentId} />
                    <Row label="Zone" value={order.shipping.zone} />
                    <Row label="Delivery Date" value={new Date(order.shipping.deliveryDate).toLocaleDateString()} />
                    <Row label="Status" value={order.shipping.status} positive />
                    <Row label="Actual Shipping Cost" value={`EGP ${order.shipping.actualShippingCost}`} sub="Source of Truth: Bosta" />
                    <Row label="Customer Shipping Fee" value={`EGP ${order.shipping.customerShippingFee}`} sub="Agreed fee at order creation" />
                    <Row label="Shipping Subsidy" value={`EGP ${order.shipping.shippingSubsidy}`} formulaId="SHIP-001" positive={order.shipping.shippingSubsidy > 0} />
                    <Row label="COD Amount" value={`EGP ${order.shipping.codAmount}`} />
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    <p>{order.shipping.note}</p>
                  </div>
                </div>
              )}

              {/* SETTLEMENT TAB */}
              {activeTab === "settlement" && (
                <div className="space-y-4">
                  <p className="text-xs text-indigo-600 italic">Settlement data from Bosta. FR-004: cash separate from profit.</p>
                  <div className="rounded-lg border border-gray-100 p-3 space-y-1">
                    <Row label="Settlement ID" value={order.settlement.settlementId} />
                    <Row label="Settlement Date" value={order.settlement.settlementDate} />
                    <Row label="Status" value={order.settlement.status} positive />
                    <Row label="Expected Amount" value={`EGP ${order.settlement.expectedAmount.toLocaleString()}`} />
                    <Row label="Actual Amount" value={`EGP ${order.settlement.actualAmount.toLocaleString()}`} positive />
                    <Row label="Shipping Charges" value={`EGP ${order.settlement.charges.shipping}`} positive={false} />
                    <Row label="Net Transfer" value={`EGP ${order.settlement.netTransfer.toLocaleString()}`} positive />
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                    <p className="font-semibold">Cash vs Profit reminder (FR-004)</p>
                    <p className="mt-1">Settlement amount is cash received — not the same as Net Profit (EGP {order.financial.netProfit}).</p>
                  </div>
                </div>
              )}

              {/* ADJUSTMENTS TAB */}
              {activeTab === "adjustments" && (
                <div className="space-y-3">
                  <p className="text-xs text-indigo-600 italic">Financial Adjustments for this order. "Every adjustment requires Reason, User, Timestamp." (007)</p>
                  {order.adjustments.length === 0
                    ? <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">No adjustments for this order.</div>
                    : order.adjustments.map((a: any) => <div key={a.id} className="rounded-lg border p-3 text-sm">{a.reason}</div>)
                  }
                </div>
              )}

              {/* FORMULA INSPECTOR TAB */}
              {activeTab === "formula" && (
                <div className="space-y-3">
                  <p className="text-xs text-indigo-600 italic">All formulas used to produce values in this order. Click any to inspect.</p>
                  {order.financial.formulaRefs.map(fid => (
                    <div key={fid} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      onClick={() => setInspectorId(fid)}>
                      <div>
                        <p className="text-sm font-mono font-semibold text-indigo-700">{fid}</p>
                        <p className="text-xs text-gray-500">{{
                          "FIN-001":"Revenue = Product Revenue + Customer Shipping Fee",
                          "FIN-002":"Net Profit = Revenue − COGS − Shipping − Marketing − Variable − Fixed ± Adjustments",
                          "FIN-003":"Gross Profit = Revenue − COGS",
                          "FIN-004":"Profit Contribution (Campaign: −Ads −Shipping; Non-campaign: 0 allocation)",
                          "INV-001":"FIFO Cost = Σ (Qty × Unit Cost per Layer)",
                          "SHIP-001":"Shipping Subsidy = Actual Cost − Customer Fee",
                        }[fid] ?? "See 033_FORMULA_CATALOG.md"}</p>
                      </div>
                      <span className="text-indigo-400 text-sm">ƒ →</span>
                    </div>
                  ))}
                  {inspectorId && (
                    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-mono font-semibold text-indigo-800">{inspectorId}</p>
                        <button onClick={() => setInspectorId(null)} className="text-indigo-400 hover:text-indigo-700">×</button>
                      </div>
                      <p className="text-xs text-indigo-700">Source: 033_FORMULA_CATALOG.md v2.1.0 · Version 1.0.0</p>
                      <p className="text-sm text-indigo-900 mt-2 font-medium">Full Formula Inspector available at: <span className="font-mono">/dashboard/formula-inspector</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
