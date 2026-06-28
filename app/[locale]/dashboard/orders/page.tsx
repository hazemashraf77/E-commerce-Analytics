"use client";

import { useEffect, useState } from "react";
import { useStoreId } from "@/hooks/useStoreId";

type OrderRow = {
  id: string;
  providerOrderId: string;
  orderDate: string;
  easyOrdersStatus: string;
  orderShipmentStatus: string | null;
  bostaStatus: string | null;
  trackingNumber: string | null;
  paymentStatus: string;
  revenue: number;
  itemsCount: number;
  products: { name: string; sku: string; quantity: number }[];
};

export default function OrdersDashboard() {
  const storeId = useStoreId();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    async function loadOrders() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/v1/orders?storeId=${storeId}&page=1&pageSize=100&sortBy=orderDate&sortDirection=desc`,
        );
        const json = await res.json();

        const rows = json.data?.items ?? json.data ?? json.items ?? [];

        setOrders(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [storeId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Orders Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">
          EasyOrders orders with Bosta shipment lifecycle status
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">EasyOrders Status</th>
                <th className="px-3 py-2 text-left">Bosta Status</th>
                <th className="px-3 py-2 text-left">Tracking</th>
                <th className="px-3 py-2 text-left">Products</th>
                <th className="px-3 py-2 text-right">Revenue</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}

              {!loading &&
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-gray-700">{order.providerOrderId}</td>
                    <td className="px-3 py-2 text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString("en-EG")}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 font-medium">
                        {order.easyOrdersStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-green-50 text-green-700 px-2 py-0.5 font-medium">
                        {order.bostaStatus ?? order.orderShipmentStatus ?? "NOT_SHIPPED"}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-500">
                      {order.trackingNumber ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {order.products?.length
                        ? order.products.map((p) => `${p.name} × ${p.quantity}`).join(", ")
                        : `${order.itemsCount} item(s)`}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                      EGP {Math.round(order.revenue ?? 0).toLocaleString("en-EG")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
