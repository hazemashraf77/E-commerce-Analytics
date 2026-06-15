import type { ReactNode } from "react";

/**
 * Root layout. Locale handling lives in app/[locale]/layout.tsx.
 * The html/body shell is rendered there so dir/lang stay locale-aware.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
