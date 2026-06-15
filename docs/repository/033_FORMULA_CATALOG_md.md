**033_FORMULA_CATALOG.md**  
  
Version: 2.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 33 / Repository  
  
Depends On:  
  
* 007_FINANCIAL_ENGINE.md  
* 008_INVENTORY_FIFO_ENGINE.md  
* 009_FORMULA_ENGINE.md  
* 010_ANALYTICS_ENGINE.md  
* 020_ACCEPTANCE_CRITERIA.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the official Formula Catalog.  
  
The Formula Catalog is the authoritative registry of every business formula used throughout the platform.  
  
Every KPI, financial metric, inventory metric, marketing metric and AI explanation shall reference a Formula Catalog entry.  
  
No undocumented formula may exist in production.  
  
⸻  
  
**PHILOSOPHY**  
  
Business Metrics  
  
↓  
  
Formula Catalog  
  
↓  
  
Formula Engine  
  
↓  
  
Analytics  
  
↓  
  
Dashboard  
  
↓  
  
Reports  
  
↓  
  
AI  
  
The Formula Catalog is the human-readable specification.  
  
The Formula Engine is the executable implementation.  
  
⸻  
  
**FORMULA IDENTIFIER**  
  
Every formula shall have:  
  
* Formula ID  
* Formula Name  
* Business Category  
* Business Description  
* Formula Version  
* Inputs  
* Output  
* Source of Truth  
* Dependencies  
* Repository References  
  
Formula IDs are immutable.  
  
⸻  
  
**STANDARD FORMULA TEMPLATE**  
  
Every catalog entry shall contain:  
  
Formula ID  
  
Formula Name  
  
Purpose  
  
Business Meaning  
  
Inputs  
  
Formula Expression  
  
Output  
  
Formula Version  
  
Dependencies  
  
Related KPIs  
  
Repository References  
  
Example Calculation  
  
Validation Rules  
  
Historical Notes  
  
⸻  
  
**FINANCIAL FORMULAS**  
  
Category:  
  
Financial  
  
Examples:  
  
* Revenue  
* COGS  
* Gross Profit  
* Net Profit  
* Shipping Subsidy  
* Profit Margin  
* Cash Flow  
* Contribution Margin  
* Profit Per Delivered Order  
  
Financial formulas originate exclusively from the Financial Engine.  
  
⸻  
  
**INVENTORY FORMULAS**  
  
Category:  
  
Inventory  
  
Examples:  
  
* FIFO Cost  
* Inventory Value  
* Remaining Quantity  
* Average Inventory  
* Inventory Turnover  
* Days of Inventory  
* Dead Stock  
* Slow Moving Stock  
  
Inventory formulas originate exclusively from the Inventory Engine.  
  
⸻  
  
**MARKETING FORMULAS**  
  
Category:  
  
Marketing  
  
Examples:  
  
* Marketing Spend  
* True CPA  
* ROAS  
* ROI  
* Cost Per Delivered Order  
* Customer Acquisition Cost  
* Campaign Profitability  
  
Marketing formulas combine Financial Engine outputs with Marketing datasets.  
  
⸻  
  
**SHIPPING FORMULAS**  
  
Category:  
  
Shipping  
  
Examples:  
  
* Delivery Rate  
* Return Rate  
* Refusal Rate  
* Shipping Cost  
* Shipping Subsidy  
* Average Shipping Cost  
* Shipping Success Rate  
  
Shipping formulas consume approved shipment data only.  
  
⸻  
  
**SETTLEMENT FORMULAS**  
  
Examples:  
  
* Expected Settlement  
* Actual Settlement  
* Settlement Difference  
* Outstanding Settlement  
* Deduction Percentage  
  
Settlement formulas support financial reconciliation.  
  
⸻  
  
**AI FORMULAS**  
  
AI references formulas.  
  
AI never owns formulas.  
  
Examples:  
  
* Financial Health Score  
* Product Score  
* Campaign Score  
* Opportunity Score  
* Risk Score  
  
AI Scores remain explainable.  
  
⸻  
  
## END OF PART 1  
  
**\**  
  
**CONTINUATION OF 033_FORMULA_CATALOG.md**  
  
⸻  
  
**FORMULA DEPENDENCIES**  
  
Every Formula shall declare its dependencies.  
  
Example:  
  
Revenue  
  
↓  
  
COGS  
  
↓  
  
Gross Profit  
  
↓  
  
Net Profit  
  
↓  
  
Profit Margin  
  
Formula dependency graphs shall remain acyclic.  
  
Circular formula dependencies are prohibited.  
  
⸻  
  
**FORMULA VERSIONING**  
  
Every Formula shall support version history.  
  
Each version records:  
  
* Version Number  
* Effective Date  
* Change Description  
* Author  
* Business Reason  
  
Historical calculations continue using the Formula Version active at calculation time.  
  
⸻  
  
**FORMULA VALIDATION**  
  
Every Formula shall define validation rules.  
  
Examples:  
  
* Required Inputs  
* Allowed Input Ranges  
* Null Handling  
* Division by Zero Handling  
* Rounding Rules  
* Precision Rules  
  
Validation executes before Formula evaluation.  
  
⸻  
  
**ROUNDING POLICY**  
  
Financial calculations shall use consistent rounding.  
  
Recommended policy:  
  
Internal Calculations  
  
↓  
  
Maximum Precision  
  
↓  
  
Final Output  
  
↓  
  
Business Rounding  
  
Intermediate calculations should preserve precision.  
  
Only presentation values are rounded.  
  
⸻  
  
**NULL HANDLING**  
  
Each Formula shall document behavior when required inputs are unavailable.  
  
Possible behaviors:  
  
* Return Zero  
* Return Null  
* Raise Business Validation Error  
* Mark KPI Unavailable  
  
Behavior shall remain consistent across all consumers.  
  
⸻  
  
**EXAMPLE FORMULA ENTRY**  
  
Formula ID  
  
FIN-003  
  
Formula Name  
  
Gross Profit  
  
Purpose  
  
Measure profit before operating expenses.  
  
Inputs  
  
* Revenue  
* COGS  
  
Formula  
  
Gross Profit = Revenue − COGS  
  
Output  
  
Gross Profit  
  
Version  
  
1.0.0  
  
Dependencies  
  
Revenue  
  
COGS  
  
Related KPIs  
  
* Gross Profit  
* Gross Margin  
  
Business Owner  
  
Finance  
  
Repository References  
  
007_FINANCIAL_ENGINE.md  
  
009_FORMULA_ENGINE.md  
  
⸻  
  
**FORMULA INSPECTOR**  
  
Every Formula Catalog entry shall support Formula Inspector.  
  
Formula Inspector displays:  
  
* Formula Definition  
* Version  
* Inputs  
* Input Values  
* Intermediate Steps  
* Output  
* Source Records  
* Business Notes  
  
Every displayed KPI shall link to its Formula Catalog entry.  
  
⸻  
  
**SOURCE OF TRUTH**  
  
Every Formula shall explicitly reference its Source of Truth.  
  
Examples:  
  
Revenue  
  
↓  
  
Orders  
  
FIFO Cost  
  
↓  
  
Inventory Engine  
  
Marketing Spend  
  
↓  
  
Marketing Adapter  
  
Settlement Amount  
  
↓  
  
Settlement Records  
  
Formula inputs shall never be ambiguous.  
  
⸻  
  
**FORMULA OWNERSHIP**  
  
Every Formula has one Business Owner.  
  
Examples:  
  
Finance  
  
Inventory  
  
Marketing  
  
Shipping  
  
Operations  
  
Ownership determines approval authority for future Formula changes.  
  
⸻  
  
**FORMULA APPROVAL**  
  
Formula modifications require:  
  
Business Review  
  
↓  
  
Architectural Review  
  
↓  
  
Documentation Update  
  
↓  
  
Version Increment  
  
↓  
  
Implementation  
  
↓  
  
Testing  
  
↓  
  
Release  
  
Formula changes shall never bypass documentation.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
**CONTINUATION OF 033_FORMULA_CATALOG.md**  
  
⸻  
  
**FORMULA TEST REQUIREMENTS**  
  
Every Formula shall include automated validation.  
  
Required tests:  
  
* Standard Calculation  
* Boundary Values  
* Zero Values  
* Negative Values (where applicable)  
* Null Handling  
* Historical Compatibility  
* Precision Verification  
* Version Compatibility  
  
No Formula may enter production without passing all required tests.  
  
⸻  
  
**FORMULA CHANGE LOG**  
  
Every Formula shall preserve a permanent change history.  
  
Each change log entry records:  
  
* Formula ID  
* Previous Version  
* New Version  
* Change Description  
* Business Justification  
* Repository Reference  
* Approval Information  
* Release Version  
* Effective Date  
  
Formula history shall never be deleted.  
  
⸻  
  
**FORMULA CATEGORIES**  
  
Official categories include:  
  
Financial  
  
Inventory  
  
Marketing  
  
Shipping  
  
Settlement  
  
Analytics  
  
Executive  
  
AI Support  
  
Operational  
  
Each Formula belongs to exactly one primary category.  
  
⸻  
  
**FORMULA TAGS**  
  
Every Formula shall support searchable tags.  
  
Examples:  
  
Revenue  
  
Profit  
  
FIFO  
  
Inventory  
  
Shipping  
  
Marketing  
  
Settlement  
  
Cash Flow  
  
Executive KPI  
  
Tags improve discoverability.  
  
They never influence Formula execution.  
  
⸻  
  
**KPI RELATIONSHIPS**  
  
Each Formula shall document every KPI that depends on it.  
  
Example:  
  
Revenue  
  
↓  
  
Gross Profit  
  
↓  
  
Net Profit  
  
↓  
  
Profit Margin  
  
↓  
  
Financial Health Score  
  
Dependency trees shall remain visible through Formula Inspector.  
  
⸻  
  
**FORMULA SEARCH**  
  
The Formula Catalog shall support searching by:  
  
* Formula ID  
* Formula Name  
* Category  
* Business Owner  
* KPI  
* Tags  
* Repository Document  
  
The Formula Catalog is the central reference for every business calculation.  
  
⸻  
  
**FORMULA LOCALIZATION**  
  
Formula metadata shall support:  
  
English  
  
Arabic  
  
Localized fields include:  
  
* Formula Name  
* Business Description  
* Business Notes  
* Input Labels  
* Output Labels  
  
Formula expressions remain language independent.  
  
⸻  
  
**FUTURE FORMULA SUPPORT**  
  
The Formula architecture shall support future additions including:  
  
* Budget Formulas  
* Forecast Formulas  
* Purchasing Formulas  
* Supplier KPIs  
* Warehouse KPIs  
* Multi-Currency Calculations  
* Multi-Company Consolidation  
* Tax Calculations  
  
Future formulas shall integrate into the existing Formula Engine without redesign.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The Formula Catalog is considered complete only if:  
  
* Every KPI references exactly one Formula.  
* Every Formula has a permanent identifier.  
* Formula dependencies are documented.  
* Formula versions are preserved.  
* Formula Inspector can explain every Formula.  
* Formula validation is automated.  
* Source of Truth is explicitly documented.  
* Business ownership is assigned.  
* Historical calculations remain reproducible.  
* Future formulas can be added without architectural redesign.  
  
The Formula Catalog is the authoritative documentation of business calculations.  
  
It guarantees that every metric displayed by the platform is explainable, versioned, auditable, and reproducible.  
  
⸻  
  
**REGISTERED FORMULA ENTRIES**  
  
The following entries are fully approved and implementation-ready.  
  
⸻  
  
**FORMULA ENTRY FIN-003**  
  
Formula ID  
  
FIN-003  
  
Formula Name  
  
Gross Profit  
  
Purpose  
  
Measure profit before operating expenses.  
  
Business Meaning  
  
Revenue retained after subtracting the cost of goods sold. Excludes marketing,  
shipping, fixed expenses, variable expenses, and financial adjustments.  
  
Inputs  
  
* Revenue (Realized — Delivered orders only)  
* COGS (FIFO Cost from Inventory Engine)  
  
Formula Expression  
  
Gross Profit = Revenue − COGS  
  
Output  
  
Gross Profit (Decimal 18,4)  
  
Formula Version  
  
1.0.0  
  
Null Handling  
  
If Revenue is null or COGS is null: return null, mark KPI unavailable.  
  
Division by Zero  
  
Not applicable.  
  
Rounding  
  
Internal: full Decimal(18,4) precision. Presentation: 2 decimal places.  
  
Dependencies  
  
Revenue (FIN-001), COGS (INV-001)  
  
Related KPIs  
  
* Gross Profit  
* Gross Margin  
  
Business Owner  
  
Finance  
  
Source of Truth  
  
Financial Engine  
  
Repository References  
  
007_FINANCIAL_ENGINE.md, 009_FORMULA_ENGINE.md  
  
Example Calculation  
  
Revenue = 1,000 EGP, COGS = 400 EGP → Gross Profit = 600 EGP  
  
Historical Notes  
  
Present in repository as Example Formula Entry since v2.0.0.  
Registered as production entry: 2026-06-12.  
  
⸻  
  
**FORMULA ENTRY FIN-004**  
  
Formula ID  
  
FIN-004  
  
Formula Name  
  
Profit Contribution (Per Order Item)  
  
Purpose  
  
Measure the profitability contribution of each individual order item,  
attributing advertising and shipping costs exclusively to the Campaign Product  
that generated the order.  
  
Business Meaning  
  
Profit Contribution answers: "How much did this specific product line contribute  
to net profitability, after bearing the costs it actually caused?"  
Advertising and shipping are not spread across all items — they are owned entirely  
by the product that drove the order through a campaign.  
  
Business Decision Authority  
  
This formula was defined by explicit business owner decision on 2026-06-12.  
It is authoritative for the project from that date forward.  
  
Inputs  
  
* Realized Product Revenue  
  Source: Financial Engine (Revenue Events, post-Delivered)  
  
* FIFO Cost  
  Source: Inventory Engine (layer unitCost × quantityConsumed)  
  
* Advertising Cost  
  Source: Marketing Spend records linked to the order's campaign  
  Applied to Campaign Product only.  
  
* Actual Shipping Cost  
  Source: Bosta (005_SOURCE_OF_TRUTH_MATRIX — Actual Shipping Cost → Bosta)  
  Applied to Campaign Product only.  
  
* Product-Level Financial Adjustments  
  Source: Financial Adjustments linked to the specific order item  
  Applied to every product independently.  
  
Formula Expression  
  
FOR the Campaign / Primary Product in the order:  
  
  Profit Contribution =  
    Realized Product Revenue  
    − FIFO Cost  
    − Advertising Cost  
    − Actual Shipping Cost  
    ± Product-Level Financial Adjustments  
  
FOR every non-campaign product in the same order:  
  
  Profit Contribution =  
    Realized Product Revenue  
    − FIFO Cost  
    ± Product-Level Financial Adjustments  
  
EXCEPTION — Campaign Product absent from final delivered order:  
  
  If the campaign product is not present in the delivered order items,  
  Advertising Cost and Actual Shipping Cost remain at Order level  
  and must NOT be allocated to any product.  
  
Business Rules (authoritative)  
  
BR-FIN-004-01: Advertising Cost MUST NOT be distributed across all products.  
BR-FIN-004-02: Actual Shipping Cost MUST NOT be distributed across all products.  
BR-FIN-004-03: Both costs belong exclusively to the Campaign / Primary Product.  
BR-FIN-004-04: Campaign Product is identified by the Order's campaignId and  
               marketingSource fields.  
BR-FIN-004-05: If no Campaign Product is present, costs remain unallocated at  
               order level. No product receives advertising or shipping cost.  
  
Output  
  
Profit Contribution per Order Item (Decimal 18,4)  
Stored in: order_items.profitContribution  
  
Formula Version  
  
1.0.0  
  
Effective Date  
  
2026-06-12  
  
Null Handling  
  
* If Realized Product Revenue is null (order not Delivered): return null.  
* If FIFO Cost is null (inventory not yet consumed): return null.  
* If Advertising Cost is null for Campaign Product: treat as 0 (no active campaign spend).  
* If Financial Adjustments are absent: treat as 0.  
  
Division by Zero  
  
Not applicable.  
  
Rounding  
  
Internal: full Decimal(18,4) precision. Presentation: 2 decimal places.  
  
Dependencies  
  
* FIN-003 (Gross Profit) — shares Revenue and FIFO Cost inputs  
* INV-001 (FIFO Cost)  
* Marketing Spend records  
* Shipment records (Bosta)  
  
Related KPIs  
  
* Profit Contribution  
* Product Profitability  
* Campaign ROI  
* Order Profitability  
  
Business Owner  
  
Finance  
  
Source of Truth  
  
Financial Engine  
  
Repository References  
  
007_FINANCIAL_ENGINE.md  
008_INVENTORY_FIFO_ENGINE.md  
005_SOURCE_OF_TRUTH_MATRIX.md  
003_DATA_DICTIONARY.md (Term 009 — Order Item)  
  
Example Calculation  
  
Order contains: Product A (Campaign), Product B, Product C  
Advertising Cost = 120 EGP, Actual Shipping Cost = 80 EGP  
  
Product A (Campaign Product):  
  Revenue = 500, FIFO Cost = 200, Advertising = 120, Shipping = 80, Adjustments = 0  
  Profit Contribution = 500 − 200 − 120 − 80 ± 0 = 100 EGP  
  
Product B (non-campaign):  
  Revenue = 300, FIFO Cost = 120, Advertising = 0, Shipping = 0, Adjustments = 0  
  Profit Contribution = 300 − 120 ± 0 = 180 EGP  
  
Product C (non-campaign):  
  Revenue = 200, FIFO Cost = 80, Advertising = 0, Shipping = 0, Adjustments = 0  
  Profit Contribution = 200 − 80 ± 0 = 120 EGP  
  
Validation Rules  
  
* Campaign Product receives exactly 100% of order-level advertising and shipping cost.  
* Sum of all product-level advertising allocations must equal order advertising cost  
  (or zero if campaign product absent).  
* Sum of all product-level shipping allocations must equal order shipping cost  
  (or zero if campaign product absent).  
* Profit Contribution may be negative (loss-making product/order).  
* Realized Product Revenue must originate from a Delivered order (FR-001, BR-005).  
  
Historical Notes  
  
Formula defined by business owner decision on 2026-06-12.  
Pre-decision: profitContribution stored as null in order_items.  
Post-decision: populated by Financial Engine during Sprint 4 implementation.  
  
Formula Change Log  
  
Version 1.0.0 — 2026-06-12  
  First definition. Business owner decision.  
  Introduced campaign-product-exclusive cost attribution rule.  
  
⸻  
  
**END OF FILE**  
  
033_FORMULA_CATALOG_md.md  
  
Version: 2.1.0  
  
Status: FINAL  
  
Last Updated: 2026-06-12 — Added FIN-003 (registered), FIN-004 (Profit Contribution, new)  
