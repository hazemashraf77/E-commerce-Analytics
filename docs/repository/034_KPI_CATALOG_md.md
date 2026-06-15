**034_KPI_CATALOG.md**  
  
Version: 2.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 34 / Repository  
  
Depends On:  
  
* 007_FINANCIAL_ENGINE.md  
* 009_FORMULA_ENGINE.md  
* 010_ANALYTICS_ENGINE.md  
* 014_DASHBOARD_ARCHITECTURE.md  
* 016_DASHBOARD_PAGES.md  
* 033_FORMULA_CATALOG.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the official KPI Catalog.  
  
The KPI Catalog is the authoritative registry of every Key Performance Indicator (KPI) displayed anywhere in the platform.  
  
Every KPI shall:  
  
* Reference one Formula  
* Reference one Source of Truth  
* Have one Business Meaning  
* Be fully explainable  
* Be historically reproducible  
  
No undocumented KPI shall appear in production.  
  
⸻  
  
**KPI PHILOSOPHY**  
  
Business Events  
  
↓  
  
Business Engines  
  
↓  
  
Formula Engine  
  
↓  
  
KPI  
  
↓  
  
Dashboard  
  
↓  
  
Reports  
  
↓  
  
AI  
  
KPIs are business outcomes.  
  
They are never raw database values.  
  
⸻  
  
**KPI IDENTIFIER**  
  
Every KPI shall include:  
  
* KPI ID  
* KPI Name  
* Category  
* Business Description  
* Formula ID  
* Source of Truth  
* Business Owner  
* Dashboard Location  
* Report Location  
* AI Availability  
  
KPI IDs are permanent.  
  
⸻  
  
**STANDARD KPI TEMPLATE**  
  
Every KPI entry shall contain:  
  
KPI ID  
  
KPI Name  
  
Business Meaning  
  
Purpose  
  
Formula Reference  
  
Inputs  
  
Output  
  
Unit  
  
Category  
  
Owner  
  
Dashboard  
  
Reports  
  
AI Support  
  
Target  
  
Alert Rules  
  
Historical Notes  
  
Repository References  
  
⸻  
  
**EXECUTIVE KPIs**  
  
Examples:  
  
* Revenue  
* Gross Profit  
* Net Profit  
* Cash Balance  
* Inventory Value  
* Marketing Spend  
* Delivery Rate  
* Financial Health Score  
* Expected Profit  
* Profit Per Delivered Order  
  
Executive KPIs appear on the Executive Dashboard.  
  
⸻  
  
**FINANCIAL KPIs**  
  
Examples:  
  
* Revenue  
* COGS  
* Gross Profit  
* Net Profit  
* Gross Margin  
* Net Margin  
* Shipping Subsidy  
* Operating Expenses  
* Contribution Margin  
* Cash Flow  
  
Financial KPIs originate from the Financial Engine.  
  
⸻  
  
**INVENTORY KPIs**  
  
Examples:  
  
* Inventory Value  
* Available Quantity  
* Inventory Turnover  
* Days of Inventory  
* Dead Stock  
* Slow Moving Stock  
* Low Stock Count  
* Out of Stock Count  
  
Inventory KPIs originate from the Inventory Engine.  
  
⸻  
  
**MARKETING KPIs**  
  
Examples:  
  
* Marketing Spend  
* True CPA  
* ROI  
* ROAS  
* CAC  
* Campaign Profit  
* Delivered Orders  
* Cost Per Delivered Order  
  
Marketing KPIs combine Marketing data with Financial calculations.  
  
⸻  
  
**SHIPPING KPIs**  
  
Examples:  
  
* Delivery Rate  
* Return Rate  
* Refusal Rate  
* Shipping Cost  
* Average Shipping Cost  
* Shipping Subsidy  
* Delivery Success Rate  
  
Shipping KPIs consume approved shipment datasets only.  
  
⸻  
  
**SETTLEMENT KPIs**  
  
Examples:  
  
* Expected Settlement  
* Actual Settlement  
* Settlement Difference  
* Outstanding Settlement  
* Deduction Amount  
* Deduction Percentage  
  
Settlement KPIs support financial reconciliation.  
  
⸻  
  
**AI KPIs**  
  
Examples:  
  
* Business Health Score  
* Product Score  
* Campaign Score  
* Opportunity Score  
* Risk Score  
  
AI KPIs remain advisory.  
  
They never replace financial KPIs.  
  
⸻  
  
## END OF PART 1  
  
**\**  
  
**CONTINUATION OF 034_KPI_CATALOG.md**  
  
⸻  
  
**KPI CATEGORIES**  
  
Official KPI categories include:  
  
* Executive  
* Financial  
* Inventory  
* Marketing  
* Shipping  
* Settlement  
* Cash Flow  
* AI  
* Operational  
  
Each KPI belongs to one primary category.  
  
⸻  
  
**KPI FORMULA REFERENCE**  
  
Every KPI shall reference exactly one Formula.  
  
Example:  
  
KPI  
  
Gross Profit  
  
↓  
  
Formula ID  
  
FIN-003  
  
↓  
  
Formula Catalog  
  
↓  
  
Formula Engine  
  
↓  
  
Dashboard  
  
Formula ownership remains centralized.  
  
⸻  
  
**KPI SOURCE OF TRUTH**  
  
Every KPI shall explicitly declare its Source of Truth.  
  
Examples:  
  
Revenue  
  
↓  
  
Orders  
  
FIFO Cost  
  
↓  
  
Inventory Engine  
  
Marketing Spend  
  
↓  
  
Marketing Provider  
  
Settlement Amount  
  
↓  
  
Settlement Records  
  
No KPI shall consume undocumented inputs.  
  
⸻  
  
**KPI OWNERSHIP**  
  
Every KPI shall have one Business Owner.  
  
Examples:  
  
Finance  
  
Inventory  
  
Marketing  
  
Operations  
  
Executive  
  
Ownership determines:  
  
* Review Authority  
* Approval  
* Future KPI Changes  
  
⸻  
  
**KPI TARGETS**  
  
KPIs may define business targets.  
  
Example:  
  
Delivery Rate  
  
Target  
  
≥ 90%  
  
Current  
  
87%  
  
Status  
  
Warning  
  
Targets support business monitoring.  
  
Targets never affect calculations.  
  
⸻  
  
**KPI ALERT RULES**  
  
KPIs may trigger alerts.  
  
Examples:  
  
Net Profit  
  
< 0  
  
↓  
  
Critical Alert  
  
Delivery Rate  
  
< Target  
  
↓  
  
Warning  
  
Inventory Value  
  
Below Minimum  
  
↓  
  
Low Stock Alert  
  
Alerts remain informational.  
  
⸻  
  
**KPI TRENDS**  
  
Every KPI shall support historical trends.  
  
Trend types include:  
  
* Daily  
* Weekly  
* Monthly  
* Quarterly  
* Yearly  
  
Trend generation originates from the Analytics Engine.  
  
⸻  
  
**KPI COMPARISONS**  
  
Supported comparisons include:  
  
Current Period  
  
↓  
  
Previous Period  
  
↓  
  
Previous Year  
  
↓  
  
Custom Period  
  
Comparisons consume historical snapshots.  
  
⸻  
  
**KPI DRILL-DOWN**  
  
Every KPI shall support drill-down.  
  
Example:  
  
Revenue  
  
↓  
  
Revenue Breakdown  
  
↓  
  
Orders  
  
↓  
  
Order Lookup  
  
↓  
  
Formula Inspector  
  
↓  
  
Business Events  
  
Every KPI must remain explainable.  
  
⸻  
  
**KPI LOCALIZATION**  
  
KPI metadata shall support:  
  
English  
  
Arabic  
  
Localized fields include:  
  
* KPI Name  
* Description  
* Tooltip  
* Dashboard Labels  
* Report Labels  
  
Business values remain language independent.  
  
⸻  
  
**KPI VISIBILITY**  
  
Each KPI shall declare visibility.  
  
Examples:  
  
Executive Dashboard  
  
Financial Dashboard  
  
Inventory Dashboard  
  
Marketing Dashboard  
  
Reports  
  
AI  
  
Formula Inspector  
  
Visibility is documented explicitly.  
  
⸻  
  
**KPI REFRESH POLICY**  
  
Each KPI shall define:  
  
* Refresh Frequency  
* Data Freshness Requirement  
* Snapshot Dependency  
* Synchronization Dependency  
  
Users should always know how recent each KPI is.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
**CONTINUATION OF 034_KPI_CATALOG.md**  
  
⸻  
  
**KPI VALIDATION**  
  
Every KPI shall undergo automated validation.  
Every KPI shall undergo automated validation.  
  
Validation includes:  
Validation includes:  
  
* Formula Accuracy  
* Source of Truth Verification  
* Historical Consistency  
* Snapshot Consistency  
* Dashboard Consistency  
* Report Consistency  
* AI Consistency  
  
No KPI may appear in production without passing validation.  
  
⸻  
  
**KPI CHANGE MANAGEMENT**  
  
Changes to KPIs require:  
  
Business Review  
Business Review  
  
↓  
↓  
  
Formula Review  
Formula Review  
  
↓  
↓  
  
Documentation Update  
  
↓  
↓  
  
Repository Update  
Repository Update  
  
↓  
↓  
  
Implementation  
  
↓  
↓  
  
Testing  
Testing  
  
↓  
↓  
  
Production Release  
  
Undocumented KPI changes are prohibited.  
Undocumented KPI changes are prohibited.  
  
⸻  
  
**KPI DEPENDENCY MAP**  
  
Every KPI shall declare upstream dependencies.  
Every KPI shall declare upstream dependencies.  
  
Example:  
Example:  
  
Orders  
Orders  
  
↓  
↓  
  
Revenue  
  
↓  
↓  
  
Gross Profit  
Gross Profit  
  
↓  
↓  
  
Net Profit  
  
↓  
  
Profit Margin  
  
↓  
↓  
  
Financial Health Score  
  
Dependency maps support explainability and impact analysis.  
  
⸻  
  
**KPI LIFECYCLE**  
  
Every KPI follows one lifecycle.  
  
Proposed  
Proposed  
  
↓  
  
Reviewed  
Reviewed  
  
↓  
↓  
  
Approved  
Approved  
  
↓  
↓  
  
Implemented  
  
↓  
↓  
  
Tested  
  
↓  
↓  
  
Released  
  
↓  
↓  
  
Monitored  
Monitored  
  
Deprecated KPIs remain documented until officially retired.  
Deprecated KPIs remain documented until officially retired.  
  
⸻  
  
**KPI CHANGE LOG**  
  
Every KPI shall preserve:  
Every KPI shall preserve:  
  
* KPI ID  
* Previous Definition  
* New Definition  
* Formula Version  
* Business Justification  
* Approval  
* Repository Reference  
* Effective Date  
  
Historical KPI definitions remain accessible.  
  
⸻  
  
**KPI TAGS**  
  
KPIs support searchable tags.  
  
Examples:  
Examples:  
  
Revenue  
Revenue  
  
Profit  
Profit  
  
Inventory  
  
Marketing  
  
Shipping  
Shipping  
  
Settlement  
Settlement  
  
Cash Flow  
  
Executive  
Executive  
  
AI  
AI  
  
Tags improve navigation only.  
Tags improve navigation only.  
  
They never influence KPI calculations.  
  
⸻  
  
**KPI SEARCH**  
  
The KPI Catalog shall support searching by:  
The KPI Catalog shall support searching by:  
  
* KPI ID  
* KPI Name  
* Category  
* Formula ID  
* Dashboard  
* Business Owner  
* Tags  
* Repository Document  
  
The KPI Catalog becomes the official reference for all platform metrics.  
The KPI Catalog becomes the official reference for all platform metrics.  
  
⸻  
  
**KPI DEPRECATION**  
  
Deprecated KPIs shall:  
Deprecated KPIs shall:  
  
* Remain documented.  
* Display replacement guidance.  
* Preserve historical references.  
* Never disappear from historical reports.  
  
Historical reports remain reproducible.  
Historical reports remain reproducible.  
  
⸻  
  
**FUTURE KPI SUPPORT**  
  
The KPI architecture shall support future additions including:  
The KPI architecture shall support future additions including:  
  
* Purchasing KPIs  
* Supplier KPIs  
* Warehouse KPIs  
* Multi-Warehouse KPIs  
* Multi-Currency KPIs  
* Multi-Company KPIs  
* Forecast KPIs  
* Budget KPIs  
* Customer Lifetime KPIs  
* Operational Efficiency KPIs  
  
Future KPIs shall integrate without redesigning the Analytics Engine or Dashboard architecture.  
Future KPIs shall integrate without redesigning the Analytics Engine or Dashboard architecture.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The KPI Catalog is considered complete only if:  
The KPI Catalog is considered complete only if:  
  
* Every KPI has a permanent identifier.  
* Every KPI references exactly one Formula.  
* Every KPI has a documented Source of Truth.  
* Every KPI supports Formula Inspector.  
* KPI ownership is assigned.  
* Historical KPI definitions remain reproducible.  
* Dashboard, Reports, and AI display identical KPI values.  
* KPI validation is automated.  
* KPI dependency maps are documented.  
* Future KPIs can be added without architectural redesign.  
  
The KPI Catalog is the authoritative registry of business performance indicators.  
The KPI Catalog is the authoritative registry of business performance indicators.  
  
It guarantees that every KPI displayed by the platform is explainable, auditable, versioned, deterministic, and fully aligned with the Repository architecture.  
It guarantees that every KPI displayed by the platform is explainable, auditable, versioned, deterministic, and fully aligned with the Repository architecture.  
  
⸻  
  
**END OF FILE**  
  
034_KPI_CATALOG.md  
034_KPI_CATALOG.md  
  
Version: 2.0.0  
Version: 2.0.0  
  
Status: FINAL  
