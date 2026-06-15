**016_DASHBOARD_PAGES.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: HIGH  
  
Read Order: 18 / Repository  
  
Depends On:  
  
* 000_CLAUDE_MASTER_INSTRUCTIONS.md  
* 000A_PROJECT_DECISION_PRINCIPLES.md  
* 001_PROJECT_CONSTITUTION.md  
* 002_BUSINESS_RULES.md  
* 003_DATA_DICTIONARY.md  
* 004_CANONICAL_DATA_MODEL.md  
* 005_SOURCE_OF_TRUTH_MATRIX.md  
* 006_DATABASE_SPECIFICATION.md  
* 007_FINANCIAL_ENGINE.md  
* 008_INVENTORY_FIFO_ENGINE.md  
* 009_FORMULA_ENGINE.md  
* 010_ANALYTICS_ENGINE.md  
* 011_AI_ENGINE.md  
* 012_API_ARCHITECTURE.md  
* 013_SYNCHRONIZATION_ENGINE.md  
* 014_DASHBOARD_ARCHITECTURE.md  
* 015_USER_INTERFACE_SPECIFICATION.md  
  
⸻  
  
**PURPOSE**  
  
This document defines every page inside the dashboard.  
  
It specifies page responsibilities, navigation, widgets, drill-down behavior, AI integration, and user interactions.  
  
Every page has one clear business purpose.  
  
⸻  
  
**PAGE HIERARCHY**  
  
Dashboard  
  
├── Executive Dashboard  
  
├── Financial Dashboard  
  
├── Inventory Dashboard  
  
├── Marketing Dashboard  
  
├── Shipping Dashboard  
  
├── Cash Flow Dashboard  
  
├── Settlement Dashboard  
  
├── Reports  
  
├── Decision Center  
  
├── AI Copilot  
  
├── Order Lookup  
  
├── Settings  
  
⸻  
  
**PAGE 001**  
  
**Executive Dashboard**  
  
Purpose  
  
Provide an instant overview of business performance.  
  
Primary KPIs  
  
* Revenue  
* Gross Profit  
* Net Profit  
* Cash Balance  
* Inventory Value  
* Marketing Spend  
* Delivery Rate  
* Return Rate  
* Financial Health Score  
  
Widgets  
  
* Revenue Trend  
* Profit Trend  
* Cash Trend  
* Delivery Trend  
* AI Daily Brief  
* Decision Center Summary  
  
Every KPI supports:  
  
* Formula Inspector  
* Drill Down  
* Historical Comparison  
  
⸻  
  
**PAGE 002**  
  
**Financial Dashboard**  
  
Purpose  
  
Analyze financial performance.  
  
Sections  
  
Revenue  
  
Profit  
  
Expenses  
  
Shipping Subsidy  
  
Cash  
  
Margins  
  
Widgets  
  
* Revenue Timeline  
* Gross Profit  
* Net Profit  
* Expense Breakdown  
* Profit Margin  
* Shipping Subsidy  
* Formula Inspector  
  
Drill Down  
  
Financial KPI  
  
↓  
  
Business Events  
  
↓  
  
Order Lookup  
  
⸻  
  
**PAGE 003**  
  
**Inventory Dashboard**  
  
Purpose  
  
Monitor inventory health.  
  
KPIs  
  
* Inventory Value  
* Available Units  
* Inventory Turnover  
* Dead Stock  
* Slow Moving Inventory  
* Low Stock  
* Days of Inventory  
  
Widgets  
  
* Inventory Trend  
* Dead Stock Ranking  
* Low Stock Alerts  
* Purchase Recommendation  
* Inventory Health Score  
  
Inventory values originate only from Inventory Engine.  
  
⸻  
  
**PAGE 004**  
  
**Marketing Dashboard**  
  
Purpose  
  
Evaluate marketing performance.  
  
KPIs  
  
* Marketing Spend  
* True CPA  
* ROI  
* Delivered Orders  
* Profit  
* Cost per Delivered Order  
  
Widgets  
  
* Campaign Ranking  
* Platform Comparison  
* Marketing Trend  
* Campaign Profitability  
* AI Marketing Insights  
  
⸻  
  
**PAGE 005**  
  
**Shipping Dashboard**  
  
Purpose  
  
Monitor operational shipping performance.  
  
KPIs  
  
* Delivery Rate  
* Return Rate  
* Refusal Rate  
* Shipping Cost  
* Shipping Subsidy  
  
Widgets  
  
* Governorate Performance  
* Delivery Timeline  
* Shipping Trend  
* Return Trend  
* Shipping Health  
  
Shipping calculations originate from Financial Engine.  
  
Shipment status originates from Shipping Module.  
  
⸻  
  
**PAGE 006**  
  
**Cash Flow Dashboard**  
  
Purpose  
  
Monitor business liquidity.  
  
KPIs  
  
* Cash In  
* Cash Out  
* Cash Balance  
* Pending Liabilities  
* Projected Cash Flow  
  
Widgets  
  
* Cash Timeline  
* Cash Sources  
* Cash Uses  
* Future Obligations  
  
Cash Flow is always independent from Profit.  
  
⸻  
  
**PAGE 007**  
  
**Settlement Dashboard**  
  
Purpose  
  
Reconcile settlements.  
  
KPIs  
  
* Expected Settlement  
* Actual Settlement  
* Settlement Difference  
* Pending Settlements  
  
Widgets  
  
* Settlement Timeline  
* Deduction Breakdown  
* Reconciliation Summary  
* Settlement Alerts  
  
Settlement pages support financial investigation.  
  
⸻  
  
## END OF PART 1  
  
**\**  
  
**CONTINUATION OF 016_DASHBOARD_PAGES.md**  
  
⸻  
  
**PAGE 008**  
  
**Decision Center**  
  
Purpose  
  
Provide AI-prioritized business actions.  
  
Sections  
  
* Critical Issues  
* Opportunities  
* Risks  
* Recommendations  
* Completed Recommendations  
  
Each recommendation includes:  
  
* Title  
* Business Reason  
* Priority  
* Confidence  
* Expected Impact  
* Supporting KPIs  
* Suggested Action  
* Open Investigation  
  
Every recommendation supports drill-down.  
  
⸻  
  
**PAGE 009**  
  
**AI Copilot**  
  
Purpose  
  
Provide conversational business intelligence.  
  
Capabilities  
  
* Explain KPIs  
* Explain Trends  
* Explain Profit  
* Compare Periods  
* Scenario Analysis  
* What-if Analysis  
* Inventory Advice  
* Marketing Advice  
* Financial Advice  
  
Suggested Questions  
  
* Why did profit decrease?  
* Which campaign should I stop?  
* What should I reorder?  
* Which products lose money?  
* Why did shipping increase?  
  
AI responses always reference:  
  
* Formula Engine  
* Financial Engine  
* Analytics Engine  
  
⸻  
  
**PAGE 010**  
  
**Order Lookup**  
  
Purpose  
  
Investigate a single order completely.  
  
Search Methods  
  
* Order ID  
* Tracking Number  
* Customer Phone (future)  
* External Provider ID  
  
Sections  
  
**General**  
  
* Order ID  
* Store  
* Order Date  
* Shipment Status  
* Delivery Timeline  
  
**Financial**  
  
* Product Revenue  
* Customer Shipping Fee  
* Actual Shipping Cost  
* Shipping Subsidy  
* FIFO Cost  
* Gross Profit  
* Net Profit  
  
**Inventory**  
  
* FIFO Layers Used  
* Inventory Cost  
* Inventory Movements  
  
**Marketing**  
  
* Source  
* Campaign  
* Platform  
* Marketing Cost Allocation  
  
**Settlement**  
  
* Settlement Reference  
* Settlement Date  
* Settlement Amount  
  
**AI**  
  
* Profit Explanation  
* Recommendations  
* Formula Inspector  
  
Order Lookup is read-only.  
  
⸻  
  
**PAGE 011**  
  
**Reports**  
  
Purpose  
  
Generate executive business reports.  
  
Report Categories  
  
* Financial Reports  
* Inventory Reports  
* Marketing Reports  
* Shipping Reports  
* Cash Flow Reports  
* Settlement Reports  
* Executive Reports  
  
Supported Formats  
  
* PDF  
* Excel  
* CSV  
  
Reports consume Analytics Engine datasets only.  
  
⸻  
  
**PAGE 012**  
  
**Notifications Center**  
  
Purpose  
  
Display important business events.  
  
Categories  
  
* Finance  
* Inventory  
* Marketing  
* Shipping  
* AI  
* Synchronization  
* System  
  
Priority Levels  
  
* Critical  
* High  
* Medium  
* Low  
  
Notifications remain informational.  
  
⸻  
  
**PAGE 013**  
  
**Synchronization Monitor**  
  
Purpose  
  
Monitor external integrations.  
  
Displays  
  
* Last Synchronization  
* Current Jobs  
* Failed Jobs  
* Provider Health  
* Queue Status  
* Retry Status  
* API Status  
  
This page is intended for administrators.  
  
⸻  
  
**PAGE 014**  
  
**Formula Catalog**  
  
Purpose  
  
Provide searchable access to every business formula.  
  
Each Formula displays  
  
* Formula Name  
* Business Meaning  
* Category  
* Version  
* Inputs  
* Outputs  
* Related KPIs  
* Related Dashboards  
  
Formula definitions are read-only.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
**CONTINUATION OF 016_DASHBOARD_PAGES.md**  
  
⸻  
  
**PAGE 015**  
  
**Settings**  
  
Purpose  
  
Manage system configuration.  
  
Sections  
Sections  
  
**General**  
**General**  
  
* Company Information  
* Stores  
* Language  
* Theme  
* Time Zone  
* Currency  
  
**API Connections**  
  
* Eazy Order  
* Bosta  
* Meta Ads  
* TikTok Ads  
  
Displays:  
  
* Connection Status  
* Last Sync  
* Token Status  
* Last Refresh  
* Health  
  
Credentials remain hidden.  
  
⸻  
  
**Synchronization**  
**Synchronization**  
  
Settings include:  
Settings include:  
  
* Sync Frequency  
* Retry Policy  
* Background Jobs  
* Queue Settings  
  
Manual synchronization is available only to authorized users.  
  
⸻  
  
**Financial Settings**  
**Financial Settings**  
  
Displays configurable business parameters only.  
  
Examples:  
Examples:  
  
* Fiscal Year  
* Reporting Preferences  
* Default Currency  
  
Business formulas are NOT configurable here.  
Business formulas are NOT configurable here.  
  
⸻  
  
**Inventory Settings**  
  
Displays:  
Displays:  
  
* Low Stock Threshold  
* Reorder Level Defaults  
* Inventory Alert Rules  
  
FIFO configuration is NOT editable.  
FIFO configuration is NOT editable.  
  
FIFO is mandatory.  
  
⸻  
  
**Notification Settings**  
  
Configure:  
Configure:  
  
* Email Notifications (Future)  
* In-App Notifications  
* AI Recommendations  
* Critical Alerts  
  
Users may customize notification preferences.  
Users may customize notification preferences.  
  
⸻  
  
**User Management**  
  
Displays:  
  
* Users  
* Roles  
* Permissions  
  
Permission changes affect access only.  
  
Business calculations remain unchanged.  
Business calculations remain unchanged.  
  
⸻  
  
**PAGE 016**  
  
**Audit Center**  
  
Purpose  
Purpose  
  
Provide complete audit visibility.  
  
Search Filters  
  
* Date  
* User  
* Entity  
* Action  
* Module  
  
Audit Types  
Audit Types  
  
* Financial  
* Inventory  
* Synchronization  
* Configuration  
* Formula  
* Manual Adjustment  
  
Audit records are immutable.  
Audit records are immutable.  
  
⸻  
  
**PAGE 017**  
  
**System Health**  
  
Purpose  
  
Monitor platform health.  
Monitor platform health.  
  
Sections  
  
Infrastructure  
  
Synchronization  
Synchronization  
  
Database  
Database  
  
Background Jobs  
Background Jobs  
  
API Providers  
API Providers  
  
Health Indicators  
Health Indicators  
  
* Healthy  
* Warning  
* Critical  
  
Health monitoring never affects business logic.  
  
⸻  
  
**PAGE NAVIGATION PRINCIPLES**  
  
Every page shall support:  
Every page shall support:  
  
* Breadcrumb Navigation  
* Back Navigation  
* Global Search  
* Consistent Header  
* Consistent Sidebar  
  
Users should never lose context.  
Users should never lose context.  
  
⸻  
  
**PAGE PERMISSIONS**  
  
Every page shall define access permissions.  
  
Example:  
  
Executive Dashboard  
Executive Dashboard  
  
Managers  
Managers  
  
Administrators  
Administrators  
  
Finance Dashboard  
Finance Dashboard  
  
Finance  
Finance  
  
Managers  
Managers  
  
Inventory Dashboard  
Inventory Dashboard  
  
Inventory  
Inventory  
  
Managers  
  
Settings  
Settings  
  
Administrators Only  
Administrators Only  
  
Permissions affect visibility only.  
Permissions affect visibility only.  
  
Business logic remains unchanged.  
  
⸻  
  
**PAGE STATE MANAGEMENT**  
  
Each page shall support:  
Each page shall support:  
  
* Loading State  
* Empty State  
* Error State  
* Success State  
* Offline State (Future)  
  
Every state shall communicate clearly with the user.  
Every state shall communicate clearly with the user.  
  
⸻  
  
**CROSS-PAGE BEHAVIOR**  
  
Global Filters shall persist while navigating between dashboards when appropriate.  
Global Filters shall persist while navigating between dashboards when appropriate.  
  
Language selection shall apply globally.  
  
Theme selection shall apply globally.  
Theme selection shall apply globally.  
  
User context shall remain consistent across navigation.  
User context shall remain consistent across navigation.  
  
⸻  
  
**FUTURE DASHBOARD PAGES**  
  
The architecture shall support future modules including:  
The architecture shall support future modules including:  
  
* Purchasing Dashboard  
* Supplier Dashboard  
* Warehouse Dashboard  
* Multi-Company Dashboard  
* Multi-Currency Dashboard  
* Forecast Workbench  
* Budget Planning  
* Customer Analytics (High-Level Only)  
  
Future pages shall integrate without redesigning the navigation structure.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The Dashboard Pages specification is considered complete only if:  
The Dashboard Pages specification is considered complete only if:  
  
* Every page has one clear business purpose.  
* Navigation is predictable.  
* Every KPI supports drill-down.  
* Formula Inspector is accessible everywhere.  
* AI is integrated naturally.  
* Decision Center is prominent.  
* English and Arabic are fully supported.  
* Pages remain responsive.  
* Business logic never exists inside pages.  
* Future pages can be added without architectural redesign.  
  
The Dashboard is the executive window into the business.  
  
Every page exists to improve understanding, not simply to display data.  
  
⸻  
  
**END OF FILE**  
  
016_DASHBOARD_PAGES.md  
016_DASHBOARD_PAGES.md  
  
Version: 1.0.0  
  
Status: FINAL  
