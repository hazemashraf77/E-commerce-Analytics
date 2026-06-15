"use client";
/**
 * CostEvolutionWidget — Sprint 7.1 + Sprint 8 UI Polish 1.
 * Shows cost at every lifecycle stage with dual-dimension breakdown
 * plus precomputed delta vs previous stage (Analytics Engine output).
 * ER-002: Zero calculation. All values from Analytics Engine outputs.
 */
import type { CostEvolutionStage, CostEvolutionStageDelta } from "@/lib/dashboard/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  data: CostEvolutionStage[];
  deltas?: CostEvolutionStageDelta[];
  viewMode: "orders" | "items";
}

const stageColors: Record<string, string> = {
  "Created":          "bg-gray-100  border-gray-300   text-gray-700",
  "Confirmed":        "bg-blue-50   border-blue-300   text-blue-800",
  "Sent to Shipping": "bg-indigo-50 border-indigo-300 text-indigo-800",
  "In Transit":       "bg-yellow-50 border-yellow-400 text-yellow-800",
  "Delivered":        "bg-green-50  border-green-400  text-green-800",
  "Final Realized":   "bg-green-100 border-green-600  text-green-900",
};

const deltaColors = { up: "text-red-600", down: "text-green-600", flat: "text-gray-400" };
const deltaArrow  = { up: "↑", down: "↓", flat: "—" };

export function CostEvolutionWidget({ data, deltas, viewMode }: Props) {
  const maxCost  = Math.max(...data.map(d => d.totalCost));
  const deltaMap = new Map((deltas ?? []).map(d => [d.stage, d]));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        <span>Stage</span>
        <span className="text-right">Orders</span>
        <span className="text-right">Items</span>
        <span className="text-right">/ Order</span>
        <span className="text-right">Δ prev</span>
        <span className="text-right">/ Item</span>
        <span className="text-right">Total</span>
      </div>

      {data.map((stage) => {
        const barPct  = maxCost > 0 ? (stage.totalCost / maxCost) * 100 : 0;
        const delta   = deltaMap.get(stage.stage);

        return (
          <div key={stage.stage}
            className={cn("rounded-lg border-2 p-3 transition-shadow hover:shadow-md cursor-pointer",
              stageColors[stage.stage] ?? "bg-white border-gray-200 text-gray-700")}>
            <div className="grid grid-cols-7 gap-2 items-center text-sm mb-2">
              <div>
                <span className="font-semibold text-xs">{stage.stage}</span><br/>
                <span className="text-xs opacity-60" dir="rtl">{stage.stageAr}</span>
                {!stage.isRealized && <span className="block text-xs italic opacity-50">projected</span>}
              </div>
              <span className="text-right tabular-nums text-xs">{stage.orders.toLocaleString()}</span>
              <span className="text-right tabular-nums text-xs">{stage.items.toLocaleString()}</span>
              <span className={cn("text-right tabular-nums text-xs font-medium", viewMode==="orders"?"underline decoration-dotted":"")}>
                EGP {stage.costPerOrder}
              </span>
              <span className={cn("text-right tabular-nums text-xs font-bold",
                delta ? deltaColors[delta.deltaPerOrderSign] : "text-gray-400")}>
                {delta && delta.deltaLabel !== "baseline"
                  ? `${deltaArrow[delta.deltaPerOrderSign]} ${delta.deltaLabel}` : "—"}
              </span>
              <span className={cn("text-right tabular-nums text-xs font-medium", viewMode==="items"?"underline decoration-dotted":"")}>
                EGP {stage.costPerItem}
              </span>
              <span className="text-right tabular-nums text-xs font-bold">EGP {stage.totalCost.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", stage.isRealized?"bg-green-600":"bg-blue-400")}
                style={{ width: `${barPct.toFixed(1)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
