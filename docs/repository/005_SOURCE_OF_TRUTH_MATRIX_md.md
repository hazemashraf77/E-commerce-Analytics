**005_SOURCE_OF_TRUTH_MATRIX.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 7 / Repository  
  
Depends On:  
  
* 000_CLAUDE_MASTER_INSTRUCTIONS.md  
* 000A_PROJECT_DECISION_PRINCIPLES.md  
* 001_PROJECT_CONSTITUTION.md  
* 002_BUSINESS_RULES.md  
* 003_DATA_DICTIONARY.md  
* 004_CANONICAL_DATA_MODEL.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the official Source of Truth (SoT) for every business entity, calculation, KPI, financial value, inventory value, operational status and analytical dataset used throughout the platform.  
  
Every module must obtain data only from its documented Source of Truth.  
  
No business entity may have multiple authoritative sources.  
  
⸻  
  
**GENERAL PRINCIPLES**  
  
Every business entity shall satisfy the following rules:  
  
* One authoritative source.  
* One business owner.  
* One canonical definition.  
* One calculation engine.  
* One storage location.  
  
Whenever multiple systems provide similar information, only one system is considered authoritative.  
  
⸻  
  
**SOURCE OF TRUTH HIERARCHY**  
  
Priority Order  
  
1. Business Rules  
2. Canonical Data Model  
3. Source of Truth Matrix  
4. Business Engines  
5. Dashboard  
6. AI  
  
AI never becomes a Source of Truth.  
  
Dashboards never become a Source of Truth.  
  
Reports never become a Source of Truth.  
  
⸻  
  
**SECTION 1**  
  
**STORE DATA**  
  
Business Entity  
  
Store  
  
Authoritative Source  
  
Local Database  
  
Original Source  
  
System Configuration  
  
Business Owner  
  
Store Module  
  
Consumed By  
  
* Orders  
* Products  
* Inventory  
* Finance  
* Reports  
* AI  
  
⸻  
  
**SECTION 2**  
  
**PRODUCT DATA**  
  
Business Entity  
  
Canonical Product  
  
Authoritative Source  
  
Product Module  
  
Original Source  
  
Internal Configuration  
  
Business Owner  
  
Product Module  
  
Consumed By  
  
* Orders  
* Inventory  
* Finance  
* Marketing  
* AI  
  
⸻  
  
**SECTION 3**  
  
**PRODUCT ALIASES**  
  
Business Entity  
  
Product Alias  
  
Authoritative Source  
  
Product Alias Module  
  
Original Source  
  
Manual Mapping  
  
Business Owner  
  
Product Module  
  
Consumed By  
  
Marketing Attribution  
  
Only.  
  
Aliases never affect inventory.  
  
Aliases never affect FIFO.  
  
⸻  
  
**SECTION 4**  
  
**ORDERS**  
  
Business Entity  
  
Orders  
  
Original Source  
  
Eazy Order  
  
Authoritative Source Inside Platform  
  
Order Module  
  
Consumed By  
  
* Finance  
* Inventory  
* Marketing  
* Forecasting  
* AI  
* Reports  
  
Orders are imported.  
  
Orders are never manually created.  
  
⸻  
  
**SECTION 5**  
  
**ORDER ITEMS**  
  
Business Entity  
  
Order Items  
  
Original Source  
  
Eazy Order  
  
Authoritative Source  
  
Order Module  
  
Consumed By  
  
* FIFO  
* Profit  
* Inventory  
* Formula Engine  
  
⸻  
  
**SECTION 6**  
  
**SHIPMENTS**  
  
Business Entity  
  
Shipment  
  
Original Source  
  
Bosta  
  
Authoritative Source  
  
Shipping Module  
  
Consumed By  
  
* Financial Engine  
* Dashboard  
* Forecasting  
* AI  
  
Shipment information is never edited manually.  
  
⸻  
  
**SECTION 7**  
  
**SHIPMENT STATUS**  
  
Business Entity  
  
Shipment Status  
  
Original Source  
  
Bosta  
  
Authoritative Source  
  
Shipping Module  
  
Business Meaning  
  
Operational Status  
  
Shipment Status becomes financial meaning only after interpretation by the Financial Engine.  
  
⸻  
  
**SECTION 8**  
  
**ACTUAL SHIPPING COST**  
  
Business Entity  
  
Actual Shipping Cost  
  
Original Source  
  
Bosta  
  
Authoritative Source  
  
Financial Engine  
  
Raw Value  
  
Imported from Bosta  
  
Business Interpretation  
  
Financial Engine  
  
Never calculate shipping cost manually.  
  
Never estimate shipping cost.  
  
⸻  
  
**SECTION 9**  
  
**CUSTOMER SHIPPING FEE**  
  
Business Entity  
  
Customer Shipping Fee  
  
Original Source  
  
Eazy Order  
  
Authoritative Source  
  
Order Module  
  
Business Meaning  
  
Revenue Component  
  
Customer Shipping Fee is independent from Actual Shipping Cost.  
  
⸻  
  
**SECTION 10**  
  
**SHIPPING SUBSIDY**  
  
Business Entity  
  
Shipping Subsidy  
  
Authoritative Source  
  
Financial Engine  
  
Original Inputs  
  
Customer Shipping Fee  
  
Actual Shipping Cost  
  
Formula  
  
Actual Shipping Cost  
  
Customer Shipping Fee  
  
Shipping Subsidy is always calculated.  
  
It is never imported.  
  
⸻  
  
**SECTION 11**  
  
**INVENTORY**  
  
Business Entity  
  
Inventory Quantity  
  
Authoritative Source  
  
Inventory Engine  
  
Original Inputs  
  
Inventory Purchases  
  
Physical Returns  
  
FIFO Consumption  
  
Inventory is never imported from external APIs.  
  
Inventory belongs entirely to the platform.  
  
⸻  
  
**SECTION 12**  
  
**INVENTORY COST**  
  
Business Entity  
  
Inventory Cost  
  
Authoritative Source  
  
Inventory Engine  
  
Calculation  
  
FIFO  
  
Inventory valuation is always internal.  
  
External systems never determine inventory cost.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 005_SOURCE_OF_TRUTH_MATRIX.md**  
  
⸻  
  
**SECTION 13**  
  
**INVENTORY LAYERS**  
  
Business Entity  
  
Inventory Layers  
  
Authoritative Source  
  
Inventory Engine  
  
Original Source  
  
Inventory Purchase Transactions  
  
Business Owner  
  
Inventory Engine  
  
Consumed By  
  
* FIFO Engine  
* Financial Engine  
* Inventory Valuation  
* Formula Engine  
  
Inventory Layers must never be modified after creation.  
  
Only Remaining Quantity changes through consumption.  
  
⸻  
  
**SECTION 14**  
  
**INVENTORY MOVEMENTS**  
  
Business Entity  
  
Inventory Movement  
  
Authoritative Source  
  
Inventory Engine  
  
Generated By  
  
* Purchase  
* Sale  
* Physical Return  
* Exchange  
* Manual Adjustment  
  
Inventory Movement History is immutable.  
  
Every movement must be traceable.  
  
⸻  
  
**SECTION 15**  
  
**REVENUE**  
  
Business Entity  
  
Revenue  
  
Authoritative Source  
  
Financial Engine  
  
Original Inputs  
  
* Delivered Orders  
* Customer Product Revenue  
* Customer Shipping Fee  
  
Revenue is never imported.  
  
Revenue is always calculated.  
  
⸻  
  
**SECTION 16**  
  
**COST OF GOODS SOLD (COGS)**  
  
Business Entity  
  
COGS  
  
Authoritative Source  
  
Financial Engine  
  
Original Source  
  
Inventory Engine  
  
Calculation Method  
  
FIFO  
  
COGS shall never be imported from external systems.  
  
⸻  
  
**SECTION 17**  
  
**GROSS PROFIT**  
  
Business Entity  
  
Gross Profit  
  
Authoritative Source  
  
Financial Engine  
  
Original Inputs  
  
Revenue  
  
COGS  
  
Gross Profit exists only after calculation.  
  
⸻  
  
**SECTION 18**  
  
**NET PROFIT**  
  
Business Entity  
  
Net Profit  
  
Authoritative Source  
  
Financial Engine  
  
Original Inputs  
  
* Revenue  
* COGS  
* Shipping Cost  
* Marketing Cost  
* Fixed Expenses  
* Variable Expenses  
* Financial Adjustments  
  
Net Profit is never stored manually.  
  
⸻  
  
**SECTION 19**  
  
**CASH FLOW**  
  
Business Entity  
  
Cash Flow  
  
Authoritative Source  
  
Financial Engine  
  
Original Inputs  
  
* Settlements  
* External Payments  
* Inventory Purchases  
* Expenses  
* Refunds  
  
Cash Flow never depends on projected values.  
  
⸻  
  
**SECTION 20**  
  
**MARKETING SPEND**  
  
Business Entity  
  
Marketing Spend  
  
Original Source  
  
Meta Ads  
  
TikTok Ads  
  
Authoritative Source  
  
Marketing Module  
  
Business Owner  
  
Marketing Engine  
  
Marketing Spend is imported.  
  
Never estimated.  
  
⸻  
  
**SECTION 21**  
  
**TRUE CPA**  
  
Business Entity  
  
True CPA  
  
Authoritative Source  
  
Financial Engine  
  
Original Inputs  
  
* Marketing Spend  
* Delivered Orders  
* Business Expenses  
  
True CPA is calculated.  
  
Never imported.  
  
⸻  
  
**SECTION 22**  
  
**DELIVERY RATE**  
  
Business Entity  
  
Delivery Rate  
  
Authoritative Source  
  
Analytics Engine  
  
Original Inputs  
  
Orders  
  
Shipment Status  
  
Formula  
  
Defined by Formula Engine.  
  
⸻  
  
**SECTION 23**  
  
**RETURN RATE**  
  
Business Entity  
  
Return Rate  
  
Authoritative Source  
  
Analytics Engine  
  
Original Inputs  
  
Shipment Events  
  
Business Rules  
  
Return definitions originate from Business Rules.  
  
Calculation belongs to Formula Engine.  
  
⸻  
  
**SECTION 24**  
  
**REFUSAL RATE**  
  
Business Entity  
  
Refusal Rate  
  
Authoritative Source  
  
Analytics Engine  
  
Original Inputs  
  
Shipment Status  
  
Business Rules  
  
Refusal definitions remain centralized.  
  
⸻  
  
**SECTION 25**  
  
**SETTLEMENTS**  
  
Business Entity  
  
Settlement  
  
Original Source  
  
Bosta  
  
Authoritative Source  
  
Settlement Module  
  
Consumed By  
  
* Financial Engine  
* Cash Flow  
* Reports  
* Dashboard  
  
Settlement reconciliation belongs exclusively to the Financial Engine.  
  
⸻  
  
**SECTION 26**  
  
**FINANCIAL ADJUSTMENTS**  
  
Business Entity  
  
Financial Adjustment  
  
Original Source  
  
Manual Entry  
  
Authoritative Source  
  
Finance Module  
  
Examples  
  
* Refund  
* Compensation  
* Accounting Adjustment  
* External Payment  
  
Every adjustment requires audit history.  
  
⸻  
  
**SECTION 27**  
  
**FORMULAS**  
  
Business Entity  
  
Business Formula  
  
Authoritative Source  
  
Formula Engine  
  
Original Source  
  
Repository Documentation  
  
Business formulas never originate from AI.  
  
Business formulas never originate from APIs.  
  
Business formulas originate only from approved documentation.  
  
⸻  
  
**SECTION 28**  
  
**FORMULA INSPECTOR**  
  
Business Entity  
  
Formula Inspector  
  
Authoritative Source  
  
Formula Engine  
  
Generated From  
  
Business Formulas  
  
Source Records  
  
Calculation Results  
  
Formula Inspector is generated dynamically.  
  
It is never edited manually.  
  
⸻  
  
**SECTION 29**  
  
**KPIs**  
  
Business Entity  
  
Key Performance Indicators  
  
Authoritative Source  
  
Analytics Engine  
  
Original Inputs  
  
Business Engines  
  
Formula Engine  
  
Every KPI uses one documented formula only.  
  
⸻  
  
**SECTION 30**  
  
**AI RECOMMENDATIONS**  
  
Business Entity  
  
AI Recommendation  
  
Authoritative Source  
  
AI Engine  
  
Original Inputs  
  
Business KPIs  
  
Business Events  
  
Formula Results  
  
AI Recommendations never become Sources of Truth.  
  
They consume Sources of Truth.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
  
**CONTINUATION OF 005_SOURCE_OF_TRUTH_MATRIX.md**  
  
⸻  
  
**SECTION 31**  
  
**DAILY SNAPSHOTS**  
  
Business Entity  
Business Entity  
  
Daily Snapshot  
  
Authoritative Source  
Authoritative Source  
  
Analytics Engine  
  
Generated From  
Generated From  
  
* Financial Engine  
* Inventory Engine  
* Marketing Engine  
* Formula Engine  
  
Snapshots are generated by the platform.  
  
Snapshots are never imported.  
Snapshots are never imported.  
  
Snapshots are immutable.  
Snapshots are immutable.  
  
⸻  
  
**SECTION 32**  
  
**FORECASTS**  
  
Business Entity  
  
Forecast  
Forecast  
  
Authoritative Source  
Authoritative Source  
  
Forecast Engine  
Forecast Engine  
  
Original Inputs  
Original Inputs  
  
* Historical Orders  
* Delivery Rate  
* Return Rate  
* Marketing Performance  
* Inventory  
* Financial Trends  
  
Forecasts are predictive.  
Forecasts are predictive.  
  
Forecasts never modify realized business data.  
  
⸻  
  
**SECTION 33**  
  
**SCENARIO SIMULATIONS**  
  
Business Entity  
  
Scenario Simulation  
  
Authoritative Source  
Authoritative Source  
  
Simulation Engine  
Simulation Engine  
  
Generated From  
Generated From  
  
Business Rules  
Business Rules  
  
Formula Engine  
Formula Engine  
  
Historical Data  
Historical Data  
  
Simulation results remain isolated.  
  
Simulation results never become production records.  
Simulation results never become production records.  
  
⸻  
  
**SECTION 34**  
  
**DASHBOARDS**  
  
Business Entity  
Business Entity  
  
Dashboard Widgets  
  
Authoritative Source  
Authoritative Source  
  
Analytics Engine  
  
Original Inputs  
Original Inputs  
  
Business KPIs  
  
Dashboards never calculate business logic.  
  
Dashboards only visualize approved business metrics.  
  
⸻  
  
**SECTION 35**  
  
**REPORTS**  
  
Business Entity  
Business Entity  
  
Reports  
Reports  
  
Authoritative Source  
  
Reporting Engine  
  
Generated From  
Generated From  
  
* Financial Engine  
* Analytics Engine  
* Inventory Engine  
* Formula Engine  
  
Reports are generated.  
Reports are generated.  
  
Reports are never manually edited.  
  
⸻  
  
**SECTION 36**  
  
**EXECUTIVE KPIs**  
  
Business Entity  
Business Entity  
  
Executive KPIs  
Executive KPIs  
  
Authoritative Source  
Authoritative Source  
  
Analytics Engine  
  
Generated From  
  
Approved KPI Definitions  
Approved KPI Definitions  
  
Executive KPIs shall remain consistent across every dashboard.  
Executive KPIs shall remain consistent across every dashboard.  
  
⸻  
  
**SECTION 37**  
  
**ORDER LOOKUP**  
  
Business Entity  
  
Order Lookup  
Order Lookup  
  
Authoritative Source  
Authoritative Source  
  
Order Module  
  
Supporting Sources  
Supporting Sources  
  
* Financial Engine  
* Inventory Engine  
* Shipment Module  
* Marketing Module  
* Formula Engine  
  
Order Lookup aggregates information.  
  
Order Lookup owns nothing.  
Order Lookup owns nothing.  
  
⸻  
  
**SECTION 38**  
  
**AUDIT RECORDS**  
  
Business Entity  
  
Audit Records  
Audit Records  
  
Authoritative Source  
  
Audit Engine  
Audit Engine  
  
Generated From  
Generated From  
  
Every Critical Business Event  
Every Critical Business Event  
  
Audit Records are immutable.  
Audit Records are immutable.  
  
Audit Records are permanent.  
Audit Records are permanent.  
  
Audit Records are never deleted.  
Audit Records are never deleted.  
  
⸻  
  
**SECTION 39**  
  
**SYSTEM CONFIGURATION**  
  
Business Entity  
  
Configuration  
Configuration  
  
Authoritative Source  
  
Settings Module  
Settings Module  
  
Examples  
  
* Business Settings  
* Localization  
* API Credentials  
* Synchronization Settings  
* User Preferences  
  
Configuration must never contain business logic.  
Configuration must never contain business logic.  
  
⸻  
  
**SECTION 40**  
  
**API CREDENTIALS**  
  
Business Entity  
  
API Credentials  
API Credentials  
  
Authoritative Source  
Authoritative Source  
  
Secure Configuration  
  
Credentials include:  
Credentials include:  
  
* API Keys  
* Access Tokens  
* Refresh Tokens  
* Webhook Secrets  
  
Credentials are never exposed to dashboards.  
Credentials are never exposed to dashboards.  
  
Credentials are never stored inside business tables.  
  
⸻  
  
**SECTION 41**  
  
**SYNCHRONIZATION STATUS**  
  
Business Entity  
  
Synchronization Status  
Synchronization Status  
  
Authoritative Source  
Authoritative Source  
  
Synchronization Engine  
  
Tracks  
Tracks  
  
* Last Successful Sync  
* Failed Sync  
* Running Sync  
* Queue Status  
* Retry Count  
  
Synchronization status supports monitoring only.  
Synchronization status supports monitoring only.  
  
⸻  
  
**SECTION 42**  
  
**SYSTEM HEALTH**  
  
Business Entity  
  
Health Status  
Health Status  
  
Authoritative Source  
Authoritative Source  
  
Monitoring Engine  
Monitoring Engine  
  
Categories  
Categories  
  
* API Health  
* Database Health  
* Queue Health  
* Background Jobs  
* AI Services  
* Synchronization  
  
Health Status never affects business calculations.  
Health Status never affects business calculations.  
  
⸻  
  
**SECTION 43**  
  
**LOCALIZATION**  
  
Business Entity  
Business Entity  
  
Localization Resources  
  
Authoritative Source  
Authoritative Source  
  
Localization Module  
Localization Module  
  
Supported Languages  
Supported Languages  
  
* English  
* Arabic  
  
Localization affects presentation only.  
Localization affects presentation only.  
  
Localization never affects stored data.  
Localization never affects stored data.  
  
⸻  
  
**SECTION 44**  
  
**USER PERMISSIONS**  
  
Business Entity  
Business Entity  
  
Roles & Permissions  
Roles & Permissions  
  
Authoritative Source  
Authoritative Source  
  
Authorization Module  
Authorization Module  
  
Authorization controls access.  
Authorization controls access.  
  
Authorization never changes business logic.  
Authorization never changes business logic.  
  
Business calculations remain identical regardless of user role.  
Business calculations remain identical regardless of user role.  
  
⸻  
  
**SECTION 45**  
  
**BUSINESS RULES**  
  
Business Entity  
  
Business Rules  
Business Rules  
  
Authoritative Source  
Authoritative Source  
  
Repository Documentation  
Repository Documentation  
  
Business Rules are never imported.  
Business Rules are never imported.  
  
Business Rules are never configurable.  
Business Rules are never configurable.  
  
Business Rules are version controlled.  
Business Rules are version controlled.  
  
⸻  
  
**SECTION 46**  
  
**PROJECT DOCUMENTATION**  
  
Business Entity  
  
Repository Documentation  
Repository Documentation  
  
Authoritative Source  
  
Project Repository  
Project Repository  
  
The Repository defines:  
The Repository defines:  
  
* Architecture  
* Business Rules  
* Formulas  
* Data Models  
* API Specifications  
* Testing  
* Acceptance Criteria  
  
Implementation follows Repository Documentation.  
Implementation follows Repository Documentation.  
  
Documentation does not follow implementation.  
  
⸻  
  
**SOURCE OF TRUTH VALIDATION**  
  
Every module shall validate that requested information originates from its documented Source of Truth.  
  
If conflicting values are received from multiple sources:  
If conflicting values are received from multiple sources:  
  
The documented Source of Truth always wins.  
  
Conflicting data should be:  
Conflicting data should be:  
  
* Logged  
* Flagged  
* Preserved for investigation  
  
Business calculations shall never use conflicting values.  
Business calculations shall never use conflicting values.  
  
⸻  
  
**SOURCE OF TRUTH CHANGE POLICY**  
  
Changing the Source of Truth for any business entity is considered an architectural change.  
  
Architectural changes require:  
Architectural changes require:  
  
* Repository Update  
* Documentation Update  
* Version Increment  
* Approval  
  
Source of Truth modifications must never occur silently.  
  
⸻  
  
**SOURCE OF TRUTH SUCCESS CRITERIA**  
  
The Source of Truth Matrix is considered correct only if:  
  
* Every business entity has exactly one owner.  
* Every calculation has exactly one calculation engine.  
* Every imported dataset has exactly one provider.  
* Every dashboard consumes approved business engines.  
* Every AI recommendation consumes approved business metrics.  
* No duplicate authority exists anywhere in the platform.  
  
Violating these principles compromises financial accuracy and architectural integrity.  
  
⸻  
  
**END OF FILE**  
  
005_SOURCE_OF_TRUTH_MATRIX.md  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
