**009_FORMULA_ENGINE.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 11 / Repository  
  
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
  
⸻  
  
**PURPOSE**  
  
The Formula Engine is the single authoritative subsystem responsible for defining, executing, versioning and explaining every business formula used throughout the platform.  
  
No dashboard, report, API adapter, SQL query, AI module or frontend component may implement business formulas independently.  
  
Every KPI, metric and financial calculation must originate from the Formula Engine.  
  
⸻  
  
**OBJECTIVES**  
  
The Formula Engine shall provide:  
  
* Formula Standardization  
* Formula Versioning  
* Formula Explainability  
* Formula Transparency  
* Formula Reusability  
* Deterministic Results  
* Historical Reproducibility  
  
Every calculation must always produce identical results when executed using identical inputs.  
  
⸻  
  
**CORE PRINCIPLES**  
  
Business formulas belong only inside the Formula Engine.  
  
Business formulas must never exist inside:  
  
* Dashboards  
* React Components  
* SQL Queries  
* API Adapters  
* AI Prompts  
* Reports  
  
Every formula shall exist exactly once.  
  
⸻  
  
**FORMULA OWNERSHIP**  
  
The Formula Engine owns:  
  
* KPI Formulas  
* Financial Formulas  
* Inventory Formulas  
* Marketing Formulas  
* Forecast Formulas  
* Health Scores  
* AI Supporting Metrics  
  
Other modules consume formulas.  
  
Only the Formula Engine defines them.  
  
⸻  
  
**FORMULA LIFECYCLE**  
  
Every Formula follows this lifecycle:  
  
Created  
  
↓  
  
Validated  
  
↓  
  
Approved  
  
↓  
  
Versioned  
  
↓  
  
Activated  
  
↓  
  
Executed  
  
↓  
  
Archived (Optional)  
  
Historical versions remain permanently available.  
  
⸻  
  
**FORMULA IDENTIFIER**  
  
Every Formula shall contain:  
  
* Formula ID  
* Formula Name  
* Business Category  
* Version  
* Description  
* Inputs  
* Outputs  
* Effective Date  
* Status  
  
Formula identifiers never change.  
  
⸻  
  
**FORMULA CATEGORIES**  
  
Supported categories include:  
  
* Financial  
* Inventory  
* Marketing  
* Executive KPI  
* Forecast  
* AI  
* Operational  
* Health Score  
  
Future categories may be added.  
  
⸻  
  
**FORMULA INPUTS**  
  
Formula inputs shall originate only from authoritative business engines.  
  
Examples:  
  
Revenue  
  
↓  
  
Financial Engine  
  
Inventory Value  
  
↓  
  
Inventory Engine  
  
Marketing Spend  
  
↓  
  
Marketing Engine  
  
Shipment Status  
  
↓  
  
Shipping Module  
  
Formulas never consume raw API payloads.  
  
⸻  
  
**FORMULA OUTPUTS**  
  
Formula outputs include:  
  
* KPI Values  
* Scores  
* Ratios  
* Percentages  
* Rankings  
* Health Indicators  
* Forecast Metrics  
  
Outputs may become inputs for higher-level formulas.  
  
⸻  
  
**FORMULA DEPENDENCIES**  
  
Formulas may depend on:  
  
Business Engines  
  
↓  
  
Lower-Level Formulas  
  
↓  
  
Canonical Data  
  
Formulas must never create circular dependencies.  
  
⸻  
  
**FORMULA VERSIONING**  
  
Every Formula supports version history.  
  
Each version contains:  
  
* Version Number  
* Effective Date  
* Business Reason  
* Previous Version  
* Author  
* Approval Status  
  
Historical calculations always reference the version active when they were executed.  
  
⸻  
  
**FORMULA VALIDATION**  
  
Before activation every Formula shall be validated.  
  
Validation includes:  
  
* Mathematical Integrity  
* Business Rule Compliance  
* Input Validation  
* Output Validation  
* Circular Dependency Detection  
  
Invalid formulas cannot become active.  
  
⸻  
  
**FORMULA EXECUTION**  
  
Formula execution shall be deterministic.  
  
Identical Inputs  
  
↓  
  
Identical Outputs  
  
Always.  
  
Random behavior is prohibited.  
  
⸻  
  
**FORMULA REUSE**  
  
The same formula shall never be duplicated.  
  
Every dashboard.  
  
Every report.  
  
Every AI insight.  
  
Every export.  
  
Must consume the same centralized Formula.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 009_FORMULA_ENGINE.md**  
  
⸻  
  
**FORMULA INSPECTOR**  
  
Every formula executed by the Formula Engine shall support Formula Inspector.  
  
Formula Inspector must expose:  
  
* Formula Name  
* Formula Version  
* Business Purpose  
* Input Variables  
* Source Data  
* Intermediate Calculations  
* Output  
* Execution Timestamp  
  
Users should always understand how a value was produced.  
  
⸻  
  
**FORMULA EXPLAINABILITY**  
  
Every formula shall include a human-readable explanation.  
  
Example:  
  
Metric  
  
Net Profit  
  
Business Meaning  
  
Represents the final profitability after deducting all documented business costs.  
  
Purpose  
  
Measure actual business performance.  
  
Formula  
  
(Defined internally)  
  
Explanation exists independently from implementation.  
  
⸻  
  
**KPI STANDARDIZATION**  
  
Every KPI shall reference exactly one Formula.  
  
Examples:  
  
* Revenue  
* Gross Profit  
* Net Profit  
* Delivery Rate  
* Return Rate  
* Inventory Turnover  
* Cash Flow  
* True CPA  
* Marketing ROI  
  
KPIs shall never redefine formulas independently.  
  
⸻  
  
**FORMULA CHAIN**  
  
Complex calculations should be composed of reusable formulas.  
  
Example:  
  
Revenue  
  
↓  
  
Gross Profit  
  
↓  
  
Net Profit  
  
↓  
  
Profit Margin  
  
Each step remains independently inspectable.  
  
⸻  
  
**FORMULA CACHING**  
  
Formula execution results may be cached.  
  
Caching shall never replace calculation correctness.  
  
Whenever inputs change:  
  
Affected cached formulas shall be recalculated.  
  
Cache invalidation must be deterministic.  
  
⸻  
  
**FORMULA HISTORY**  
  
Historical formula execution shall remain reproducible.  
  
The platform should always answer:  
  
* Which formula version was used?  
* Which inputs were consumed?  
* Which business rules were active?  
* Which result was produced?  
  
Historical explainability is mandatory.  
  
⸻  
  
**FINANCIAL FORMULAS**  
  
Examples include:  
  
* Revenue  
* Shipping Subsidy  
* COGS  
* Gross Profit  
* Net Profit  
* Cash Flow  
* Profit Margin  
* Projected Profit  
* Expected Settlement  
  
Financial formulas consume Financial Engine outputs.  
  
⸻  
  
**INVENTORY FORMULAS**  
  
Examples include:  
  
* Inventory Value  
* Inventory Turnover  
* Stock Coverage  
* Days of Inventory  
* Dead Stock %  
* Slow Moving Inventory %  
  
Inventory formulas consume Inventory Engine outputs.  
  
⸻  
  
**MARKETING FORMULAS**  
  
Examples include:  
  
* True CPA  
* Marketing ROI  
* Cost Per Delivered Order  
* Cost Per Refused Order  
* Campaign Profitability  
* Product Profitability  
  
Marketing formulas consume Marketing Engine and Financial Engine outputs.  
  
⸻  
  
**FORECAST FORMULAS**  
  
Forecast formulas may include:  
  
* Projected Revenue  
* Projected Profit  
* Projected Cash Flow  
* Expected Inventory Consumption  
* Purchase Recommendation  
* Forecast Delivery Rate  
  
Forecast formulas never modify historical data.  
  
⸻  
  
**HEALTH SCORE FORMULAS**  
  
Health Scores may include:  
  
* Financial Health  
* Inventory Health  
* Marketing Health  
* Operational Health  
* Business Health  
  
Scores combine multiple lower-level KPIs.  
  
Score definitions remain version controlled.  
  
⸻  
  
**COMPOSITE FORMULAS**  
  
Some formulas depend upon multiple business domains.  
  
Example:  
  
Business Health Score  
  
↓  
  
Financial KPIs  
  
Inventory KPIs  
  
Marketing KPIs  
  
Operational KPIs  
  
Composite formulas remain fully inspectable.  
  
⸻  
  
**FORMULA DEPENDENCY GRAPH**  
  
The Formula Engine shall maintain an internal dependency graph.  
  
Purpose:  
  
* Detect Circular Dependencies  
* Optimize Execution  
* Trigger Selective Recalculation  
* Support Formula Inspector  
  
Circular formula dependencies are prohibited.  
  
⸻  
  
**APPROVAL PROCESS**  
  
New formulas should follow:  
  
Draft  
  
↓  
  
Validation  
  
↓  
  
Business Review  
  
↓  
  
Approval  
  
↓  
  
Activation  
  
Future governance may require formal approvals before activation.  
  
⸻  
  
## END OF PART 2  
  
  
**\**  
  
  
**CONTINUATION OF 009_FORMULA_ENGINE.md**  
  
⸻  
  
**FORMULA SECURITY**  
  
Business formulas are protected assets.  
  
Only authorized administrators may:  
Only authorized administrators may:  
  
* Create Formulas  
* Modify Formulas  
* Retire Formulas  
* Activate New Versions  
  
Ordinary users shall never modify business formulas.  
Ordinary users shall never modify business formulas.  
  
⸻  
  
**FORMULA TESTING**  
  
Every Formula shall have automated validation tests.  
Every Formula shall have automated validation tests.  
  
Tests should verify:  
Tests should verify:  
  
* Mathematical Accuracy  
* Business Rule Compliance  
* Boundary Conditions  
* Null Handling  
* Invalid Inputs  
* Historical Compatibility  
  
Formula activation is prohibited until all mandatory tests pass.  
Formula activation is prohibited until all mandatory tests pass.  
  
⸻  
  
**FORMULA AUDIT**  
  
Every Formula change shall generate a permanent Audit Record.  
Every Formula change shall generate a permanent Audit Record.  
  
Audit information includes:  
Audit information includes:  
  
* Formula ID  
* Version  
* Previous Definition  
* New Definition  
* Author  
* Approval  
* Timestamp  
* Business Reason  
  
Formula history shall never be deleted.  
Formula history shall never be deleted.  
  
⸻  
  
**FORMULA PERFORMANCE**  
  
Formula execution shall remain efficient.  
Formula execution shall remain efficient.  
  
Optimization priorities:  
  
1. Correctness  
2. Correctness  
3. Deterministic Results  
4. Deterministic Results  
5. Explainability  
6. Explainability  
7. Performance  
8. Performance  
  
Execution speed must never compromise correctness.  
Execution speed must never compromise correctness.  
  
⸻  
  
**LAZY RECALCULATION**  
  
Whenever source data changes:  
  
Only affected formulas shall be recalculated.  
  
Unrelated formulas remain unchanged.  
Unrelated formulas remain unchanged.  
  
The Formula Dependency Graph determines recalculation scope.  
  
⸻  
  
**BULK CALCULATION**  
  
The Formula Engine shall support large-scale recalculation.  
  
Examples include:  
  
* Historical Imports  
* Formula Version Updates  
* Inventory Corrections  
* Settlement Imports  
* Data Migration  
  
Bulk execution shall remain deterministic.  
  
⸻  
  
**ERROR HANDLING**  
  
If formula execution fails:  
If formula execution fails:  
  
The platform shall:  
  
* Preserve previous successful calculations.  
* Record execution failure.  
* Log diagnostic information.  
* Notify monitoring services.  
* Prevent invalid values from reaching dashboards.  
  
No partially calculated KPI shall become visible.  
  
⸻  
  
**MISSING INPUTS**  
  
If required inputs are unavailable:  
If required inputs are unavailable:  
  
The Formula Engine shall:  
The Formula Engine shall:  
  
* Mark calculation as unavailable.  
* Explain missing dependencies.  
* Avoid estimation.  
* Preserve historical values.  
  
Unknown values are preferable to incorrect values.  
  
⸻  
  
**NULL HANDLING**  
  
Null values shall be handled explicitly.  
Null values shall be handled explicitly.  
  
Examples:  
  
Unknown Marketing Spend  
  
↓  
↓  
  
True CPA  
True CPA  
  
↓  
↓  
  
Unavailable  
Unavailable  
  
Not Zero.  
  
Not Estimated.  
  
Business meaning must always remain correct.  
Business meaning must always remain correct.  
  
⸻  
  
**PRECISION POLICY**  
  
Internal calculations shall preserve maximum available precision.  
  
Presentation rounding occurs only at the UI layer unless a documented business rule specifies otherwise.  
  
Precision loss during intermediate calculations is prohibited.  
Precision loss during intermediate calculations is prohibited.  
  
⸻  
  
**FORMULA DOCUMENTATION**  
  
Every Formula shall contain documentation including:  
Every Formula shall contain documentation including:  
  
* Business Purpose  
* Inputs  
* Outputs  
* Dependencies  
* Business Rules  
* Example Calculation  
* Related KPIs  
  
Undocumented formulas are considered incomplete.  
  
⸻  
  
**FORMULA DISCOVERY**  
  
The platform should maintain a searchable Formula Catalog.  
  
Users should be able to discover formulas by:  
Users should be able to discover formulas by:  
  
* Category  
* Business Domain  
* KPI  
* Formula Name  
* Related Dashboard  
  
The Formula Catalog improves transparency.  
The Formula Catalog improves transparency.  
  
⸻  
  
**FORMULA EXPORT**  
  
Formula definitions should support export for:  
Formula definitions should support export for:  
  
* Documentation  
* Auditing  
* Regulatory Review  
* Business Validation  
  
Exported definitions remain read-only.  
Exported definitions remain read-only.  
  
⸻  
  
**AI EXPLANATION SUPPORT**  
  
AI Copilot shall use Formula Engine documentation when explaining KPIs.  
AI Copilot shall use Formula Engine documentation when explaining KPIs.  
  
AI explanations must reference:  
AI explanations must reference:  
  
* Formula Name  
* Business Meaning  
* Inputs  
* Business Interpretation  
  
AI shall never invent undocumented formulas.  
  
⸻  
  
**DASHBOARD INTEGRATION**  
  
Every dashboard KPI shall request values from the Formula Engine.  
Every dashboard KPI shall request values from the Formula Engine.  
  
Dashboards shall never embed business formulas.  
Dashboards shall never embed business formulas.  
  
Dashboard responsibility is limited to:  
Dashboard responsibility is limited to:  
  
* Visualization  
* Filtering  
* Sorting  
* Drill Down  
  
⸻  
  
**REPORT INTEGRATION**  
  
Reports shall consume approved Formula Engine outputs.  
  
Report generators shall never redefine formulas.  
  
Formula consistency across dashboards and reports is mandatory.  
Formula consistency across dashboards and reports is mandatory.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The Formula Engine is considered complete only if:  
The Formula Engine is considered complete only if:  
  
* Every KPI has exactly one Formula.  
* Every Formula supports versioning.  
* Every Formula supports Formula Inspector.  
* Historical calculations remain reproducible.  
* Formula execution is deterministic.  
* Formula documentation is complete.  
* Dashboards never duplicate formulas.  
* Reports never duplicate formulas.  
* AI explanations always reference Formula Engine definitions.  
* Business calculations remain centralized.  
  
The Formula Engine is the mathematical authority of the platform.  
  
No business calculation may exist outside it.  
No business calculation may exist outside it.  
  
⸻  
  
**END OF FILE**  
  
009_FORMULA_ENGINE.md  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
