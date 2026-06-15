import type { Config } from "tailwindcss";

/**
 * Tailwind 3.x is pinned because 048_PROJECT_BOOTSTRAP.md requires the
 * presence of tailwind.config.ts. Design tokens arrive from
 * 044_DESIGN_SYSTEM.md in the UI sprint — none are defined here.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
