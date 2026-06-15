**002_BUSINESS_RULES.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 4 / Repository  
  
Depends On:  
  
* 000_CLAUDE_MASTER_INSTRUCTIONS.md  
* 000A_PROJECT_DECISION_PRINCIPLES.md  
* 001_PROJECT_CONSTITUTION.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the permanent business rules governing the platform.  
  
Every calculation, workflow, report, dashboard, API integration and AI recommendation must comply with these rules.  
  
Business Rules are mandatory.  
  
Implementation convenience shall never override business rules.  
  
⸻  
  
**BUSINESS RULE 001**  
  
**Orders Originate From External Systems**  
  
Normal customer orders must originate from external operational systems.  
  
Current supported operational systems include:  
  
* Eazy Order  
  
Future operational systems may also be supported.  
  
Manual creation of ordinary customer orders inside this platform is forbidden.  
  
⸻  
  
**BUSINESS RULE 002**  
  
**Local Analytical Copy**  
  
Imported orders SHALL be stored inside the local analytical database.  
  
Purpose:  
  
* Financial calculations  
* Historical reporting  
* FIFO  
* Forecasting  
* AI  
* Formula Inspector  
* Order Lookup  
* Executive Dashboards  
  
The local analytical database is not intended to replace operational systems.  
  
⸻  
  
**BUSINESS RULE 003**  
  
**Manual Financial Records**  
  
Manual records are allowed only for exceptional business events.  
  
Examples:  
  
* Exchange  
* Refund  
* Compensation  
* External Payment  
* InstaPay Settlement  
* Financial Adjustment  
  
Whenever possible, every manual record must reference an existing Order ID.  
  
⸻  
  
**BUSINESS RULE 004**  
  
**Order Lifecycle Authority**  
  
Order lifecycle originates from Eazy Order.  
  
Shipment lifecycle originates from Bosta.  
  
The analytical platform consumes both.  
  
It never owns operational workflows.  
  
⸻  
  
**BUSINESS RULE 005**  
  
**Revenue Recognition**  
  
Revenue becomes realized ONLY after:  
  
Delivered  
  
No other order status creates realized revenue.  
  
Examples:  
  
Pending  
  
Confirmed  
  
Processing  
  
Out For Delivery  
  
Expected Delivery  
  
These statuses generate zero realized revenue.  
  
Forecast modules may estimate future revenue separately.  
  
⸻  
  
**BUSINESS RULE 006**  
  
**Profit Recognition**  
  
Profit follows revenue recognition.  
  
Profit becomes realized only after Delivered.  
  
Projected Profit and Realized Profit are different metrics.  
  
They must never be mixed.  
  
⸻  
  
**BUSINESS RULE 007**  
  
**Expected Profit**  
  
Expected Profit is allowed.  
  
Expected Profit must always be clearly identified.  
  
Expected Profit must never appear inside realized financial statements.  
  
⸻  
  
**BUSINESS RULE 008**  
  
**Shipping Revenue**  
  
Shipping charged to customers is revenue.  
  
Actual shipping charged by Bosta is expense.  
  
These values are independent.  
  
Never replace one with the other.  
  
⸻  
  
**BUSINESS RULE 009**  
  
**Shipping Subsidy**  
  
The company may absorb part of shipping cost.  
  
Formula:  
  
Shipping Subsidy  
  
=  
  
Actual Shipping Cost  
  
Customer Shipping Fee  
  
Shipping Subsidy may be positive.  
  
Shipping Subsidy may be zero.  
  
Shipping Subsidy must always be visible inside Formula Inspector.  
  
⸻  
  
**BUSINESS RULE 010**  
  
**Shipping Per Order**  
  
Shipping applies to the entire order.  
  
Shipping does not apply per product.  
  
Shipping does not multiply by quantity.  
  
One shipment.  
  
One shipping calculation.  
  
Regardless of product count.  
  
⸻  
  
**BUSINESS RULE 011**  
  
**Inventory Valuation**  
  
Inventory valuation shall always use FIFO.  
  
Average Cost is forbidden.  
  
Weighted Average is forbidden.  
  
LIFO is forbidden.  
  
FIFO is mandatory.  
  
⸻  
  
**BUSINESS RULE 012**  
  
**Inventory Consumption**  
  
Inventory is consumed only when business rules define inventory leaving the warehouse.  
  
Consumption shall always preserve FIFO sequence.  
  
⸻  
  
**BUSINESS RULE 013**  
  
**Returned Inventory**  
  
Inventory is restored only after physical return.  
  
Returned inventory restores:  
  
* Quantity  
* FIFO Layer  
* Inventory Availability  
  
Expected Returns never restore inventory.  
  
⸻  
  
**BUSINESS RULE 014**  
  
**Expected Returns**  
  
Expected Returns represent prediction.  
  
They do not represent physical inventory.  
  
Expected Returns affect forecasting only.  
  
Expected Returns never affect inventory valuation.  
  
⸻  
  
**BUSINESS RULE 015**  
  
**Inventory Layers**  
  
Every inventory purchase creates a new FIFO layer.  
  
Each layer preserves:  
  
Purchase Date  
  
Supplier  
  
Quantity  
  
Unit Cost  
  
Remaining Quantity  
  
Consumption History  
  
FIFO Layers must remain historically preserved.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 002_BUSINESS_RULES.md**  
  
⸻  
  
**BUSINESS RULE 016**  
  
**Inventory Purchase**  
  
Inventory enters the system only through valid inventory purchase transactions.  
  
Every purchase transaction must create one or more FIFO inventory layers.  
  
Historical purchase prices must never be modified.  
  
Future purchases never affect historical purchase costs.  
  
⸻  
  
**BUSINESS RULE 017**  
  
**Product Identity**  
  
Every physical product shall have one Canonical Product.  
  
Marketing names are aliases.  
  
Aliases may differ between:  
  
* Meta Ads  
* TikTok Ads  
* Landing Pages  
* Internal Naming  
* Campaign Names  
  
Financial calculations always use the Canonical Product.  
  
⸻  
  
**BUSINESS RULE 018**  
  
**Product Aliases**  
  
A single product may have unlimited aliases.  
  
Aliases exist only for marketing attribution.  
  
Aliases never create new inventory items.  
  
Aliases never create duplicate products.  
  
Aliases always resolve to one Canonical Product.  
  
⸻  
  
**BUSINESS RULE 019**  
  
**Multiple Products Per Order**  
  
Orders may contain one or more products.  
  
Every product line shall be evaluated independently.  
  
Calculations include:  
  
* Quantity  
* FIFO Cost  
* Revenue Allocation  
* Profit Contribution  
  
The order remains one shipment.  
  
⸻  
  
**BUSINESS RULE 020**  
  
**Quantity**  
  
A customer may purchase multiple units of the same product.  
  
Inventory consumption shall occur one physical unit at a time according to FIFO.  
  
Shipping remains one shipping transaction.  
  
⸻  
  
**BUSINESS RULE 021**  
  
**Cross Sell**  
  
Cross Sell products are ordinary order items.  
  
No special inventory treatment is required.  
  
Cross Sell contributes normally to:  
  
Revenue  
  
Profit  
  
Inventory  
  
Marketing Analytics  
  
AI Analysis  
  
⸻  
  
**BUSINESS RULE 022**  
  
**Upsell**  
  
Upsell products follow the same accounting treatment as Cross Sell.  
  
No separate inventory model is required.  
  
Only marketing attribution differs.  
  
⸻  
  
**BUSINESS RULE 023**  
  
**Marketing Attribution**  
  
Marketing attribution must remain independent from financial calculations.  
  
Changing attribution rules must never modify historical financial values.  
  
Marketing attribution affects analytics.  
  
It does not affect inventory.  
  
⸻  
  
**BUSINESS RULE 024**  
  
**Campaign Source**  
  
Every imported order should identify its acquisition source whenever possible.  
  
Examples:  
  
* Meta  
* TikTok  
* Direct  
* Organic  
* Unknown  
  
The acquisition source is independent from campaign names.  
  
⸻  
  
**BUSINESS RULE 025**  
  
**Campaign Names**  
  
Campaign names are external identifiers.  
  
Campaign names are not reliable business identifiers.  
  
Campaign names may change.  
  
Business analytics should rely on Canonical Products rather than campaign names.  
  
⸻  
  
**BUSINESS RULE 026**  
  
**True CPA**  
  
Advertising Platform CPA is not the same as Business True CPA.  
  
Platform CPA belongs to the advertising platform.  
  
True CPA belongs to the Financial Engine.  
  
True CPA calculations must use documented business formulas.  
  
Never substitute one for the other.  
  
⸻  
  
**BUSINESS RULE 027**  
  
**Marketing Spend**  
  
Marketing spend originates from advertising platforms.  
  
Marketing spend must never be manually estimated.  
  
If imported data is unavailable:  
  
Display Missing Data.  
  
Do not estimate values.  
  
⸻  
  
**BUSINESS RULE 028**  
  
**Cost Of Goods Sold**  
  
COGS shall always be calculated using FIFO.  
  
COGS becomes realized only when the order becomes Delivered.  
  
Forecast modules may estimate projected COGS separately.  
  
⸻  
  
**BUSINESS RULE 029**  
  
**Gross Profit**  
  
Gross Profit must be calculated independently from Net Profit.  
  
Both metrics shall remain available.  
  
Neither metric replaces the other.  
  
⸻  
  
**BUSINESS RULE 030**  
  
**Net Profit**  
  
Net Profit shall include all documented business expenses.  
  
Only documented expenses participate in calculations.  
  
Undocumented assumptions are forbidden.  
  
⸻  
  
**BUSINESS RULE 031**  
  
**Fixed Expenses**  
  
Fixed Expenses are entered manually.  
  
Examples include:  
  
* Salaries  
* Rent  
* Internet  
* Software Subscriptions  
* Utilities  
  
Fixed Expenses are independent from order lifecycle.  
  
⸻  
  
**BUSINESS RULE 032**  
  
**Variable Expenses**  
  
Variable Expenses originate from business operations.  
  
Examples include:  
  
* Shipping  
* Packaging  
* Marketing  
* Payment Fees  
  
Variable expenses may participate in per-order profitability.  
  
⸻  
  
**BUSINESS RULE 033**  
  
**Refunds**  
  
Refunds are financial events.  
  
Refunds must never silently modify historical reports.  
  
Refunds create adjustment events.  
  
Adjustment events remain historically visible.  
  
⸻  
  
**BUSINESS RULE 034**  
  
**Exchanges**  
  
Exchanges are financial events.  
  
An exchange must preserve historical traceability.  
  
The original order remains unchanged.  
  
The exchange is recorded as an independent business event linked to the original Order ID.  
  
⸻  
  
**BUSINESS RULE 035**  
  
**Manual Adjustments**  
  
Manual adjustments are exceptional.  
  
Every manual adjustment requires:  
  
* Reason  
* User  
* Timestamp  
* Financial Impact  
* Related Entity  
  
Manual adjustments must always be auditable.  
  
⸻  
  
## END OF PART 2  
  
  
**\**  
  
  
  
**CONTINUATION OF 002_BUSINESS_RULES.md**  
  
⸻  
  
**BUSINESS RULE 036**  
  
**Settlement Authority**  
  
Shipping settlements originate from Bosta.  
  
The platform consumes settlement data.  
  
The platform reconciles settlement data.  
  
The platform never creates settlement data.  
  
⸻  
  
**BUSINESS RULE 037**  
  
**Settlement Reconciliation**  
  
Every settlement shall compare:  
  
Expected Settlement  
  
vs  
  
Actual Settlement  
  
The reconciliation process must identify:  
  
* Shipping Charges  
* Return Charges  
* Exchange Charges  
* Additional Fees  
* Adjustments  
* Differences  
  
Every difference must be explainable.  
  
⸻  
  
**BUSINESS RULE 038**  
  
**Cash Flow**  
  
Cash Flow is independent from Profit.  
  
Cash Flow tracks actual money movement.  
  
Profit measures business performance.  
  
Cash Flow and Profit must never be merged into a single metric.  
  
⸻  
  
**BUSINESS RULE 039**  
  
**Cash In**  
  
Cash In represents money actually received.  
  
Examples include:  
  
* Bosta Settlement  
* InstaPay  
* Manual External Payment  
  
Expected payments are not Cash In.  
  
Forecasted payments are not Cash In.  
  
⸻  
  
**BUSINESS RULE 040**  
  
**Cash Out**  
  
Cash Out represents actual money leaving the business.  
  
Examples include:  
  
* Inventory Purchases  
* Marketing Spend  
* Fixed Expenses  
* Shipping Expenses  
* Refunds  
* Compensations  
  
Cash Out must always be supported by business records.  
  
⸻  
  
**BUSINESS RULE 041**  
  
**Forecasting**  
  
Forecasting is predictive.  
  
Forecast values must never overwrite realized business values.  
  
Forecasts must always remain clearly identified.  
  
Historical reports must ignore forecast values.  
  
⸻  
  
**BUSINESS RULE 042**  
  
**AI Recommendations**  
  
AI recommendations are advisory only.  
  
AI never changes business data.  
  
AI never modifies calculations.  
  
AI never modifies financial records.  
  
Every recommendation must include:  
  
* Business Reason  
* Supporting Data  
* Expected Impact  
* Confidence Level  
  
⸻  
  
**BUSINESS RULE 043**  
  
**Formula Inspector**  
  
Every calculated metric displayed to users must support Formula Inspector.  
  
Formula Inspector shall expose:  
  
* Formula  
* Inputs  
* Data Sources  
* Intermediate Steps  
* Final Result  
  
No hidden calculation is permitted.  
  
⸻  
  
**BUSINESS RULE 044**  
  
**Dashboard Purpose**  
  
Dashboards exist for executive decision making.  
  
Dashboards are not operational management screens.  
  
Dashboards summarize business performance.  
  
Operational editing belongs to operational systems.  
  
⸻  
  
**BUSINESS RULE 045**  
  
**Executive Dashboard**  
  
The Executive Dashboard shall present only executive KPIs.  
  
It shall never display operational complexity by default.  
  
Users may drill down into details.  
  
⸻  
  
**BUSINESS RULE 046**  
  
**Historical Reports**  
  
Historical reports represent historical reality.  
  
Future events must never modify historical reports.  
  
Historical reports remain reproducible forever.  
  
⸻  
  
**BUSINESS RULE 047**  
  
**Source Of Truth**  
  
Every business entity has one authoritative source.  
  
Examples:  
  
Orders  
→ Eazy Order  
  
Shipment Status  
→ Bosta  
  
Shipping Cost  
→ Bosta  
  
Inventory Cost  
→ Inventory Engine  
  
Marketing Spend  
→ Marketing Platforms  
  
Financial Calculations  
→ Financial Engine  
  
AI Recommendations  
→ AI Engine  
  
Never violate the Source Of Truth Matrix.  
  
⸻  
  
**BUSINESS RULE 048**  
  
**API Independence**  
  
Business Rules are independent from APIs.  
  
If an API changes:  
  
Business Rules remain unchanged.  
  
Only the Adapter Layer changes.  
  
⸻  
  
**BUSINESS RULE 049**  
  
**Background Synchronization**  
  
Synchronization must occur in the background.  
  
Users should never wait for external APIs while browsing dashboards.  
  
Synchronization supports:  
  
* Incremental Updates  
* Retry  
* Resume  
* Logging  
* Monitoring  
* Idempotent Updates  
  
⸻  
  
**BUSINESS RULE 050**  
  
**Idempotent Synchronization**  
  
Importing identical external data multiple times must never create duplicate business records.  
  
Repeated synchronization must update existing records rather than duplicate them.  
  
⸻  
  
**BUSINESS RULE 051**  
  
**Incremental Synchronization**  
  
Whenever supported by the provider:  
  
Synchronize only data that has changed since the previous successful synchronization.  
  
Avoid unnecessary API calls.  
  
Respect provider rate limits.  
  
⸻  
  
**BUSINESS RULE 052**  
  
**Failed Synchronization**  
  
Synchronization failures must never corrupt existing data.  
  
If synchronization fails:  
  
* Preserve previous data.  
* Log the error.  
* Retry according to synchronization policy.  
* Notify administrators when appropriate.  
  
⸻  
  
**BUSINESS RULE 053**  
  
**Audit Trail**  
  
Every important business action must be traceable.  
  
Examples include:  
  
* Imports  
* Manual Entries  
* Inventory Adjustments  
* Configuration Changes  
* Settlement Imports  
* Formula Changes  
  
Audit history is permanent.  
  
Audit history is immutable.  
  
⸻  
  
**BUSINESS RULE 054**  
  
**Multi-Store**  
  
The application must support multiple stores.  
  
Business reporting must support:  
  
* Individual Store  
* Combined Stores  
  
Without changing business logic.  
  
⸻  
  
**BUSINESS RULE 055**  
  
**Localization**  
  
The application must support:  
  
English  
  
Arabic  
  
All dashboards.  
  
All reports.  
  
All business terminology.  
  
Localization shall not affect calculations.  
  
Localization affects presentation only.  
  
⸻  
  
**BUSINESS RULE 056**  
  
**Documentation Compliance**  
  
Every future module implemented in this project must comply with all Business Rules documented here.  
  
Implementation convenience never overrides documented business rules.  
  
Business Rules are contractual.  
  
⸻  
  
## END OF PART 3  
  
  
  
\  
  
  
  
**CONTINUATION OF 002_BUSINESS_RULES.md**  
  
⸻  
  
**BUSINESS RULE 057**  
  
**Financial Period Integrity**  
  
Every financial transaction shall belong to exactly one financial period.  
Every financial transaction shall belong to exactly one financial period.  
  
Historical financial periods must remain closed after final reconciliation unless explicitly reopened by an authorized administrator.  
Historical financial periods must remain closed after final reconciliation unless explicitly reopened by an authorized administrator.  
  
Changes affecting closed periods must be recorded as adjustment entries.  
  
Historical transactions must never be silently modified.  
  
⸻  
  
**BUSINESS RULE 058**  
  
**Business Calendar**  
  
The application shall support business reporting by:  
  
* Day  
* Week  
* Month  
* Quarter  
* Year  
* Custom Date Range  
  
Every report must produce identical results when executed repeatedly using the same period.  
Every report must produce identical results when executed repeatedly using the same period.  
  
⸻  
  
**BUSINESS RULE 059**  
  
**Daily Snapshot**  
  
At the end of every business day, the system should generate a Daily KPI Snapshot.  
  
Snapshots preserve historical values for comparison even if future operational data changes.  
  
Snapshots should include:  
Snapshots should include:  
  
* Revenue  
* Profit  
* Orders  
* Delivery Rate  
* Return Rate  
* Marketing Spend  
* Cash Position  
* Inventory Value  
  
Snapshots are immutable.  
Snapshots are immutable.  
  
⸻  
  
**BUSINESS RULE 060**  
  
**KPI Consistency**  
  
A KPI must have exactly one definition.  
  
The same KPI must always use the same formula throughout the application.  
The same KPI must always use the same formula throughout the application.  
  
The same KPI must never produce different values on different dashboards.  
  
Formula duplication is prohibited.  
  
⸻  
  
**BUSINESS RULE 061**  
  
**Formula Version Control**  
  
Every business formula shall support version tracking.  
  
Formula changes shall never invalidate historical calculations.  
Formula changes shall never invalidate historical calculations.  
  
Historical reports continue using the formula version active at the reporting date.  
Historical reports continue using the formula version active at the reporting date.  
  
⸻  
  
**BUSINESS RULE 062**  
  
**Executive KPIs**  
  
Executive KPIs must prioritize business decisions rather than operational details.  
Executive KPIs must prioritize business decisions rather than operational details.  
  
Examples include:  
Examples include:  
  
* Net Profit  
* Gross Profit  
* Cash Flow  
* Inventory Value  
* True CPA  
* Delivery Rate  
* Return Rate  
* Profit Margin  
* Marketing ROI  
* Expected Settlement  
  
Operational metrics belong to operational dashboards.  
Operational metrics belong to operational dashboards.  
  
⸻  
  
**BUSINESS RULE 063**  
  
**Drill Down**  
  
Every dashboard KPI must support drill-down whenever technically possible.  
Every dashboard KPI must support drill-down whenever technically possible.  
  
The drill-down path should eventually reach:  
The drill-down path should eventually reach:  
  
Business Metric  
Business Metric  
  
↓  
  
Formula Inspector  
  
↓  
↓  
  
Business Events  
Business Events  
  
↓  
↓  
  
Supporting Records  
  
↓  
↓  
  
Source Data  
Source Data  
  
Users should never encounter unexplained numbers.  
  
⸻  
  
**BUSINESS RULE 064**  
  
**Missing Data**  
  
Missing external data shall never be estimated.  
Missing external data shall never be estimated.  
  
Instead:  
  
Display the metric as unavailable.  
  
Explain why.  
Explain why.  
  
Allow synchronization or corrective action.  
Allow synchronization or corrective action.  
  
Business decisions must never rely on fabricated values.  
  
⸻  
  
**BUSINESS RULE 065**  
  
**Inconsistent Data**  
  
When external systems provide inconsistent information:  
  
The application must:  
The application must:  
  
* Detect inconsistencies.  
* Preserve imported data.  
* Flag discrepancies.  
* Prevent silent corruption.  
  
Business users must be informed whenever inconsistencies affect reporting.  
Business users must be informed whenever inconsistencies affect reporting.  
  
⸻  
  
**BUSINESS RULE 066**  
  
**Data Validation**  
  
Every imported record shall be validated before entering the analytical model.  
  
Invalid records must:  
  
* Be rejected.  
* Be logged.  
* Preserve original payload.  
* Allow future investigation.  
  
Validation failures must never damage existing business data.  
Validation failures must never damage existing business data.  
  
⸻  
  
**BUSINESS RULE 067**  
  
**Duplicate Detection**  
  
Duplicate imports must be detected automatically.  
  
Duplicate business events must never create duplicate financial impact.  
  
Business identity shall be determined using documented identifiers.  
  
⸻  
  
**BUSINESS RULE 068**  
  
**Business Identity**  
  
Every important business entity shall possess a permanent internal identifier.  
Every important business entity shall possess a permanent internal identifier.  
  
External identifiers may change.  
  
Internal identifiers remain stable.  
  
Canonical identifiers shall be used throughout the platform.  
Canonical identifiers shall be used throughout the platform.  
  
⸻  
  
**BUSINESS RULE 069**  
  
**Currency**  
  
The application shall support currency abstraction.  
  
Although the first implementation may use a single currency, architecture shall support future multi-currency expansion.  
Although the first implementation may use a single currency, architecture shall support future multi-currency expansion.  
  
Business calculations shall remain currency-aware.  
  
⸻  
  
**BUSINESS RULE 070**  
  
**Time Zone**  
  
Every stored timestamp shall preserve absolute accuracy.  
  
Presentation may adapt to user preferences.  
  
Business calculations shall never become inconsistent because of timezone conversion.  
  
⸻  
  
**BUSINESS RULE 071**  
  
**AI Explainability**  
  
Every AI recommendation must identify:  
  
* Data used  
* KPIs involved  
* Reasoning  
* Expected outcome  
* Confidence  
  
AI outputs without supporting evidence are prohibited.  
AI outputs without supporting evidence are prohibited.  
  
⸻  
  
**BUSINESS RULE 072**  
  
**Notifications**  
  
Notifications shall be informational.  
Notifications shall be informational.  
  
Notifications must never silently modify business data.  
  
Business events create notifications.  
Business events create notifications.  
  
Notifications do not create business events.  
  
⸻  
  
**BUSINESS RULE 073**  
  
**Attachments**  
  
Manual financial adjustments may include supporting attachments.  
Manual financial adjustments may include supporting attachments.  
  
Examples include:  
Examples include:  
  
* Settlement PDF  
* Refund Receipt  
* Invoice  
* Bank Transfer Proof  
  
Attachments improve auditability.  
Attachments improve auditability.  
  
Attachments do not replace business records.  
Attachments do not replace business records.  
  
⸻  
  
**BUSINESS RULE 074**  
  
**Notes**  
  
Users may attach business notes to:  
  
Orders  
Orders  
  
Products  
Products  
  
Settlements  
  
Expenses  
Expenses  
  
Inventory Purchases  
Inventory Purchases  
  
Financial Adjustments  
Financial Adjustments  
  
Notes are informational.  
Notes are informational.  
  
Notes never affect calculations.  
  
⸻  
  
**BUSINESS RULE 075**  
  
**Business Rule Compliance**  
  
Every future feature, integration, dashboard, report, AI module, workflow and calculation implemented in this platform must fully comply with every Business Rule defined in this document.  
  
Business Rules are permanent unless explicitly revised through repository version updates.  
Business Rules are permanent unless explicitly revised through repository version updates.  
  
No implementation may bypass these rules.  
No implementation may bypass these rules.  
  
⸻  
  
**END OF FILE**  
  
002_BUSINESS_RULES.md  
002_BUSINESS_RULES.md  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
  
