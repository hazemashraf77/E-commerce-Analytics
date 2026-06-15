# 052_PROJECT_MEMORY.md
# Repository Version: 3.0 Ultimate (Governance Decision, 2026-06-12)

---

## COMPLETED SPRINTS

### Sprint 0 — Bootstrap
Status: COMPLETE (pending user verification checklist)
Completed: 2026-06-12

Files created:
- package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.js
- eslint.config.js, .prettierrc, .gitignore, .env.example, components.json
- app/layout.tsx, app/[locale]/layout.tsx, app/[locale]/page.tsx
- app/[locale]/loading.tsx, app/[locale]/not-found.tsx, app/globals.css
- app/api/v1/health/route.ts
- middleware.ts
- config/i18n/routing.ts, config/i18n/request.ts, config/i18n/navigation.ts
- messages/en.json, messages/ar.json
- lib/env.ts, lib/logger.ts, lib/utils.ts
- lib/supabase/client.ts, lib/supabase/server.ts
- lib/auth/session.ts, lib/auth/rbac.ts
- utils/date.ts, utils/currency.ts, utils/number.ts, utils/errors.ts, utils/validation.ts
- types/index.ts
- prisma/schema.prisma, prisma/migrations/migration_lock.toml
- prisma/migrations/00000000000000_init/migration.sql (empty baseline)
- modules/* (9 modules, 026-compliant internal structure, placeholders)
- adapters/* (5 adapter scaffolds: eazy-order, bosta, meta, tiktok, mock)
- tests/bootstrap/health.test.ts
- scripts/verify-bootstrap.sh, scripts/check-env.ts
- README.md
- All 63 repository docs copied to docs/repository/

Stack initialized: Next.js 15, TypeScript 5.8 (strict), Tailwind 3, Supabase SSR,
Prisma 6, TanStack Query 5, Zod 3, Pino 9, next-intl 4, Vitest 3.

Deviations logged:
- D-1: @supabase/ssr used instead of @supabase/auth-helpers-nextjs (deprecated).
  Requires documentation update in 048_PROJECT_BOOTSTRAP.md.
- D-2: lib/utils.ts added for shadcn/ui; requires clsx + tailwind-merge (pnpm install).

Documentation cleanup tasks registered (P-003 findings):
- F-02: Update/deprecate 023_REPOSITORY_INDEX.md (stale, ends at doc 023)
- F-04: Update 050 titles to match actual filenames
- F-05: Update version fields in old docs to 3.0 Ultimate
- F-06: Document Sprint-to-Phase mapping before Sprint 1
- F-07: Reconcile REPOSITORY_MANIFEST, CERTIFICATE, README inventory counts
- F-08: Add explicit definition-vs-value ownership statement for KPI/Formula

---

## CURRENT PHASE

**Sprint 1 — Database Foundation**
Pending: User must confirm Sprint 0 acceptance checklist passes.

---

## KNOWN ISSUES / BLOCKING CONDITIONS

- F-01 (HIGH): Formula Catalog and KPI Catalog require business owner to populate
  concrete expressions using 033's template before Financial/Analytics engine sprints.
  Gate is armed. Do NOT begin formula implementation without populated catalogs.
- F-03 (HIGH): Shipping Subsidy sign convention (positive/zero vs negative)
  requires a business ruling before the Financial Engine sprint.
- D-1/D-2 above require pnpm add clsx tailwind-merge after pnpm install.

---

## NEXT TASK

Sprint 1 — Database Foundation
Primary documents: 004_CANONICAL_DATA_MODEL, 006_DATABASE_SPECIFICATION,
025_DATABASE_MIGRATIONS, 005_SOURCE_OF_TRUTH_MATRIX.
Gate: Sprint 0 acceptance checklist confirmed PASS by user.

---

## SPRINT 1 — Database Foundation
Status: COMPLETE (pending `pnpm db:generate` validation on user machine)
Completed: 2026-06-12

Files created:
- prisma/schema.prisma (complete — 851 lines, all 25 canonical entities)
- prisma/migrations/20260612120000_initial_schema/migration.sql (591 lines)
- database/seeds/01_lookup_data.sql (marketing_sources seed — static data only)
- tests/bootstrap/schema.test.ts

All 25 entities from 004_CANONICAL_DATA_MODEL.md implemented.
All enums from status models implemented.
Decimal(18,4) enforced on all money/quantity fields.
Immutable tables (no updatedAt): revenue_events, cost_events, profit_events,
  cash_flow_events, inventory_movements, audit_records, daily_snapshots.
Soft delete implemented on: products, inventory_layers, fixed_expenses, variable_expenses.
Hard delete prohibited enforced at schema level for: orders, inventory, finance, audit.
All indexes from 006 INDEXING POLICY applied.
Unique constraints from 006 applied: orders(storeId+provider+providerOrderId),
  products(storeId+sku), settlements(providerSettlementId), campaigns(storeId+platform+id).
No financial formulas stored or calculated (ER-001, ER-002).
No business logic in schema.

NEXT TASK: Sprint 2 — Synchronization Engine Foundation
Primary documents: 013_SYNCHRONIZATION_ENGINE, 012_API_ARCHITECTURE,
  008_INVENTORY_FIFO_ENGINE, 031_BACKGROUND_JOBS
Gate: Sprint 1 `pnpm db:generate` + `pnpm test:run` pass confirmed.

---

## SPRINT 2 — Synchronization & Integration Foundation
Status: COMPLETE
Completed: 2026-06-12

Files created:
- modules/synchronization-engine/* (types, domain, queue, scheduler, application, index)
- adapters/eazy-order/* (types, mapper, mock adapter)
- adapters/bosta/* (types, mapper, mock adapter)
- adapters/meta/* (types, mapper, mock adapter)
- adapters/tiktok/* (types, mapper, mock adapter)
- adapters/mock/mock-provider.factory.ts
- app/api/v1/sync/status/route.ts
- app/api/v1/sync/trigger/route.ts
- tests/synchronization/sync.test.ts (21 assertions)

Retry delays: [30s, 2min, 10min] per 031_BACKGROUND_JOBS.md.
Scheduler intervals: ORDERS/SHIPMENTS=10min, MARKETING/SETTLEMENTS=60min per 013.
Sync lock prevents duplicate concurrent jobs per provider+scope+store (013).
All mock adapters include hard cases: DELIVERED, RETURNED, CANCELLED, EXPECTED_RETURN.
No business calculations anywhere in sync engine or adapters.

---

## SPRINT 3 — Inventory Foundation
Status: COMPLETE
Completed: 2026-06-12

Files created:
- lib/db/prisma.ts (Prisma singleton)
- modules/inventory-engine/domain/* (types, rules, events)
- modules/inventory-engine/repositories/* (fifo-layer, movement, read)
- modules/inventory-engine/services/* (purchase, consumption, return, adjustment)
- modules/inventory-engine/index.ts
- tests/inventory/inventory.test.ts (28 assertions)

FIFO consumption emits LAYER_CONSUMED event with layerUnitCost for Financial Engine.
Cost calculation (qty × unitCost) deliberately excluded — belongs to Financial Engine.
BR-013/BR-014 enforced: only physical returns restore inventory.
BR-015 enforced: only remainingQuantity is mutable on a FIFO layer.
Inventory reservation: explicitly out of scope per 008 (Version 1).
profitContribution on order_items remains null pending Formula Catalog entry.

---

## BUSINESS DECISION — Profit Contribution Formula
Date: 2026-06-12
Authority: Business Owner (explicit decision)
Status: DOCUMENTED — authoritative from this date

Formula ID: FIN-004
Formula Name: Profit Contribution (Per Order Item)

CAMPAIGN PRODUCT:
  Profit Contribution = Realized Product Revenue − FIFO Cost − Advertising Cost − Actual Shipping Cost ± Product-Level Adjustments

NON-CAMPAIGN PRODUCTS:
  Profit Contribution = Realized Product Revenue − FIFO Cost ± Product-Level Adjustments

EXCEPTION:
  If campaign product is absent from delivered order, advertising cost and shipping cost
  remain at order level and are NOT allocated to any product.

Business Rules registered:
  BR-FIN-004-01: Advertising Cost not distributed across all products.
  BR-FIN-004-02: Actual Shipping Cost not distributed across all products.
  BR-FIN-004-03: Both costs belong exclusively to the Campaign / Primary Product.
  BR-FIN-004-04: Campaign Product identified by Order.campaignId + Order.marketingSource.
  BR-FIN-004-05: If no Campaign Product present, costs remain unallocated at order level.

Formula Catalog updated: 033_FORMULA_CATALOG_md.md v2.1.0 — FIN-004 added.
Pre-decision: profitContribution = null in order_items.
Post-decision: populated by Financial Engine in Sprint 4.

F-01 gate status: RESOLVED for FIN-004.
Remaining formula catalog gates: NONE blocking Sprint 4.
  (FIN-001 Revenue, INV-001 FIFO Cost, FIN-003 Gross Profit, FIN-002 Net Profit,
   SHIP-001 Shipping Subsidy all derivable from 007_FINANCIAL_ENGINE per
   pre-Sprint 4 verification report, 2026-06-12.)

F-03 gate status: RESOLVED — 007_FINANCIAL_ENGINE explicitly lists Positive, Zero,
  and Negative as valid Shipping Subsidy outcomes. No business ruling required.

---

## CURRENT PHASE

**Sprint 4 — Financial Engine Foundation**
Status: READY TO BEGIN

Gate cleared:
- F-01: All required formula expressions are Repository-documented or business-owner-defined.
- F-03: Shipping Subsidy sign convention resolved by 007_FINANCIAL_ENGINE.
- Formula Catalog updated with FIN-004 (Profit Contribution).

Primary documents: 007_FINANCIAL_ENGINE, 002_BUSINESS_RULES (BR-005–010),
  004_CANONICAL_DATA_MODEL (Entities 014–017), 033_FORMULA_CATALOG (FIN-003, FIN-004),
  005_SOURCE_OF_TRUTH_MATRIX.

---

## KNOWN ISSUES / BLOCKING CONDITIONS

No active blocking conditions for Sprint 4.

Documentation cleanup tasks (from P-003, not blocking):
- F-02: Update/deprecate 023_REPOSITORY_INDEX (stale listing)
- F-04: Update 050 title drift
- F-05: Reconcile version labels in old docs
- F-06: Document Sprint-to-Phase mapping
- F-07: Reconcile MANIFEST/CERTIFICATE/README inventory counts
- F-08: Add explicit KPI/Formula definition-vs-value ownership statement

---

## NEXT TASK

Sprint 4 — Financial Engine Foundation
Implements: Revenue recognition, FIFO Cost calculation, Gross Profit (FIN-003),
  Net Profit, Shipping Subsidy, Profit Contribution (FIN-004),
  Revenue Events, Cost Events, Profit Events persistence.
Trigger: Inventory LAYER_CONSUMED event → Financial Engine calculates cost.
Hard rules: All calculations reference Formula Catalog IDs. No formula invented.

---

## REPOSITORY ADDENDUM ADOPTION — 2026-06-12

### 054_SCORE_CATALOG.md — ADOPTED as Official Repository Document
- Status changed: Proposed Addendum → OFFICIAL
- Score IDs: SCORE-001 (Business Health) through SCORE-009 (Risk), SCORE-010+ reserved
- Score range: 0–100. Grades: 90–100 Excellent, 80–89 Very Good, 70–79 Good, 60–69 Average, 50–59 Poor, <50 Critical
- Pipeline extension: Analytics → KPI → Score Engine → Decision Engine → Dashboard/AI
- Key rules adopted: BR-SCORE-001 through BR-SCORE-009
- Dashboard NEVER calculates scores; displays Score Engine outputs only (BR-SCORE-006)
- Every score exposes: Inspector, confidence, trend, stability, recommended actions
- Weights must sum to 100% per score (validation rule)
- No conflict with 007, 010, 014. Score layer sits downstream of KPI Engine.

### 055_DECISION_ENGINE.md — ADOPTED as Official Repository Document
- Status changed: Proposed Addendum → OFFICIAL
- Decision IDs: DEC-001 through DEC-010, DEC-011+ reserved
- Decision categories: Marketing, Inventory, Shipping, Financial, Operational, Executive
- Priority levels: CRITICAL, HIGH, MEDIUM, LOW
- Status lifecycle: OPEN → ACKNOWLEDGED → ACCEPTED → REJECTED → EXECUTING → COMPLETED → EXPIRED
- 15 Decision Rules (DEC-RULE-001 through DEC-RULE-015) adopted as authoritative
- Decision Matrix (Opportunity × Risk) adopted
- Key rules adopted: BR-DEC-001 through BR-DEC-005
- Decision Engine NEVER modifies data or auto-executes (BR-DEC-001, BR-DEC-002)
- AI consumes Decision Engine; AI NEVER invents rules independently
- Alert types: Dashboard Alert, Smart Alert, AI Daily Brief, Push Notification
- No conflict with existing architecture; extends pipeline cleanly

### Dashboard Requirements Registered
- Every business metric supports Order Count + Item/Unit Count
- Per-Order and Per-Item views where applicable
- New Sprint 7 mandatory widgets: Cost Evolution, CPA Evolution, ROAS Evolution,
  Profit Leakage, Settlement Timeline, KPI Comparison, Smart Alerts
- Score cards: all 9 scores (SCORE-001 through SCORE-009) in V1
- Decision Center summary on Executive Dashboard
- Formula Inspector inside every KPI card

---

## SPRINT 7 — Dashboard UI
Status: IN PROGRESS
Started: 2026-06-12
Primary documents: 014, 015, 016, 043, 044, 054 (adopted), 055 (adopted)

---

## REPOSITORY CONSISTENCY PASS — 2026-06-12

### Task 1: SCORE-001 Official Resolution
Business Stability: RESERVED / INACTIVE in v1.0.
Active weight table: 7 components, Σ = 100%.
Business Stability reserved at 10% for v2.0.0 activation.
RESERVED_INACTIVE_COMPONENTS registry added to score.types.ts.
Ambiguity formally closed.

### Task 2: Historical Score Foundation
- HistoricalScoreSnapshot entity: modules/score-engine/domain/historical-score.entity.ts
- HistoricalScoreRepository: modules/score-engine/repositories/historical-score.repository.ts
  Persists daily snapshots. Builds ScoreTrendSummary (pre-computed).
  Dashboard consumes; never generates historical values.
- Score Engine orchestrator: now persists snapshot per score on each computation.

### Task 3: Historical Decision Foundation
- HistoricalDecisionRecord entity: modules/decision-engine/domain/historical-decision.entity.ts
  Full lifecycle: OPEN → ACKNOWLEDGED → ACCEPTED/REJECTED → EXECUTING → COMPLETED/EXPIRED → ARCHIVED
  Status history is append-only (immutable).
  Every record preserves: Decision Rule, Trigger timestamp, Supporting Scores/KPIs/Formulas,
  Structured Impact, Status history.
- HistoricalDecisionRepository: modules/decision-engine/repositories/historical-decision.repository.ts
  transitionDecisionStatus() validates against documented lifecycle.
  Decisions are automatically persisted when Decision Engine runs.

### Task 4: Historical APIs
- GET /api/v1/score-history (pagination, date filter, granularity, trend summary mode)
- GET /api/v1/decision-history (pagination, status/category/date filters)
- GET /api/v1/decision-history/[id] (single record with full status history)

### Task 5: Structured Impact Model
- StructuredImpact: 5 dimensions (revenue, profit, cash, inventory, operational)
- Each dimension: direction, magnitude, estimatedValue, currency, horizon, description
- DECISION_IMPACTS: canonical impact library for all 10 decision IDs
- Human-readable impactLabel/impactValue preserved for UI (UI Polish 3)
- Free-text impact replaced by canonical StructuredImpact in HistoricalDecisionRecord

### Task 6: Historical Trend Foundation
- HistoricalScoreSnapshot supports DAILY / WEEKLY / MONTHLY granularity
- ScoreTrendSummary: direction, magnitude, volatility, dataPoints — pre-computed by Score Engine
- First-class canonical entities: used by Dashboard sparklines, Trend Charts,
  AI Explanations, Decision History, Reporting Engine
- Dashboard reads historical data; never calculates trends

### Task 7: Repository Validation
- All 9 weight tables: Σ = 100% ✓
- SCORE-001: Business Stability RESERVED (not deleted) ✓
- All decisions: triggeredByRule, supportingScores, supportingKpis, supportingFormulaIds ✓
- Decision lifecycle: all 8 statuses documented, transitions validated ✓
- Structured impact: all 5 dimensions per decision ✓
- Historical entities immutable: append-only status history, no delete operations ✓
- Repository comments synchronized with implementation ✓
