import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./config/i18n/request.ts");

/**
 * Repository: 027_TECH_STACK.md, 048_PROJECT_BOOTSTRAP.md
 * No business logic in configuration (CP-012).
 *
 * PREVIEW MODE: ignoreBuildErrors and ignoreDuringBuilds are true so that
 * Vercel preview deployments succeed with mock data and placeholder env vars.
 * Production deployment must re-enable strict checks.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Preview: allow build to succeed with placeholder DB / missing prisma types
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Ensure server-only modules are not bundled for client
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default withNextIntl(nextConfig);
