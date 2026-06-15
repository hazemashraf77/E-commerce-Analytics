import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

/**
 * Dashboard layout.
 * Wraps all /dashboard/* pages with persistent sidebar navigation.
 * Navigation links every page required for the preview review.
 * ER-002: layout contains zero business logic.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
