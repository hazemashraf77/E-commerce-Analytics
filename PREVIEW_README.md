# E-Commerce Analytics Platform — Preview

## Vercel Deployment (One-Click)

1. Upload the project to a GitHub/GitLab repository
2. Connect to Vercel → **Import Project**
3. Set Framework Preset: **Next.js**
4. Set Build Command: `pnpm build` (reads from package.json automatically)
5. Set Install Command: `pnpm install`
6. Add Environment Variables (copy from `.env.example`):

| Variable | Preview Value |
|---|---|
| `NEXT_PUBLIC_APP_NAME` | `E-Commerce Analytics (Preview)` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://placeholder.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `preview-placeholder-anon-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | `preview-placeholder-service-role-key` |
| `DATABASE_URL` | `postgresql://placeholder:placeholder@localhost:5432/preview` |
| `DIRECT_URL` | `postgresql://placeholder:placeholder@localhost:5432/preview` |
| `JWT_SECRET` | `preview-jwt-secret-minimum-32-chars!!` |
| `APP_SECRET` | `preview-app-secret-minimum-32-chars!!` |

7. Deploy → opens at `/en/dashboard` (Executive Dashboard)

> **Preview Mode Auto-Detection**: When `NEXT_PUBLIC_SUPABASE_URL` contains "placeholder",
> the middleware automatically injects an ADMINISTRATOR session and API routes return
> computed mock data. No real database or Supabase project required.

---

## Local Development

```bash
# Requires Node.js 20+ and pnpm
npm install -g pnpm
pnpm install          # also runs: prisma generate (postinstall)
pnpm dev              # starts on http://localhost:3000
```

No configuration needed — `.env.local` has all required placeholder values.

---

## Pages to Review

| Page | URL | Description |
|---|---|---|
| Executive Dashboard | `/en/dashboard` | Home — all KPIs, scores, decisions, lifecycle |
| Finance | `/en/dashboard/finance` | P&L, cost waterfall, profit leakage |
| Marketing | `/en/dashboard/marketing` | CPA evolution, ROAS, campaign scores |
| Shipping | `/en/dashboard/shipping` | 13 Bosta lifecycle buckets, rates |
| Inventory | `/en/dashboard/inventory` | FIFO health, capacity widget |
| Orders Analytics | `/en/dashboard/orders` | Order funnel, lifecycle |
| **Order Lookup** | `/en/dashboard/order-lookup` | 7 tabs: Financial, FIFO, Marketing, Shipping, Settlement, Adjustments, Formula Inspector |
| Products | `/en/dashboard/products` | Product profitability |
| Reports | `/en/dashboard/reports` | Generate CSV (fully works) or scaffold PDF/Excel |
| **Decision Center** | `/en/dashboard/decision-center` | Decision Engine outputs with Accept/Reject |
| **Formula Inspector** | `/en/dashboard/formula-inspector` | Navigate FIN-xxx, KPI-xxx, SCORE-xxx, DEC-xxx |
| **AI Copilot** | `/en/dashboard/ai-copilot` | Template-based scaffold; clearly labeled |

## Key Features

- **Orders/Items toggle** — sidebar ViewMode toggle changes all lifecycle counts
- **Score cards** — SCORE-001–009 with sparklines, computed from mock KPI values
- **Decision cards** — Accept/Reject (BR-DEC-002: no auto-execution)
- **Formula Inspector** — navigable; click any `ƒ` button on any card
- **Cost Evolution** — Δ vs previous lifecycle stage (pre-computed)
- **CSV Reports** — click Generate → download starts immediately

## Known Preview Limitations

| Limitation | Production Fix |
|---|---|
| Auth bypassed (ADMINISTRATOR injected) | Connect real Supabase project |
| DB writes fail silently | Connect real PostgreSQL |
| PDF/Excel reports = scaffold | `pnpm add puppeteer exceljs` |
| AI = template-based | Add LLM API key to env |
| Score/Decision data = mock KPI inputs | Sync real orders via EasyOrders adapter |
