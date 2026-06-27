"use client";
/**
 * Dashboard sidebar navigation.
 * Links every page required for the pre-preview business review.
 * Groups match 016_DASHBOARD_PAGES.md page hierarchy.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  labelAr?: string;
  icon: string;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: "Overview",
    items: [{ href: "/en/dashboard", label: "Executive", icon: "📊", badge: "Home" }],
  },
  {
    group: "Finance & Revenue",
    items: [{ href: "/en/dashboard/finance", label: "Finance", icon: "💰" }],
  },
  {
    group: "Marketing",
    items: [{ href: "/en/dashboard/marketing", label: "Marketing", icon: "📣" }],
  },
  {
    group: "Operations",
    items: [
      { href: "/en/dashboard/shipping", label: "Shipping", icon: "🚚" },
      { href: "/en/dashboard/inventory", label: "Inventory", icon: "📦" },
      { href: "/en/dashboard/orders", label: "Orders Analytics", icon: "🛒" },
      { href: "/en/dashboard/order-lookup", label: "Order Lookup", icon: "🔍" },
      { href: "/en/dashboard/products", label: "Products", icon: "🏷️" },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { href: "/en/dashboard/decision-center", label: "Decision Center", icon: "🎯" },
      { href: "/en/dashboard/formula-inspector", label: "Formula Inspector", icon: "ƒ" },
      { href: "/en/dashboard/formula-settings", label: "Formula Settings", icon: "⚙" },
      { href: "/en/dashboard/ai-copilot", label: "AI Copilot", icon: "🤖" },
    ],
  },
  {
    group: "Reports",
    items: [{ href: "/en/dashboard/reports", label: "Reports", icon: "📄" }],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/en/dashboard"
      ? pathname === "/en/dashboard" || pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/* Logo / title */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100">
        {!collapsed && (
          <div>
            <p className="text-xs font-bold text-indigo-700 leading-none">Analytics</p>
            <p className="text-xs text-gray-400">Platform</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 ml-auto"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-2 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="rounded bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">v1.0.0-preview</p>
          <p className="text-xs text-gray-300">Mock data only</p>
        </div>
      )}
    </aside>
  );
}
