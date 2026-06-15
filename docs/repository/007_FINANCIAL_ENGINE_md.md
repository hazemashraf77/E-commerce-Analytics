**007_FINANCIAL_ENGINE.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 9 / Repository  
  
Depends On:  
  
* 000_CLAUDE_MASTER_INSTRUCTIONS.md  
* 000A_PROJECT_DECISION_PRINCIPLES.md  
* 001_PROJECT_CONSTITUTION.md  
* 002_BUSINESS_RULES.md  
* 003_DATA_DICTIONARY.md  
* 004_CANONICAL_DATA_MODEL.md  
* 005_SOURCE_OF_TRUTH_MATRIX.md  
* 006_DATABASE_SPECIFICATION.md  
  
⸻  
  
**PURPOSE**  
  
The Financial Engine is the authoritative subsystem responsible for every financial calculation performed by the platform.  
  
No dashboard, API adapter, database query, AI module or report may calculate financial values independently.  
  
Every financial number displayed anywhere in the application originates from the Financial Engine.  
  
⸻  
  
**FINANCIAL ENGINE OBJECTIVES**  
  
The Financial Engine shall provide:  
  
* Financial Accuracy  
* Historical Accuracy  
* Explainability  
* Auditability  
* Deterministic Calculations  
* Formula Transparency  
* Reproducible Results  
  
Financial correctness always overrides implementation simplicity.  
  
⸻  
  
**GENERAL PRINCIPLES**  
  
The Financial Engine shall:  
  
* Never guess values.  
* Never estimate missing financial data.  
* Never overwrite historical calculations.  
* Never modify historical business events.  
* Never bypass Business Rules.  
* Never bypass Formula Engine.  
* Never consume raw API payloads.  
  
The Financial Engine consumes only Canonical Data Models.  
  
⸻  
  
**FINANCIAL CALCULATION PIPELINE**  
  
Business Events  
  
↓  
  
Canonical Models  
  
↓  
  
Financial Engine  
  
↓  
  
Formula Engine  
  
↓  
  
Analytics Engine  
  
↓  
  
Dashboard  
  
No component may bypass this sequence.  
  
⸻  
  
**FINANCIAL EVENT TYPES**  
  
The Financial Engine recognizes the following event categories:  
  
Revenue Events  
  
Cost Events  
  
Inventory Cost Events  
  
Shipping Events  
  
Marketing Events  
  
Settlement Events  
  
Cash Events  
  
Refund Events  
  
Exchange Events  
  
Manual Adjustment Events  
  
Each event type has independent business rules.  
  
⸻  
  
**REVENUE RECOGNITION**  
  
Revenue becomes realized ONLY when:  
  
Shipment Status  
  
=  
  
Delivered  
  
No other shipment status generates realized revenue.  
  
Forecast modules may calculate Expected Revenue separately.  
  
Expected Revenue is never mixed with Realized Revenue.  
  
⸻  
  
**REVENUE COMPONENTS**  
  
Revenue consists of:  
  
Product Revenue  
  
Customer Shipping Fee  
  
Customer Shipping Fee remains an independent financial component.  
  
The Financial Engine must preserve both values separately.  
  
⸻  
  
**SHIPPING SUBSIDY**  
  
Shipping Subsidy is calculated as:  
  
Actual Shipping Cost  
  
minus  
  
Customer Shipping Fee  
  
Possible results:  
  
Positive  
  
Zero  
  
Negative (future compatibility)  
  
Shipping Subsidy must always remain visible.  
  
Shipping Subsidy participates in Net Profit calculations.  
  
⸻  
  
**COST OF GOODS SOLD (COGS)**  
  
COGS is calculated using FIFO exclusively.  
  
Formula Inputs:  
  
Delivered Order Items  
  
↓  
  
FIFO Engine  
  
↓  
  
Inventory Layers  
  
↓  
  
Unit Cost  
  
↓  
  
COGS  
  
No alternative inventory valuation method is permitted.  
  
⸻  
  
**GROSS PROFIT**  
  
Gross Profit is calculated as:  
  
Revenue  
  
minus  
  
COGS  
  
Gross Profit excludes:  
  
Marketing  
  
Shipping  
  
Fixed Expenses  
  
Variable Expenses  
  
Manual Adjustments  
  
Gross Profit is an intermediate metric.  
  
⸻  
  
**OPERATING EXPENSES**  
  
Operating Expenses include:  
  
Shipping Expense  
  
Marketing Expense  
  
Packaging  
  
Payment Fees  
  
Variable Expenses  
  
Fixed Expenses  
  
Only documented expense categories participate.  
  
⸻  
  
**NET PROFIT**  
  
Net Profit represents final profitability.  
  
Net Profit includes:  
  
Revenue  
  
minus  
  
COGS  
  
minus  
  
Shipping Expense  
  
minus  
  
Marketing Expense  
  
minus  
  
Variable Expenses  
  
minus  
  
Fixed Expenses  
  
plus/minus  
  
Financial Adjustments  
  
The exact formula shall always be exposed through Formula Inspector.  
  
⸻  
  
**PROJECTED PROFIT**  
  
Projected Profit estimates expected profitability before delivery.  
  
Projected Profit shall:  
  
Use expected business events.  
  
Remain visually distinct.  
  
Never appear inside realized financial statements.  
  
Projected Profit supports forecasting only.  
  
⸻  
  
**CASH FLOW**  
  
Cash Flow is calculated independently.  
  
Cash Flow tracks:  
  
Cash In  
  
Cash Out  
  
Cash Balance  
  
Cash Flow never equals Profit.  
  
Profit never equals Cash Flow.  
  
Both metrics remain permanently separated.  
  
⸻  
  
**CASH IN SOURCES**  
  
Examples include:  
  
Bosta Settlement  
  
External Payment  
  
InstaPay  
  
Manual Deposit  
  
Cash In represents actual money received.  
  
Forecasted receipts are excluded.  
  
⸻  
  
**CASH OUT SOURCES**  
  
Examples include:  
  
Inventory Purchase  
  
Marketing Spend  
  
Shipping Cost  
  
Refund  
  
Compensation  
  
Software Subscription  
  
Salary  
  
Rent  
  
Cash Out represents actual money leaving the business.  
  
⸻  
  
## END OF PART 1  
  
**\**  
  
  
**CONTINUATION OF 007_FINANCIAL_ENGINE.md**  
  
⸻  
  
**EXPENSE CLASSIFICATION**  
  
The Financial Engine shall classify every expense into one of the following categories:  
  
* Cost of Goods Sold (COGS)  
* Shipping Expense  
* Marketing Expense  
* Variable Expense  
* Fixed Expense  
* Financial Adjustment  
* Refund  
* Compensation  
* Miscellaneous Expense  
  
Each expense belongs to exactly one category.  
  
Expense categories are mutually exclusive.  
  
⸻  
  
**FIXED EXPENSES**  
  
Fixed Expenses are business costs that do not depend on order volume.  
  
Examples include:  
  
* Salaries  
* Office Rent  
* Warehouse Rent  
* Internet  
* Software Subscriptions  
* Utilities  
* Accounting Services  
  
Fixed Expenses shall always be entered manually.  
  
Recurring fixed expenses should support automatic recurrence in future versions.  
  
⸻  
  
**VARIABLE EXPENSES**  
  
Variable Expenses depend on business activity.  
  
Examples include:  
  
* Packaging  
* Shipping  
* Payment Gateway Fees  
* Marketing  
* Delivery Support Costs  
  
Variable Expenses contribute directly to profitability calculations.  
  
⸻  
  
**MARKETING EXPENSES**  
  
Marketing Expenses originate exclusively from supported advertising platforms.  
  
Current supported platforms:  
  
* Meta Ads  
* TikTok Ads  
  
Future providers shall integrate through Adapters.  
  
Marketing Expenses are imported.  
  
Marketing Expenses are never estimated.  
  
Marketing Expenses are never manually calculated.  
  
⸻  
  
**TRUE CPA**  
  
True CPA represents the real acquisition cost required to generate one delivered order.  
  
True CPA is calculated only by the Financial Engine.  
  
Advertising Platform CPA and Business True CPA are completely different metrics.  
  
True CPA calculations may include:  
  
* Marketing Spend  
* Shipping Subsidy  
* Refund Impact  
* Compensation Impact  
* Variable Expenses  
  
Formula definitions remain centralized inside the Formula Engine.  
  
⸻  
  
**SHIPPING EXPENSE**  
  
Shipping Expense originates from Bosta.  
  
Shipping Expense always uses:  
  
Actual Shipping Cost  
  
Never use:  
  
Customer Shipping Fee  
  
Never estimate shipping costs.  
  
Shipping Expense applies per order.  
  
Not per product.  
  
⸻  
  
**REFUNDS**  
  
Refunds create financial adjustment events.  
  
Refunds never modify historical revenue.  
  
Instead:  
  
Revenue History  
  
↓  
  
Refund Event  
  
↓  
  
Adjusted Financial Result  
  
Historical auditability must always remain intact.  
  
⸻  
  
**COMPENSATIONS**  
  
Compensations reduce profitability.  
  
Compensations remain independent from Refunds.  
  
Compensations must always identify:  
  
* Reason  
* Related Order  
* Amount  
* User  
* Timestamp  
  
Compensations remain permanently visible.  
  
⸻  
  
**EXCHANGES**  
  
An Exchange does not replace the original order.  
  
Instead:  
  
Original Order  
  
↓  
  
Exchange Event  
  
↓  
  
Inventory Movement  
  
↓  
  
Financial Adjustment  
  
↓  
  
Profit Recalculation  
  
Exchange history remains permanently linked to the original order.  
  
⸻  
  
**FINANCIAL ADJUSTMENTS**  
  
Financial Adjustments include:  
  
* Refunds  
* Compensations  
* Accounting Corrections  
* External Payments  
* Manual Corrections  
  
Every adjustment requires:  
  
* Reason  
* User  
* Timestamp  
* Related Entity  
* Financial Impact  
  
Financial Adjustments are immutable.  
  
⸻  
  
**SETTLEMENT PROCESSING**  
  
Settlement processing consists of:  
  
Import Settlement  
  
↓  
  
Validate  
  
↓  
  
Normalize  
  
↓  
  
Reconcile  
  
↓  
  
Cash Flow Update  
  
↓  
  
Reporting  
  
Every settlement must be reconciled.  
  
Every difference must be explainable.  
  
⸻  
  
**SETTLEMENT RECONCILIATION**  
  
The Financial Engine shall compare:  
  
Expected Settlement  
  
vs  
  
Actual Settlement  
  
Differences should identify:  
  
* Shipping Charges  
* Return Charges  
* Exchange Charges  
* Additional Fees  
* Deductions  
* Adjustments  
  
Every reconciliation difference shall remain visible.  
  
⸻  
  
**CASH BALANCE**  
  
Cash Balance is calculated as:  
  
Previous Balance  
  
Cash In  
  
Cash Out  
  
Cash Balance is never manually entered.  
  
Cash Balance is always calculated.  
  
⸻  
  
**FINANCIAL PERIODS**  
  
Every financial event belongs to one financial period.  
  
Supported reporting periods include:  
  
* Daily  
* Weekly  
* Monthly  
* Quarterly  
* Yearly  
* Custom Range  
  
Historical financial periods remain reproducible.  
  
⸻  
  
**RECOGNITION TIMESTAMP**  
  
Every financial event shall preserve:  
  
Business Event Timestamp  
  
Recognition Timestamp  
  
Import Timestamp  
  
These timestamps represent different concepts.  
  
None of them may replace another.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
  
**CONTINUATION OF 007_FINANCIAL_ENGINE.md**  
  
⸻  
  
**HISTORICAL FINANCIAL ACCURACY**  
  
Historical financial calculations must remain permanent.  
  
Future inventory purchases must never modify historical COGS.  
  
Future formula changes must never modify historical reports.  
  
Future configuration changes must never modify historical profitability.  
  
Historical reports always represent historical business reality.  
  
⸻  
  
**FORMULA VERSIONING**  
  
Every financial formula shall have:  
  
* Formula ID  
* Version Number  
* Effective Date  
* Retirement Date (Optional)  
  
Historical calculations shall always reference the version active when the financial event occurred.  
  
Formula versioning guarantees report reproducibility.  
  
⸻  
  
**FINANCIAL SNAPSHOTS**  
  
The Financial Engine shall generate immutable financial snapshots.  
  
Suggested frequency:  
  
Daily  
  
Snapshots should preserve:  
  
* Revenue  
* Gross Profit  
* Net Profit  
* Cash Balance  
* COGS  
* Shipping Expense  
* Marketing Expense  
* Fixed Expenses  
* Variable Expenses  
* Shipping Subsidy  
  
Snapshots support:  
  
* Historical Analysis  
* Trend Analysis  
* Forecasting  
* AI  
  
⸻  
  
**PROFIT BY PRODUCT**  
  
The Financial Engine shall calculate profitability for every Canonical Product.  
  
Metrics include:  
  
* Revenue  
* Units Sold  
* FIFO Cost  
* Gross Profit  
* Net Profit  
* Shipping Subsidy  
* Marketing Attribution  
* True CPA  
* Profit Margin  
  
Product profitability is one of the primary business outputs.  
  
⸻  
  
**PROFIT BY ORDER**  
  
Every imported order shall have an independent profitability calculation.  
  
Order Profit includes:  
  
* Product Revenue  
* Customer Shipping Fee  
* FIFO Cost  
* Actual Shipping Cost  
* Marketing Attribution  
* Manual Adjustments  
* Refund Impact  
* Exchange Impact  
  
Order profitability shall support complete Formula Inspection.  
  
⸻  
  
**PROFIT BY STORE**  
  
The Financial Engine shall aggregate profitability by Store.  
  
Metrics include:  
  
* Revenue  
* Gross Profit  
* Net Profit  
* Orders  
* Delivered Orders  
* Marketing Spend  
* Cash Flow  
  
Multi-store reporting must require no formula changes.  
  
⸻  
  
**PROFIT BY GOVERNORATE**  
  
Shipping destination shall support profitability analysis.  
  
Metrics include:  
  
* Revenue  
* Orders  
* Delivery Rate  
* Return Rate  
* Shipping Cost  
* Shipping Subsidy  
* Net Profit  
  
This enables identifying unprofitable delivery regions.  
  
⸻  
  
**PROFIT BY MARKETING SOURCE**  
  
Profitability shall be measurable by acquisition source.  
  
Examples:  
  
* Meta  
* TikTok  
* Organic  
* Direct  
  
Every source should expose:  
  
* Orders  
* Delivered Orders  
* Revenue  
* Marketing Spend  
* True CPA  
* Net Profit  
  
⸻  
  
**PROJECTED CASH FLOW**  
  
Projected Cash Flow shall estimate future liquidity.  
  
Inputs may include:  
  
* Expected Settlements  
* Outstanding Delivered Orders  
* Forecasted Expenses  
* Scheduled Fixed Expenses  
  
Projected Cash Flow remains predictive.  
  
It never replaces actual Cash Flow.  
  
⸻  
  
**PENDING LIABILITIES**  
  
The Financial Engine shall calculate pending liabilities.  
  
Examples include:  
  
* Outstanding Refunds  
* Pending Compensations  
* Future Fixed Expenses  
* Scheduled Payments  
  
Pending Liabilities support cash planning.  
  
⸻  
  
**FINANCIAL HEALTH SCORE**  
  
The platform shall calculate a Financial Health Score.  
  
The score should consider:  
  
* Profitability  
* Cash Position  
* Delivery Rate  
* Return Rate  
* Shipping Subsidy  
* Marketing Efficiency  
* Inventory Turnover  
  
The scoring methodology shall be documented inside the Formula Engine.  
  
⸻  
  
**NEGATIVE PROFIT DETECTION**  
  
The Financial Engine shall automatically identify:  
  
* Loss Making Orders  
* Loss Making Products  
* Loss Making Campaigns  
* Loss Making Governorates  
  
Every detected loss shall expose:  
  
* Cause  
* Financial Impact  
* Supporting Formula  
* Suggested Investigation  
  
⸻  
  
**OUTLIER DETECTION**  
  
Financial outliers should be detected.  
  
Examples:  
  
* Extremely high shipping cost  
* Unusual refund value  
* Abnormal profit margin  
* Duplicate adjustments  
* Unexpected settlement deduction  
  
Outliers should trigger alerts.  
  
Outliers never modify calculations.  
  
⸻  
  
**ROUNDING POLICY**  
  
Financial calculations shall use consistent rounding rules.  
  
Internal calculations should preserve maximum precision.  
  
Rounding shall occur only during presentation unless explicitly required by business rules.  
  
Intermediate calculations should never lose precision unnecessarily.  
  
⸻  
  
**CURRENCY PRECISION**  
  
Monetary values shall maintain fixed decimal precision.  
  
Recommended precision:  
  
Decimal(18,4)  
  
Future multi-currency support shall preserve currency-specific precision where applicable.  
  
⸻  
  
**FINANCIAL VALIDATION**  
  
Before producing financial outputs, the Financial Engine shall validate:  
  
* Required Inputs  
* Business Rules  
* Formula Integrity  
* Inventory Availability  
* Shipment Status  
* Settlement Consistency  
  
Validation failures shall prevent financial publication.  
  
⸻  
  
## END OF PART 3  
  
**\**  
  
  
**CONTINUATION OF 007_FINANCIAL_ENGINE.md**  
  
⸻  
  
**FORMULA INSPECTOR INTEGRATION**  
  
Every financial value produced by the Financial Engine shall support Formula Inspector.  
Every financial value produced by the Financial Engine shall support Formula Inspector.  
  
Formula Inspector must expose:  
  
* Formula Name  
* Formula Version  
* Business Purpose  
* Variables  
* Input Values  
* Source Records  
* Intermediate Calculations  
* Final Result  
* Calculation Timestamp  
  
Financial calculations without Formula Inspector support are considered incomplete.  
  
⸻  
  
**AI INTEGRATION**  
  
The Financial Engine is the only financial authority.  
  
The AI Engine consumes Financial Engine outputs.  
The AI Engine consumes Financial Engine outputs.  
  
AI may:  
AI may:  
  
* Explain  
* Compare  
* Forecast  
* Recommend  
  
AI must never:  
AI must never:  
  
* Recalculate  
* Override  
* Modify  
* Replace  
  
Financial Engine results.  
  
⸻  
  
**DASHBOARD INTEGRATION**  
  
Every dashboard displaying financial information shall consume Financial Engine outputs only.  
  
Dashboards must never perform calculations themselves.  
Dashboards must never perform calculations themselves.  
  
Dashboard responsibilities include:  
Dashboard responsibilities include:  
  
* Display  
* Filtering  
* Drill Down  
* Visualization  
  
Business calculations belong exclusively to the Financial Engine.  
  
⸻  
  
**REPORTING INTEGRATION**  
  
Reports shall consume:  
Reports shall consume:  
  
Financial Engine  
  
↓  
↓  
  
Formula Engine  
Formula Engine  
  
↓  
  
Reporting Engine  
Reporting Engine  
  
Reports must never execute independent financial logic.  
Reports must never execute independent financial logic.  
  
Every report must remain reproducible.  
Every report must remain reproducible.  
  
⸻  
  
**ORDER LOOKUP INTEGRATION**  
  
Order Lookup shall display:  
Order Lookup shall display:  
  
* Revenue  
* Customer Shipping Fee  
* Actual Shipping Cost  
* Shipping Subsidy  
* FIFO Cost  
* Gross Profit  
* Net Profit  
* Marketing Attribution  
* Manual Adjustments  
* Settlement Information  
* Formula Inspector  
  
Order Lookup is an auditing tool.  
Order Lookup is an auditing tool.  
  
Order Lookup is not an operational editing screen.  
Order Lookup is not an operational editing screen.  
  
⸻  
  
**INVENTORY ENGINE INTEGRATION**  
  
The Financial Engine requests inventory valuation only from the Inventory Engine.  
The Financial Engine requests inventory valuation only from the Inventory Engine.  
  
Inputs include:  
Inputs include:  
  
* FIFO Layers  
* Inventory Consumption  
* Physical Returns  
* Inventory Adjustments  
  
Inventory cost calculations are never duplicated.  
  
⸻  
  
**MARKETING ENGINE INTEGRATION**  
  
Marketing attribution originates from the Marketing Engine.  
  
Financial interpretation originates from the Financial Engine.  
Financial interpretation originates from the Financial Engine.  
  
Marketing Engine provides:  
Marketing Engine provides:  
  
* Campaign  
* Platform  
* Spend  
* Source  
  
Financial Engine calculates:  
  
* True CPA  
* Marketing ROI  
* Profitability  
  
Responsibilities remain separated.  
  
⸻  
  
**SETTLEMENT ENGINE INTEGRATION**  
  
Settlement information originates from the Settlement Module.  
Settlement information originates from the Settlement Module.  
  
Financial interpretation belongs to the Financial Engine.  
Financial interpretation belongs to the Financial Engine.  
  
The Financial Engine shall calculate:  
The Financial Engine shall calculate:  
  
* Expected Settlement  
* Actual Settlement  
* Settlement Difference  
* Cash Flow Impact  
  
Settlement history remains immutable.  
  
⸻  
  
**DAILY EXECUTION PIPELINE**  
  
Recommended daily processing sequence:  
Recommended daily processing sequence:  
  
1. Synchronize Orders  
2. Synchronize Shipments  
3. Synchronize Marketing Spend  
4. Synchronize Settlements  
5. Validate Imported Data  
6. Update Inventory  
7. Execute FIFO  
8. Execute Financial Engine  
9. Execute Formula Engine  
10. Refresh KPIs  
11. Generate AI Insights  
12. Update Dashboards  
  
Execution order must remain deterministic.  
Execution order must remain deterministic.  
  
⸻  
  
**FAILURE HANDLING**  
  
If the Financial Engine cannot complete a calculation:  
If the Financial Engine cannot complete a calculation:  
  
The platform shall:  
  
* Stop the affected calculation.  
* Preserve historical results.  
* Log the error.  
* Notify administrators if required.  
* Continue unaffected calculations whenever possible.  
  
Financial inconsistency is unacceptable.  
Financial inconsistency is unacceptable.  
  
⸻  
  
**AUDIT REQUIREMENTS**  
  
Every financial calculation must be auditable.  
Every financial calculation must be auditable.  
  
Audit information shall include:  
Audit information shall include:  
  
* Formula Version  
* Input Records  
* Output  
* Timestamp  
* User (when applicable)  
* Business Event References  
  
Historical audit data shall never be deleted.  
  
⸻  
  
**PERFORMANCE REQUIREMENTS**  
  
The Financial Engine shall support efficient processing for:  
The Financial Engine shall support efficient processing for:  
  
* Hundreds of thousands of orders  
* Large inventory histories  
* Multiple stores  
* Multiple years of historical data  
  
Performance optimizations must never change financial correctness.  
Performance optimizations must never change financial correctness.  
  
⸻  
  
**EXTENSIBILITY**  
  
The Financial Engine shall support future additions without redesign.  
  
Examples include:  
  
* Multiple Currencies  
* Multiple Shipping Providers  
* Multiple Advertising Platforms  
* Additional Financial Metrics  
* Additional Tax Modules  
* Additional Payment Providers  
  
Future expansion must preserve existing financial history.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The Financial Engine is considered complete only if:  
  
* Revenue Recognition follows Business Rules.  
* FIFO is correctly applied.  
* Shipping Subsidy is correctly calculated.  
* Gross Profit is reproducible.  
* Net Profit is reproducible.  
* Cash Flow is independent from Profit.  
* Every formula supports Formula Inspector.  
* Every financial value is auditable.  
* Historical reports remain immutable.  
* AI consumes financial outputs without modifying them.  
* Dashboards never calculate financial logic.  
* Reports remain deterministic.  
  
The Financial Engine is the financial heart of the platform.  
The Financial Engine is the financial heart of the platform.  
  
No component may bypass it.  
  
⸻  
  
**END OF FILE**  
  
007_FINANCIAL_ENGINE.md  
007_FINANCIAL_ENGINE.md  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
