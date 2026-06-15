**010_ANALYTICS_ENGINE.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 12 / Repository  
  
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
  
⸻  
  
**PURPOSE**  
  
The Analytics Engine is the subsystem responsible for transforming validated business data into meaningful business intelligence.  
  
The Analytics Engine never creates business events.  
  
The Analytics Engine never performs financial calculations independently.  
  
It consumes approved outputs from business engines and transforms them into actionable insights.  
  
⸻  
  
**OBJECTIVES**  
  
The Analytics Engine shall provide:  
  
* Executive KPIs  
* Historical Analysis  
* Trend Analysis  
* Comparative Analysis  
* Business Intelligence  
* Decision Support  
* Performance Monitoring  
  
Analytics exist to improve decisions.  
  
Not merely display numbers.  
  
⸻  
  
**CORE PRINCIPLES**  
  
Analytics shall always consume:  
  
Financial Engine  
  
Inventory Engine  
  
Formula Engine  
  
Marketing Engine  
  
Settlement Engine  
  
Never raw API payloads.  
  
Never frontend calculations.  
  
Never duplicated formulas.  
  
⸻  
  
**ANALYTICAL PIPELINE**  
  
Business Events  
  
↓  
  
Business Engines  
  
↓  
  
Formula Engine  
  
↓  
  
Analytics Engine  
  
↓  
  
AI Engine  
  
↓  
  
Dashboard  
  
↓  
  
Executive Decisions  
  
⸻  
  
**RESPONSIBILITIES**  
  
The Analytics Engine owns:  
  
* KPI Aggregation  
* Trend Generation  
* Rankings  
* Comparisons  
* Executive Metrics  
* Historical Analysis  
* Daily Snapshots  
* Dashboard Datasets  
  
Business calculations remain outside the Analytics Engine.  
  
⸻  
  
**KPI AGGREGATION**  
  
Analytics aggregates approved KPIs.  
  
Examples include:  
  
* Revenue  
* Net Profit  
* Gross Profit  
* Cash Flow  
* Inventory Value  
* Delivery Rate  
* Return Rate  
* Marketing ROI  
* True CPA  
  
Analytics never changes KPI definitions.  
  
⸻  
  
**EXECUTIVE METRICS**  
  
Executive Metrics summarize business health.  
  
Examples include:  
  
* Total Revenue  
* Total Profit  
* Delivered Orders  
* Expected Profit  
* Cash Position  
* Inventory Value  
* Marketing Efficiency  
* Financial Health  
  
Executive Metrics support high-level decisions.  
  
⸻  
  
**HISTORICAL ANALYSIS**  
  
Historical Analysis compares business performance across time.  
  
Supported periods include:  
  
* Yesterday  
* Last 7 Days  
* Last 30 Days  
* Month  
* Quarter  
* Year  
  
Historical reports must remain reproducible.  
  
⸻  
  
**TREND ANALYSIS**  
  
Trend Analysis identifies direction rather than isolated values.  
  
Supported trend types include:  
  
* Revenue Trend  
* Profit Trend  
* Delivery Trend  
* Return Trend  
* Marketing Trend  
* Inventory Trend  
* Cash Flow Trend  
  
Trend generation never modifies historical data.  
  
⸻  
  
**COMPARATIVE ANALYSIS**  
  
Comparisons shall support:  
  
Current Period  
  
vs  
  
Previous Period  
  
Examples:  
  
Month vs Previous Month  
  
Week vs Previous Week  
  
Quarter vs Previous Quarter  
  
Year vs Previous Year  
  
Comparisons improve decision quality.  
  
⸻  
  
**PRODUCT ANALYTICS**  
  
The Analytics Engine shall generate product intelligence.  
  
Metrics include:  
  
* Revenue  
* Units Sold  
* Gross Profit  
* Net Profit  
* Return Rate  
* Delivery Rate  
* Inventory Turnover  
* Marketing Attribution  
  
Products are analyzed using Canonical Product IDs only.  
  
⸻  
  
**CAMPAIGN ANALYTICS**  
  
Campaign Analytics shall expose:  
  
* Spend  
* Revenue  
* Delivered Orders  
* Profit  
* ROI  
* True CPA  
* Conversion Rate  
  
Campaign calculations consume approved business metrics.  
  
⸻  
  
**GOVERNORATE ANALYTICS**  
  
The Analytics Engine shall support profitability analysis by governorate.  
  
Metrics include:  
  
* Revenue  
* Orders  
* Delivery Rate  
* Return Rate  
* Shipping Cost  
* Shipping Subsidy  
* Net Profit  
  
This supports operational optimization.  
  
⸻  
  
**STORE ANALYTICS**  
  
Multi-store reporting shall include:  
  
* Revenue  
* Profit  
* Inventory  
* Marketing Spend  
* Cash Flow  
* Delivery Performance  
  
Stores remain independently analyzable.  
  
Combined reporting shall require no formula changes.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 010_ANALYTICS_ENGINE.md**  
  
⸻  
  
**CUSTOMER BEHAVIOR ANALYTICS**  
  
Although the platform is not a CRM, it shall analyze customer purchasing behavior at an aggregated level.  
  
Examples include:  
  
* Average Order Value  
* Repeat Purchase Rate  
* Product Affinity  
* Geographic Distribution  
* Payment Method Distribution  
  
Customer analytics remain anonymous where possible.  
  
The platform is not intended for customer management.  
  
⸻  
  
**MARKETING ANALYTICS**  
  
Marketing Analytics shall expose:  
  
* Marketing Spend  
* Revenue  
* Profit  
* Delivered Orders  
* True CPA  
* Marketing ROI  
* Campaign Ranking  
* Product Performance  
* Platform Comparison  
  
Marketing Analytics consume Marketing Engine and Financial Engine outputs.  
  
⸻  
  
**FINANCIAL ANALYTICS**  
  
Financial Analytics shall provide:  
  
* Revenue Analysis  
* Gross Profit Analysis  
* Net Profit Analysis  
* Expense Analysis  
* Cash Flow Analysis  
* Shipping Cost Analysis  
* Shipping Subsidy Analysis  
* Margin Analysis  
  
Financial Analytics never redefine financial formulas.  
  
⸻  
  
**INVENTORY ANALYTICS**  
  
Inventory Analytics shall provide:  
  
* Inventory Value  
* Inventory Turnover  
* Days of Inventory  
* Dead Stock  
* Slow Moving Inventory  
* Overstock  
* Low Stock  
* Purchase Trends  
  
Inventory Analytics consume Inventory Engine outputs only.  
  
⸻  
  
**SHIPPING ANALYTICS**  
  
Shipping Analytics shall include:  
  
* Delivery Rate  
* Return Rate  
* Refusal Rate  
* Shipping Cost  
* Shipping Subsidy  
* Average Delivery Time  
* Governorate Performance  
* Shipping Provider Performance (future)  
  
Shipping Analytics improve operational decision making.  
  
⸻  
  
**SETTLEMENT ANALYTICS**  
  
Settlement Analytics shall expose:  
  
* Expected Settlement  
* Actual Settlement  
* Settlement Difference  
* Outstanding Settlements  
* Settlement Timeline  
* Deduction Analysis  
  
Settlement Analytics support financial reconciliation.  
  
⸻  
  
**CASH FLOW ANALYTICS**  
  
Cash Flow Analytics shall present:  
  
* Cash In Trend  
* Cash Out Trend  
* Cash Balance  
* Pending Liabilities  
* Expected Cash Flow  
* Cash Forecast  
  
Cash Flow Analytics remain independent from profitability analysis.  
  
⸻  
  
**PROFITABILITY ANALYTICS**  
  
Profitability shall be analyzable by:  
  
* Product  
* Campaign  
* Store  
* Governorate  
* Marketing Source  
* Date Range  
  
Every profitability metric must support drill-down.  
  
⸻  
  
**RANKINGS**  
  
The Analytics Engine shall generate business rankings.  
  
Examples include:  
  
Top Products  
  
Worst Products  
  
Top Campaigns  
  
Worst Campaigns  
  
Highest Profit Products  
  
Lowest Profit Products  
  
Highest Shipping Cost Regions  
  
Best Delivery Governorates  
  
Rankings support executive decisions.  
  
⸻  
  
**SEGMENTATION**  
  
Analytics should support segmentation.  
  
Examples include:  
  
By Store  
  
By Product  
  
By Campaign  
  
By Platform  
  
By Governorate  
  
By Date  
  
By Shipment Status  
  
Segmentation never changes underlying business calculations.  
  
⸻  
  
**FILTERING**  
  
Every analytical dataset should support filtering.  
  
Examples:  
  
* Date Range  
* Store  
* Product  
* Campaign  
* Marketing Source  
* Shipment Status  
* Governorate  
  
Filtering affects presentation only.  
  
Filtering never modifies source data.  
  
⸻  
  
**DRILL DOWN**  
  
Every KPI shall support progressive drill-down.  
  
Navigation example:  
  
Executive KPI  
  
↓  
  
Business Metric  
  
↓  
  
Supporting Formula  
  
↓  
  
Business Events  
  
↓  
  
Order Lookup  
  
↓  
  
Source Records  
  
Analytics should never expose unexplained values.  
  
⸻  
  
**DAILY SNAPSHOTS**  
  
The Analytics Engine shall generate Daily Snapshots.  
  
Each snapshot should preserve:  
  
* Revenue  
* Gross Profit  
* Net Profit  
* Orders  
* Delivered Orders  
* Delivery Rate  
* Return Rate  
* Cash Position  
* Inventory Value  
* Marketing Spend  
  
Snapshots are immutable.  
  
⸻  
  
## END OF PART 2  
  
  
**\**  
  
  
**CONTINUATION OF 010_ANALYTICS_ENGINE.md**  
  
⸻  
  
**TREND DETECTION**  
  
The Analytics Engine shall automatically detect significant business trends.  
  
Examples include:  
  
* Revenue Growth  
* Revenue Decline  
* Profit Growth  
* Profit Decline  
* Delivery Improvement  
* Delivery Deterioration  
* Marketing Efficiency Changes  
* Inventory Accumulation  
  
Trend detection supports Decision Center and AI Copilot.  
  
⸻  
  
**ANOMALY DETECTION**  
  
The Analytics Engine shall identify unusual business behavior.  
  
Examples include:  
  
* Unexpected Revenue Drop  
* Unusual Shipping Cost  
* Extremely High Return Rate  
* Negative Profit Spike  
* Inventory Consumption Anomalies  
* Settlement Differences  
  
Anomalies never modify business data.  
Anomalies never modify business data.  
  
They generate business insights.  
  
⸻  
  
**OPPORTUNITY DETECTION**  
  
The Analytics Engine shall identify business opportunities.  
  
Examples include:  
  
* Products with high demand  
* Campaigns with excellent ROI  
* Governorates with high profitability  
* Products ready for scaling  
* Inventory ready for promotion  
  
Opportunities shall be forwarded to the AI Engine.  
Opportunities shall be forwarded to the AI Engine.  
  
⸻  
  
**RISK DETECTION**  
  
Business risks include:  
  
* Low Inventory  
* Negative Profit  
* Cash Flow Risk  
* Dead Stock  
* High Return Rate  
* Low Delivery Rate  
* Shipping Cost Inflation  
* Marketing Overspending  
  
Risks are informational.  
  
Risks never modify business records.  
  
⸻  
  
**FORECAST ANALYTICS**  
  
Forecast Analytics shall visualize:  
  
* Expected Revenue  
* Expected Profit  
* Expected Deliveries  
* Expected Cash Flow  
* Inventory Forecast  
* Marketing Forecast  
  
Forecast Analytics must remain visually distinct from historical analytics.  
Forecast Analytics must remain visually distinct from historical analytics.  
  
⸻  
  
**BENCHMARK ANALYSIS**  
  
The Analytics Engine should support benchmark comparisons.  
The Analytics Engine should support benchmark comparisons.  
  
Examples:  
Examples:  
  
Current Month  
Current Month  
  
vs  
  
Previous Month  
  
Current Quarter  
Current Quarter  
  
vs  
vs  
  
Previous Quarter  
  
Current Year  
Current Year  
  
vs  
vs  
  
Previous Year  
Previous Year  
  
Benchmark calculations consume historical snapshots.  
  
⸻  
  
**KPI HISTORY**  
  
Every KPI should maintain historical values.  
  
Historical KPIs support:  
Historical KPIs support:  
  
* Trend Analysis  
* Forecasting  
* AI  
* Executive Reporting  
  
Historical KPI values remain immutable.  
Historical KPI values remain immutable.  
  
⸻  
  
**EXECUTIVE SCORECARDS**  
  
The Analytics Engine shall generate executive scorecards.  
The Analytics Engine shall generate executive scorecards.  
  
Example sections:  
Example sections:  
  
Financial  
  
Marketing  
Marketing  
  
Inventory  
Inventory  
  
Shipping  
  
Cash Flow  
  
Operations  
  
AI Summary  
AI Summary  
  
Scorecards summarize business performance.  
Scorecards summarize business performance.  
  
⸻  
  
**DASHBOARD DATASETS**  
  
Dashboards consume prepared datasets generated by the Analytics Engine.  
Dashboards consume prepared datasets generated by the Analytics Engine.  
  
Dashboards shall never aggregate raw transactional data directly.  
Dashboards shall never aggregate raw transactional data directly.  
  
Prepared datasets improve:  
Prepared datasets improve:  
  
* Performance  
* Consistency  
* Explainability  
  
⸻  
  
**AI DATASETS**  
  
The Analytics Engine shall prepare datasets specifically for AI.  
  
Examples include:  
Examples include:  
  
* Business Trends  
* Product Rankings  
* Financial Health  
* Inventory Health  
* Marketing Performance  
* Historical Changes  
  
AI consumes these datasets without modifying them.  
AI consumes these datasets without modifying them.  
  
⸻  
  
**EXECUTIVE ALERTS**  
  
The Analytics Engine shall generate executive alerts.  
The Analytics Engine shall generate executive alerts.  
  
Examples:  
Examples:  
  
* Profit below threshold  
* Cash shortage risk  
* Inventory shortage  
* High shipping subsidy  
* Marketing overspend  
* Settlement discrepancy  
  
Alerts support decision making.  
Alerts support decision making.  
  
Alerts never execute actions automatically.  
  
⸻  
  
**ANALYTICS VALIDATION**  
  
Before publishing analytical results, validate:  
Before publishing analytical results, validate:  
  
* Formula Version  
* Source Data Availability  
* KPI Integrity  
* Business Rule Compliance  
* Snapshot Availability  
* Data Freshness  
  
Invalid analytics shall never be published.  
Invalid analytics shall never be published.  
  
⸻  
  
**PERFORMANCE**  
  
The Analytics Engine shall support:  
The Analytics Engine shall support:  
  
* Millions of analytical records  
* Multi-year history  
* Multi-store reporting  
* Near real-time dashboards  
* Fast executive filtering  
  
Performance optimizations must preserve analytical correctness.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The Analytics Engine is considered complete only if:  
The Analytics Engine is considered complete only if:  
  
* Every KPI originates from approved formulas.  
* Every dashboard consumes analytical datasets.  
* Historical analysis is reproducible.  
* Trend analysis is deterministic.  
* Rankings are explainable.  
* Drill-down reaches supporting business records.  
* AI consumes analytics without modifying them.  
* Executive dashboards remain fast and consistent.  
* Forecast analytics remain separate from realized analytics.  
  
The Analytics Engine is the business intelligence layer of the platform.  
The Analytics Engine is the business intelligence layer of the platform.  
  
It transforms trusted calculations into trusted decisions.  
It transforms trusted calculations into trusted decisions.  
  
⸻  
  
**END OF FILE**  
  
010_ANALYTICS_ENGINE.md  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
