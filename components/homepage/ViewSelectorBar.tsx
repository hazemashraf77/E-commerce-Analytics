"use client";
/**
 * ViewSelectorBar
 * Repository: 075_HOMEPAGE_CONTRACT.md — VIEW SELECTOR
 * "Views never change data. Views only change visible columns."
 *
 * Tabs: Executive | Finance | Marketing | Inventory | Shipping | Orders | All
 */

import { cn } from "@/lib/utils";
import type { HomepageView } from "@/hooks/useHomepageData";

interface ViewSelectorBarProps {
  activeView: HomepageView;
  onView:     (v: HomepageView) => void;
  locale:     "en" | "ar";
}

const VIEWS: Array<{ key: HomepageView; en: string; ar: string }> = [
  { key: "executive", en: "Executive",  ar: "تنفيذي"   },
  { key: "finance",   en: "Finance",    ar: "مالية"     },
  { key: "marketing", en: "Marketing",  ar: "تسويق"     },
  { key: "inventory", en: "Inventory",  ar: "مخزون"     },
  { key: "shipping",  en: "Shipping",   ar: "شحن"       },
  { key: "orders",    en: "Orders",     ar: "طلبات"     },
  { key: "all",       en: "All",        ar: "الكل"      },
];

export function ViewSelectorBar({ activeView, onView, locale }: ViewSelectorBarProps) {
  return (
    <div className="flex overflow-x-auto flex-nowrap border-b border-gray-100">
      {VIEWS.map(v => (
        <button
          key={v.key}
          onClick={() => onView(v.key)}
          className={cn(
            "shrink-0 px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
            activeView === v.key
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-600",
          )}
          aria-selected={activeView === v.key}
        >
          {locale === "ar" ? v.ar : v.en}
        </button>
      ))}
    </div>
  );
}
