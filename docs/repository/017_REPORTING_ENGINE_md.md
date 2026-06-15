**017_REPORTING_ENGINE.md**

Version: 2.0.0

Status: FINAL

Priority: HIGH

Read Order: 19 / Repository

Depends On:

* 007_FINANCIAL_ENGINE.md
* 008_INVENTORY_FIFO_ENGINE.md
* 009_FORMULA_ENGINE.md
* 010_ANALYTICS_ENGINE.md
* 011_AI_ENGINE.md
* 014_DASHBOARD_ARCHITECTURE.md
* 054_SCORE_CATALOG.md
* 055_DECISION_ENGINE.md

⸻

**ARCHITECTURE UPDATE (v2.0.0 — Repository Consistency Pass 2026-06-12)**

Reports now consume:

* Analytics Engine outputs
* Financial Engine outputs
* Score Engine outputs (SCORE-001 through SCORE-009)
* Decision Engine outputs (DecisionRecord, HistoricalDecisionRecord)
* Score History (HistoricalScoreSnapshot, ScoreTrendSummary)
* Decision History (HistoricalDecisionRecord with full status lifecycle)
* Formula Inspector (Formula Catalog, KPI Catalog, Score Catalog)
* Reporting supports Orders + Items dual-dimension everywhere applicable.
* Reporting supports Total / Per Order / Per Item wherever meaningful.

New report types added: Score Report, Decision Report.

New report sections: Formula Appendix, KPI Appendix, Score Appendix, Decision Appendix.

New analytical sections: Profit Leakage, Cost Evolution, CPA Evolution, ROAS Evolution,
Pending Money, Settlement Timeline.

⸻

**PURPOSE**

The Reporting Engine generates official business reports.

Reports provide historical, analytical and executive views of the business.

Reports never calculate business values.

Reports consume trusted outputs from Analytics, Financial, Score, Decision, and Formula Engines.

⸻

**CORE PRINCIPLES**

Reports shall:

* Never perform calculations.
* Never redefine formulas.
* Never consume raw API data.
* Never modify business records.
* Always be reproducible.
* Always reference approved business metrics with Formula IDs, KPI IDs, Score IDs, Decision IDs.
* Always preserve both Order Count and Item Count where applicable.
* Clearly separate realized vs projected values (FR-002).
* Clearly separate cash from profit (FR-004).

⸻

**REPORT GENERATION PIPELINE**

Business Engines
↓
Formula Engine
↓
Analytics Engine + Score Engine + Decision Engine
↓
Reporting Engine
↓
Export (PDF / Excel / CSV)
↓
User

⸻

**DUAL-DIMENSION REQUIREMENT**

Every report section that contains operational or financial metrics shall support:

* Total Value
* Order Count
* Item / Unit Count
* Value per Order
* Value per Item

This applies to: Revenue, COGS, Gross Profit, Net Profit, Shipping, Marketing,
Returns, Exchanges, Refusals, Inventory, and all lifecycle sections.

⸻

**REPORT CATEGORIES**

* Executive
* Financial
* Inventory
* Marketing
* Shipping
* Cash Flow
* Settlement
* Score (NEW)
* Decision (NEW)
* Product
* AI Summary
* Operational

Each report has one business purpose.

⸻

**EXECUTIVE REPORT**

Purpose: Complete executive summary.

Sections:

* Revenue (Total, Per Order, Per Item — Orders + Items)
* Gross Profit (FIN-003)
* Net Profit (FIN-002)
* Cost Evolution (lifecycle stages: Created → Delivered → Final Realized)
* Profit Leakage (all cost lines: COGS, Ads, Shipping, Return Shipping, Exchange Shipping, Packaging, Refunds, Compensations, Variable, Fixed)
* Cash Position + Pending Money (Realized / Pending / Expected / Lost — FR-004)
* Settlement Timeline
* Inventory Value
* Marketing Performance
* Shipping Performance
* Order Lifecycle (all 13 Bosta-accurate buckets, Orders + Items)
* CPA Evolution (5 stages: Created → Delivered)
* ROAS Evolution (5 stages, projected vs realized separated — FR-002)
* Business Health Score (SCORE-001) narrative
* Decision Center Summary (CRITICAL + HIGH decisions from Decision Engine)
* AI Executive Summary (narrates Score + Decision outputs)
* Formula Appendix
* Score Appendix

⸻

**FINANCIAL REPORT**

Includes:

* Revenue (Total, Per Order, Per Item — FIN-001)
* COGS (INV-001, Per Order, Per Item)
* Gross Profit (FIN-003)
* Net Profit (FIN-002)
* Profit Margin
* Profit Leakage breakdown (all 10 cost categories)
* Cost Evolution by lifecycle stage
* Shipping Subsidy (SHIP-001)
* Financial Adjustments (Refunds, Compensations)
* Cash Flow (FR-004: separate from profit)
* Pending Money (Realized / Pending / Expected / Lost)
* Settlement Timeline
* Formula Appendix (all Formula IDs referenced in report)
* KPI Appendix (all KPI IDs referenced in report)

Every value references its Formula ID.

⸻

**INVENTORY REPORT**

Includes:

* Inventory Value (INV-002, Per Product)
* FIFO Layer detail (per product, per layer)
* Inventory Turnover (INV-003)
* Days of Inventory (INV-004)
* Inventory Capacity (Current Units / Avg Units per Order / Est. Order Capacity)
* Dead Stock (value + products)
* Low Stock (products + days remaining)
* Purchase History
* Inventory Health Score (SCORE-006) narrative + component breakdown
* Historical Score trend (SCORE-006 sparkline from Score History)
* Decision Engine inventory decisions (DEC-004, DEC-005, DEC-006)

⸻

**MARKETING REPORT**

Includes:

* Marketing Spend (by platform, Per Order, Per Item)
* True CPA (MKT-002, 5-stage lifecycle)
* ROAS (MKT-003, lifecycle + realized vs projected — FR-002)
* ROI
* Campaign Performance (Campaign Score SCORE-003 per campaign)
* Platform Comparison (Meta vs TikTok)
* CPA Evolution chart data
* ROAS Evolution chart data
* Marketing Health Score (SCORE-007) narrative
* Decision Engine marketing decisions (DEC-001, DEC-002, DEC-003, DEC-008, DEC-009)
* Profit Contribution per campaign (FIN-004)

⸻

**SHIPPING REPORT**

Includes:

* Delivery Rate (OPS-001, Orders + Items)
* Return Rate (OPS-002, Orders + Items)
* Refusal Rate (OPS-003, Orders + Items)
* Exchange Rate (OPS-004)
* Order Lifecycle (all 13 Bosta-accurate buckets)
* Shipping Cost (Actual, Per Order, Per Item)
* Shipping Subsidy (SHIP-001)
* Return Shipping Cost
* Exchange Shipping Cost
* Governorate Performance table
* Governorate Score (SCORE-004) per governorate
* Shipping Performance Score (SCORE-005) narrative
* Decision Engine shipping decisions (DEC-007, DEC-008)
* Settlement Timeline

⸻

**CASH FLOW REPORT**

Includes:

* Realized Cash
* Pending Cash
* Expected Cash
* Lost Cash (refused + unrecovered returns)
* Settlement Timeline (Today / Tomorrow / Next 3 Days / Next 7 Days / Future)
* Cash vs Profit separation notice (FR-004)
* Projected Cash Flow (clearly labeled PROJECTED — FR-002)

⸻

**SETTLEMENT REPORT**

Includes:

* Expected Settlement per horizon
* Actual Settlement received
* Differences and deductions
* Outstanding Settlements
* Settlement History (date-ordered timeline)
* Reconciliation status

⸻

**SCORE REPORT (NEW)**

Purpose: Provide a complete historical record of all Business Scores.

Sections per score:

* Score ID, Score Name (EN + AR)
* Current Score + Grade
* Historical trend (daily snapshots from Score History)
* Component breakdown (weighted contributions)
* Score Inspector reference (formula version, calculation version)
* Trend direction + volatility
* Recommended actions (from ScoreResult.recommendedActions)

Report includes all 9 scores: SCORE-001 through SCORE-009.

Business Stability in SCORE-001: documented as RESERVED / INACTIVE v1.0.

Score Appendix: lists all Score IDs, component weights, version, activation status.

⸻

**DECISION REPORT (NEW)**

Purpose: Complete historical record of all decisions with lifecycle status.

Sections:

* Active decisions (OPEN + ACKNOWLEDGED)
* Accepted decisions with execution status
* Completed decisions
* Rejected decisions
* Expired decisions
* Archived decisions

Per decision:

* Decision ID + Name
* Category + Priority
* Decision Rule that triggered it (DEC-RULE-xxx)
* Trigger timestamp
* Supporting Scores + KPIs + Formula IDs
* Structured Impact (all 5 dimensions)
* Status history (full lifecycle audit trail)
* AI explanation (from AI Engine)

Decision Appendix: lists all Decision IDs, categories, documented rules.

⸻

**PRODUCT REPORT**

Includes:

* Revenue per product (Per Order, Per Item — FIN-001)
* COGS per product (INV-001, Per Item)
* Gross Profit per product (FIN-003)
* Profit Contribution per product (FIN-004)
* Product Score (SCORE-002) per product
* Return Rate per product (OPS-002)
* FIFO layer history per product

⸻

**AI SUMMARY REPORT**

AI Summary Report narrates Score + Decision Engine outputs.

Sections:

* Executive Business Narrative
* Score Engine Summary (all 9 scores, changes, trends)
* Decision Engine Summary (all active decisions, expected impacts)
* Recommended Priority Actions
* Historical context (Score History, Decision History)

AI Summary never contains independently generated scores or recommendations.

⸻

**APPENDICES (all reports)**

Every report supports the following appendices where applicable:

Formula Appendix:
* Lists all Formula IDs referenced in the report
* Formula Name, Expression (from 033_FORMULA_CATALOG), Version, Source of Truth

KPI Appendix:
* Lists all KPI IDs referenced in the report
* KPI Name (EN + AR), Formula reference, Unit, Source Engine

Score Appendix:
* Lists all Score IDs referenced in the report
* Component weights, active status, version, grade thresholds

Decision Appendix:
* Lists all Decision IDs referenced in the report
* Category, triggering rules, status

⸻

**REPORT FILTERS**

All reports support:

* Store ID
* Date Range
* Period (Today / Last 7 Days / This Month / Last Month / Custom)
* Order Count view vs Item Count view
* Realized vs Projected toggle (FR-002)
* Export format (PDF / Excel / CSV)

⸻

**EXPORT RULES**

PDF exports:
* Contain pre-computed values only (no formulas executing in PDF)
* Include watermark: "Generated from Analytics Engine outputs"
* Include Formula / KPI / Score / Decision Appendices

Excel exports:
* Values only — no live formulas
* Separate sheet per section
* Separate sheet for appendices

CSV exports:
* Flat format with column headers
* One row per data point
* Formula ID and KPI ID columns included

Historical reproducibility: reports generated for a past period must produce identical values (FR-009).

⸻

**SCHEDULED REPORTS**

Reports may be scheduled:

* Daily (Daily Brief report)
* Weekly
* Monthly

Scheduled reports run at specified time and are stored with generation timestamp.

⸻

**END OF FILE**

017_REPORTING_ENGINE.md

Version: 2.0.0

Status: FINAL — Updated Repository Consistency Pass 2026-06-12
