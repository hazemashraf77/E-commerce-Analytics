**000_CLAUDE_MASTER_INSTRUCTIONS.md**  
  
Version: 1.0.0  
Status: FINAL  
Priority: CRITICAL  
Read Order: 1 / All Documents  
  
⸻  
  
**DO NOT START IMPLEMENTATION BEFORE READING THIS ENTIRE REPOSITORY**  
  
This document has the highest priority in the entire project.  
  
Every document inside this repository depends on this file.  
  
This document overrides every other instruction unless another document explicitly states a higher priority for a specific business rule.  
  
The implementation MUST NOT begin until every document has been read and understood.  
  
⸻  
  
**PROJECT IDENTITY**  
  
This project is an enterprise-grade AI-powered E-Commerce Financial, Analytics, Inventory, Forecasting and Decision Operating System.  
  
This project is NOT a prototype.  
  
This project is NOT a demo.  
  
This project is NOT an MVP.  
  
This project is intended to become a production-ready software product.  
  
Every architectural decision must assume that the application will continue evolving for many years.  
  
⸻  
  
**PRIMARY OBJECTIVE**  
  
The objective is to build the most accurate financial and operational analytics platform possible for an e-commerce business.  
  
Accuracy has absolute priority over speed.  
  
Correctness has absolute priority over convenience.  
  
Business logic has absolute priority over UI effects.  
  
Maintainability has absolute priority over shortcuts.  
  
⸻  
  
**YOUR ROLE**  
  
You are NOT acting as a code generator.  
  
You are acting as an entire senior software engineering team composed of:  
  
* CTO  
* Software Architect  
* Backend Architect  
* Frontend Architect  
* Database Architect  
* Financial Systems Engineer  
* Inventory Systems Engineer  
* AI Engineer  
* Data Engineer  
* DevOps Engineer  
* QA Engineer  
* Security Engineer  
* UI/UX Architect  
  
Every decision must consider all of these perspectives before implementation.  
  
⸻  
  
**THINKING MODEL**  
  
Before implementing any feature you MUST understand:  
  
1. Business objective.  
2. Financial impact.  
3. Inventory impact.  
4. Reporting impact.  
5. AI impact.  
6. API impact.  
7. Database impact.  
8. Future scalability.  
9. Performance implications.  
10. Security implications.  
  
Only after understanding every aspect may implementation begin.  
  
⸻  
  
**IMPLEMENTATION PHILOSOPHY**  
  
Never implement code simply because it works.  
  
Implement software because it correctly models the business.  
  
Business correctness is the highest engineering goal.  
  
⸻  
  
**SINGLE SOURCE OF TRUTH**  
  
This repository is the only source of truth.  
  
Never invent requirements.  
  
Never infer undocumented business rules.  
  
Never simplify documented logic.  
  
If any ambiguity exists:  
  
DO NOT guess.  
  
Instead:  
  
* create an Extension Point,  
* isolate the uncertainty,  
* continue implementing everything else.  
  
⸻  
  
**FORBIDDEN ACTIONS**  
  
You MUST NEVER:  
  
* Invent business rules.  
* Add features not documented.  
* Remove documented features.  
* Simplify financial calculations.  
* Replace FIFO with Average Cost.  
* Change revenue recognition rules.  
* Ignore historical data.  
* Hardcode values.  
* Hardcode business logic.  
* Ignore edge cases.  
* Skip validation.  
* Hide calculations.  
* Ignore auditability.  
* Create placeholder production code.  
* Build temporary solutions.  
* Sacrifice correctness for performance.  
* Couple business logic directly to APIs.  
  
⸻  
  
**WHEN TO STOP**  
  
Immediately stop implementation if:  
  
* Two business rules conflict.  
* A required formula is undefined.  
* A required source of truth is unknown.  
* A database design would violate documented business rules.  
* An API cannot satisfy a mandatory requirement.  
  
Never silently choose an implementation.  
  
⸻  
  
**PROJECT PRIORITY PYRAMID**  
  
Always prioritize work in this exact order:  
  
1. Financial Accuracy  
2. Business Rules  
3. Inventory Accuracy  
4. Data Integrity  
5. Auditability  
6. Maintainability  
7. Scalability  
8. Reliability  
9. Security  
10. Performance  
11. User Experience  
12. Visual Design  
13. Animations  
  
If any conflict exists, higher priorities always win.  
  
⸻  
  
**NON-NEGOTIABLE PRINCIPLES**  
  
The following principles are immutable.  
  
They cannot be modified without explicit approval.  
  
* Revenue is recognized only after Delivered status.  
* FIFO inventory valuation is mandatory.  
* Expected Returns never restore inventory.  
* Physical Returned inventory restores stock.  
* Formula Inspector is mandatory for every calculated KPI.  
* Every calculation must be reproducible.  
* Every number must be explainable.  
* Every financial result must be auditable.  
* Every integration must use an Adapter Layer.  
* The dashboard must operate primarily from the local database.  
* APIs are synchronization sources, not live UI data providers.  
  
⸻  
  
**DEVELOPMENT QUALITY**  
  
Assume this software will be audited.  
  
Assume financial statements depend on this software.  
  
Assume investors will rely on dashboard numbers.  
  
Assume accountants will verify calculations.  
  
Assume business owners will make strategic decisions based on your outputs.  
  
Therefore:  
  
No approximation is acceptable where exact calculation is possible.  
  
No undocumented assumption is acceptable.  
  
No hidden logic is acceptable.  
  
Every implementation must be deterministic.  
  
⸻  
  
**DOCUMENT READING ORDER**  
  
Always read the repository in the documented order.  
  
Never skip documents.  
  
Never begin coding after reading only one file.  
  
The complete repository represents one unified specification.  
  
⸻  
  
**IMPLEMENTATION STRATEGY**  
  
Before writing production code:  
  
1. Read every specification document.  
2. Build an implementation plan.  
3. Validate architecture.  
4. Validate database design.  
5. Validate business rules.  
6. Validate financial formulas.  
7. Validate inventory flows.  
8. Validate synchronization strategy.  
9. Only then begin implementation.  
  
Never reverse this order.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 000_CLAUDE_MASTER_INSTRUCTIONS.md**  
  
⸻  
  
**ARCHITECTURAL PRINCIPLES**  
  
The architecture must remain modular.  
  
Every major business capability must be isolated into its own domain.  
  
Business logic must never be duplicated.  
  
Business logic must never exist inside UI components.  
  
Business logic must never exist inside API adapters.  
  
Business logic belongs only inside domain services.  
  
⸻  
  
**DOMAIN DRIVEN DESIGN**  
  
The application shall be divided into clearly separated domains.  
  
Expected domains include, but are not limited to:  
  
* Authentication  
* Stores  
* Products  
* Inventory  
* Orders  
* Shipments  
* Finance  
* Marketing  
* AI  
* Reporting  
* Forecasting  
* Integrations  
* Administration  
* Settings  
  
Every domain must be independently maintainable.  
  
Dependencies between domains must remain minimal.  
  
⸻  
  
**CLEAN ARCHITECTURE**  
  
Implementation must follow Clean Architecture principles.  
  
Dependencies always point inward.  
  
Presentation Layer must never know business rules.  
  
Database Layer must never contain business decisions.  
  
API Providers must never determine internal logic.  
  
External systems are replaceable.  
  
Internal business logic is permanent.  
  
⸻  
  
**API FIRST PRINCIPLE**  
  
The application is API-first.  
  
Every external platform must communicate only through adapters.  
  
Never allow application logic to depend on vendor-specific APIs.  
  
If an API changes, only its adapter should require modification.  
  
The remaining application must continue operating without modification.  
  
⸻  
  
**ADAPTER LAYER**  
  
Every integration must have its own adapter.  
  
Examples:  
  
* Bosta Adapter  
* Eazy Order Adapter  
* Meta Adapter  
* TikTok Adapter  
  
Adapters only translate data.  
  
Adapters never calculate business values.  
  
Adapters never calculate profit.  
  
Adapters never calculate inventory.  
  
Adapters never contain financial rules.  
  
⸻  
  
**INTERNAL CANONICAL MODEL**  
  
All external data must first be converted into a unified internal model.  
  
All calculations must use only the internal model.  
  
Never calculate directly from external API payloads.  
  
⸻  
  
**LOCAL DATABASE FIRST**  
  
The dashboard must never depend on live API responses.  
  
Workflow:  
  
External API  
  
↓  
  
Synchronization  
  
↓  
  
Local Database  
  
↓  
  
Business Engine  
  
↓  
  
Dashboard  
  
Never reverse this order.  
  
⸻  
  
**SYNCHRONIZATION PRINCIPLES**  
  
Synchronization must run in background.  
  
Users should never wait for API calls while browsing dashboards.  
  
Synchronization must support:  
  
* Incremental Sync  
* Retry  
* Resume  
* Idempotent Updates  
* Conflict Detection  
* Logging  
* Monitoring  
  
Synchronization must never duplicate records.  
  
Synchronization failures must never corrupt existing data.  
  
⸻  
  
**API RATE LIMITS**  
  
Assume every provider has rate limits.  
  
Design synchronization to minimize API usage.  
  
Never request complete historical data repeatedly.  
  
Prefer incremental updates.  
  
Batch requests whenever possible.  
  
⸻  
  
**TOKEN MANAGEMENT**  
  
Authentication tokens must never be hardcoded.  
  
Tokens must be stored securely.  
  
Support automatic refresh whenever providers allow it.  
  
Notify administrators before expiration whenever automatic refresh is unavailable.  
  
Never interrupt business operations because of an expired token without clear notification.  
  
⸻  
  
**MOCK DATA**  
  
Until production APIs become available:  
  
Generate realistic seeded data.  
  
Seed data must resemble real business activity.  
  
Include:  
  
* Multiple products  
* Multiple stores  
* Delivered orders  
* Returned orders  
* Refused orders  
* Exchanges  
* Refunds  
* Marketing campaigns  
* Shipping settlements  
* Monthly expenses  
  
Seed data exists only for development.  
  
Production implementation must replace it without code changes.  
  
⸻  
  
**CONFIGURATION**  
  
Business rules must never be hidden inside source code.  
  
Values likely to change should be configurable whenever appropriate.  
  
Examples include:  
  
* Tax rates  
* Currency formatting  
* Time zones  
* Synchronization frequency  
* Store settings  
  
Core business rules are NOT configurable.  
  
Financial logic is NOT configurable.  
  
FIFO behavior is NOT configurable.  
  
Revenue recognition rules are NOT configurable.  
  
⸻  
  
**ERROR HANDLING**  
  
Never ignore exceptions.  
  
Never silently fail.  
  
Errors must be:  
  
* Logged  
* Classified  
* Traceable  
* Recoverable whenever possible  
  
Business users should receive meaningful messages.  
  
Developers should receive complete diagnostic information.  
  
⸻  
  
**LOGGING**  
  
Every critical operation must be logged.  
  
Examples:  
  
* Synchronization  
* Inventory movements  
* Financial adjustments  
* Manual entries  
* AI recommendations  
* Configuration changes  
  
Logs must support auditing.  
  
⸻  
  
**AUDITABILITY**  
  
Every financial number must be explainable.  
  
Every inventory movement must be traceable.  
  
Every adjustment must identify:  
  
* Source  
* Timestamp  
* User  
* Reason  
* Previous Value  
* New Value  
  
Historical records must never be destroyed.  
  
Prefer immutable history over destructive updates.  
  
⸻  
  
## END OF PART 2  
  
  
**\**  
  
  
  
**CONTINUATION OF 000_CLAUDE_MASTER_INSTRUCTIONS.md**  
  
⸻  
  
**SECURITY PRINCIPLES**  
  
Security is mandatory.  
  
Never trade security for convenience.  
  
Never expose secrets.  
  
Never expose API keys.  
  
Never expose access tokens.  
  
Never expose internal identifiers.  
  
All sensitive information must remain encrypted whenever applicable.  
  
Use secure authentication practices.  
  
Assume the application will eventually support multiple administrators with different permission levels.  
  
⸻  
  
**PERMISSION MODEL**  
  
The system must be designed from the beginning to support Role-Based Access Control (RBAC).  
  
Although the first version may have a single administrator, the architecture must support future roles without redesign.  
  
Potential future roles include:  
  
* Owner  
* Administrator  
* Finance  
* Operations  
* Marketing  
* Warehouse  
* Read Only  
  
Authorization must be enforced on the backend.  
  
Frontend permissions are only for user experience.  
  
⸻  
  
**PERFORMANCE PRINCIPLES**  
  
Fast software is important.  
  
Correct software is mandatory.  
  
Never optimize before correctness.  
  
Optimize only after business logic is complete.  
  
Prefer efficient algorithms.  
  
Avoid unnecessary API calls.  
  
Avoid unnecessary database queries.  
  
Use pagination whenever datasets become large.  
  
Use caching where appropriate.  
  
Never cache financial calculations without proper invalidation rules.  
  
⸻  
  
**SCALABILITY**  
  
Assume the business will grow.  
  
The architecture must support:  
  
* Multiple Stores  
* Hundreds of Products  
* Hundreds of Thousands of Orders  
* Multiple Warehouses (future)  
* Additional Shipping Providers (future)  
* Additional Advertising Platforms (future)  
  
Never design around current size.  
  
Design around future growth.  
  
⸻  
  
**LOCALIZATION**  
  
Internationalization must be implemented from the beginning.  
  
The application must support:  
  
* English  
* Arabic  
  
Arabic must support proper RTL layout.  
  
English must support LTR layout.  
  
Never hardcode UI text.  
  
All UI strings must come from localization resources.  
  
Dates, currencies and numbers must respect localization settings.  
  
⸻  
  
**USER INTERFACE PRINCIPLES**  
  
The interface exists to help decision making.  
  
It must never overwhelm the user.  
  
Every page must answer business questions.  
  
Avoid unnecessary visual complexity.  
  
Every chart must have purpose.  
  
Every KPI must be actionable.  
  
Every dashboard should allow drill-down into supporting data.  
  
Consistency is more important than visual creativity.  
  
⸻  
  
**FORMULA INSPECTOR**  
  
Formula Inspector is a mandatory system component.  
  
Every calculated value displayed anywhere in the application must allow the user to inspect:  
  
* Formula  
* Inputs  
* Intermediate values  
* Source tables  
* Source records  
* Calculation explanation  
* Final output  
  
No hidden calculation is permitted.  
  
⸻  
  
**ARTIFICIAL INTELLIGENCE**  
  
AI is an assistant.  
  
AI is never the source of truth.  
  
Business rules always override AI.  
  
Financial calculations always override AI.  
  
AI recommendations must always explain:  
  
* Why  
* Based on which data  
* Confidence  
* Expected impact  
  
AI must never fabricate data.  
  
AI must never invent explanations.  
  
⸻  
  
**REPORTING**  
  
Reports must always be reproducible.  
  
Running the same report on identical data must always produce identical results.  
  
Historical reports must never change because of future inventory movements.  
  
Historical reports represent historical reality.  
  
⸻  
  
**DASHBOARD PHILOSOPHY**  
  
This application is not designed for operational order management.  
  
Operational activities remain inside:  
  
* Eazy Order  
* Bosta  
  
This application exists to answer strategic questions.  
  
Examples include:  
  
* Where is profit leaking?  
* Which products generate sustainable profit?  
* Which campaigns create real profit instead of cheap purchases?  
* Which governorates reduce profitability?  
* How much cash is expected?  
* Which inventory requires replenishment?  
  
Every dashboard must help answer business decisions.  
  
⸻  
  
**BUSINESS INTELLIGENCE**  
  
Every metric should be connected.  
  
Users should be able to navigate naturally from:  
  
Executive Dashboard  
  
↓  
  
Financial Dashboard  
  
↓  
  
Product  
  
↓  
  
Order  
  
↓  
  
Formula Inspector  
  
↓  
  
Raw Data  
  
The application should always allow progressive exploration.  
  
⸻  
  
**ORDER LOOKUP**  
  
Order Lookup exists for auditing.  
  
It does NOT exist to replace Eazy Order.  
  
The objective is to inspect financial impact.  
  
Order Lookup should summarize:  
  
* Revenue  
* Shipping  
* FIFO Cost  
* Profit  
* Marketing Attribution  
* Manual Adjustments  
* Exchanges  
* Refunds  
* Settlement Information  
  
Order Lookup is not an operational screen.  
  
⸻  
  
**SOURCE OF TRUTH**  
  
Every business entity has exactly one authoritative source.  
  
Never mix responsibilities.  
  
Examples:  
  
Order Lifecycle  
→ Eazy Order  
  
Shipment Status  
→ Bosta  
  
Actual Shipping Cost  
→ Bosta  
  
Inventory Cost  
→ Local Inventory Engine  
  
Marketing Spend  
→ Meta / TikTok  
  
Manual Financial Adjustments  
→ Local Financial Module  
  
Calculated Profit  
→ Financial Engine  
  
The Source of Truth Matrix document is authoritative.  
  
⸻  
  
## END OF PART 3  
  
  
**\**  
  
  
**CONTINUATION OF 000_CLAUDE_MASTER_INSTRUCTIONS.md**  
  
⸻  
  
**FINANCIAL CORRECTNESS POLICY**  
  
Financial correctness is the highest priority of this project.  
  
If there is any conflict between:  
  
* Performance  
* Simplicity  
* UI  
* AI  
* Financial Accuracy  
  
Financial Accuracy must always win.  
  
Never implement an approximation if an exact calculation is possible.  
  
Never simplify accounting logic.  
  
Never silently round values that affect business decisions.  
  
Use consistent rounding rules throughout the application.  
  
⸻  
  
**INVENTORY POLICY**  
  
Inventory is one of the core business assets.  
  
Inventory calculations must be deterministic.  
  
Inventory history must be preserved.  
  
Inventory movements must never disappear.  
  
Every inventory movement must contain:  
  
* Timestamp  
* Source  
* Reason  
* Quantity  
* Cost  
* Related Order  
* Related Shipment  
* Related Adjustment  
  
Inventory must always be reproducible.  
  
⸻  
  
**FIFO POLICY**  
  
FIFO is mandatory.  
  
Average Cost is forbidden.  
  
LIFO is forbidden.  
  
Weighted Average is forbidden.  
  
Every outgoing unit must consume inventory from the oldest available inventory layer.  
  
Returned inventory must restore its original FIFO layer whenever possible.  
  
Inventory valuation must always remain historically accurate.  
  
FIFO behavior must never change without explicit written approval.  
  
⸻  
  
**REVENUE RECOGNITION POLICY**  
  
Revenue must never be recognized before physical delivery.  
  
Confirmed orders do not generate realized revenue.  
  
Orders in progress do not generate realized revenue.  
  
Orders awaiting customer decision do not generate realized revenue.  
  
Revenue becomes realized only when the shipment reaches Delivered status according to the business rules.  
  
Forecasts may estimate future revenue.  
  
Forecasts must never be mixed with realized revenue.  
  
⸻  
  
**SHIPPING POLICY**  
  
Shipping charged to the customer is not the actual shipping expense.  
  
These are two independent financial values.  
  
The application must store:  
  
Customer Shipping Fee  
  
AND  
  
Actual Shipping Cost  
  
Separately.  
  
Actual Shipping Cost is the amount reported by Bosta.  
  
Shipping calculations must always use the actual Bosta shipping values.  
  
Shipping cost applies per order.  
  
Never multiply shipping by product quantity.  
  
⸻  
  
**SHIPPING SUBSIDY**  
  
The application must calculate Shipping Subsidy.  
  
Shipping Subsidy measures how much shipping cost is absorbed by the business.  
  
Formula:  
  
**Shipping Subsidy =**  
**Actual Shipping Cost**  
  
Shipping Charged To Customer  
  
The Formula Inspector must expose every value used.  
  
⸻  
  
**BOSTA RETURN POLICY**  
  
Expected Returns (مرتجعاتك العائدة)  
  
represent future expected returns.  
  
They DO NOT restore inventory.  
  
They DO NOT create inventory movements.  
  
They DO NOT affect FIFO.  
  
Returned (تم الاسترجاع)  
  
represents physically received inventory.  
  
Only this event restores inventory.  
  
Only this event creates inventory movements.  
  
Only this event updates FIFO.  
  
⸻  
  
**ORDER IMPORT POLICY**  
  
Orders originate from external APIs.  
  
Manual creation of ordinary customer orders is forbidden.  
  
Imported orders may be stored locally for:  
  
* Financial Analysis  
* Historical Reporting  
* Inventory Valuation  
* Forecasting  
* Audit  
* Formula Inspector  
* Order Lookup  
  
The local database is analytical.  
  
It is not intended to replace operational systems.  
  
⸻  
  
**MANUAL DATA ENTRY POLICY**  
  
Manual entry is allowed only for exceptional financial events.  
  
Examples include:  
  
* Post-delivery exchanges  
* Post-delivery refunds  
* External refunds  
* InstaPay payments  
* Financial compensations  
* Accounting adjustments  
  
Every manual entry must reference an existing Order ID whenever applicable.  
  
Every manual entry must be fully auditable.  
  
⸻  
  
**PRODUCT POLICY**  
  
A physical product may have multiple marketing names.  
  
Product aliases are mandatory.  
  
Examples:  
  
Meta Campaign Name  
  
TikTok Campaign Name  
  
Landing Page Name  
  
Internal Product Name  
  
All aliases must resolve to one canonical product.  
  
Financial calculations must always use the canonical product.  
  
⸻  
  
**CROSS SELL POLICY**  
  
Orders may contain multiple products.  
  
Cross-sell items are normal.  
  
Upsell items are normal.  
  
Additional quantities are normal.  
  
Every item contributes independently to:  
  
Revenue  
  
FIFO  
  
Inventory  
  
Profit  
  
Analytics  
  
⸻  
  
**MARKETING POLICY**  
  
Marketing platforms are independent.  
  
Support:  
  
Meta Ads  
  
TikTok Ads  
  
Future advertising platforms.  
  
Marketing attribution must remain extensible.  
  
CPA and True CPA are different metrics.  
  
Never mix them.  
  
⸻  
  
**TRUE CPA**  
  
True CPA is a business metric.  
  
It includes all actual costs required to generate a profitable delivered order.  
  
Never confuse advertising platform CPA with business True CPA.  
  
Formula definitions are documented inside the Financial Engine specification.  
  
⸻  
  
**CASH FLOW POLICY**  
  
Cash Flow is independent from Profit.  
  
Never mix cash movement with profit recognition.  
  
Cash Flow must represent actual money movement.  
  
Profit represents financial performance.  
  
The application must distinguish between both concepts at all times.  
  
⸻  
  
**SETTLEMENT POLICY**  
  
Bosta settlements are financial events.  
  
The application must reconcile:  
  
Expected Settlement  
  
Actual Settlement  
  
Differences  
  
Shipping  
  
Returns  
  
Deductions  
  
Every settlement must be auditable.  
  
⸻  
  
**MULTI STORE POLICY**  
  
The architecture must support multiple stores.  
  
Stores must remain logically isolated.  
  
The application must support:  
  
Per Store Reporting  
  
Combined Reporting  
  
Cross Store Analytics  
  
Without redesign.  
  
⸻  
  
## END OF PART 4  
  
  
**\**  
  
  
**CONTINUATION OF 000_CLAUDE_MASTER_INSTRUCTIONS.md**  
  
⸻  
  
**FORMULA ENGINE POLICY**  
  
The Formula Engine is one of the core engines of the platform.  
  
Every calculated value displayed anywhere in the application MUST be generated by the Formula Engine.  
  
Business logic must never calculate values directly inside:  
  
* UI Components  
* API Adapters  
* Database Queries  
* Dashboard Widgets  
  
All financial calculations belong exclusively inside the Financial Engine and Formula Engine.  
  
⸻  
  
**FORMULA TRANSPARENCY**  
  
Every formula must expose:  
  
* Formula Name  
* Business Purpose  
* Formula Expression  
* Input Variables  
* Source of Every Variable  
* Intermediate Calculations  
* Final Result  
* Timestamp  
* Formula Version  
  
The user must always be able to understand why a value exists.  
  
⸻  
  
**VERSIONING**  
  
Every business formula must support versioning.  
  
Future business rule changes must never invalidate historical reports.  
  
Historical reports must continue using the formula version that was active at the reporting date.  
  
⸻  
  
**DATA INTEGRITY**  
  
Never modify historical business events.  
  
If data changes:  
  
Create a new business event.  
  
Do not overwrite history.  
  
Historical information must remain reproducible.  
  
⸻  
  
**IMMUTABLE HISTORY**  
  
Financial history is immutable.  
  
Inventory history is immutable.  
  
Settlement history is immutable.  
  
AI recommendations are immutable after creation.  
  
Audit history is immutable.  
  
Never physically delete historical financial records.  
  
⸻  
  
**DECISION CENTER**  
  
The Decision Center is one of the most important modules.  
  
Its objective is not to display data.  
  
Its objective is to generate business decisions.  
  
Every recommendation must include:  
  
* Business Objective  
* Why  
* Expected Financial Impact  
* Confidence Level  
* Required Action  
* Priority  
* Supporting Data  
* Formula Inspector Link  
  
⸻  
  
**AI RECOMMENDATIONS**  
  
AI recommendations must never be generic.  
  
Every recommendation must be supported by actual business data.  
  
Examples:  
  
Correct:  
  
“Product A generated 42% lower profit than the category average because shipping subsidy increased by 31%.”  
  
Incorrect:  
  
“Consider improving your marketing.”  
  
⸻  
  
**FORECASTING**  
  
Forecasting is predictive.  
  
Forecasting must never modify historical values.  
  
Forecasts are isolated from realized financial results.  
  
Forecasts must always indicate:  
  
* Forecast Date  
* Forecast Model  
* Confidence  
* Assumptions  
* Expected Range  
  
Forecasts must never be presented as realized facts.  
  
⸻  
  
**SCENARIO SIMULATION**  
  
The application must support business simulations.  
  
Simulations must never modify production data.  
  
Examples:  
  
* Increase product price  
* Reduce CPA  
* Improve Delivery Rate  
* Reduce Return Rate  
* Increase Shipping Fee  
* Reduce Shipping Cost  
  
Simulation results must remain isolated.  
  
⸻  
  
**AUDIT LOG**  
  
Every critical action must be logged.  
  
Examples include:  
  
* Synchronization  
* Manual Adjustments  
* Inventory Changes  
* Configuration Changes  
* Login Events  
* AI Configuration Changes  
* Formula Updates  
  
Logs must be searchable.  
  
Logs must never be editable.  
  
⸻  
  
**MONITORING**  
  
The system must continuously monitor itself.  
  
Track:  
  
* API Status  
* Synchronization Status  
* Queue Status  
* Failed Jobs  
* Database Health  
* AI Status  
* Background Tasks  
  
Problems should be detected before users notice them.  
  
⸻  
  
**OBSERVABILITY**  
  
Every critical subsystem must expose health information.  
  
At minimum:  
  
* Healthy  
* Warning  
* Critical  
  
Provide sufficient diagnostics for troubleshooting.  
  
⸻  
  
**BACKUP POLICY**  
  
Business data must be recoverable.  
  
Support:  
  
* Scheduled Backups  
* Point-in-Time Recovery  
* Disaster Recovery Planning  
  
Backups must never interrupt normal operations.  
  
⸻  
  
**ERROR RECOVERY**  
  
Unexpected failures must never corrupt business data.  
  
If an operation cannot be completed:  
  
* Roll back safely.  
* Preserve consistency.  
* Notify the user appropriately.  
* Record the failure.  
  
Partial financial updates are forbidden.  
  
⸻  
  
**TESTING REQUIREMENTS**  
  
Testing is mandatory.  
  
Every business rule requires tests.  
  
Minimum required test categories:  
  
* Unit Tests  
* Integration Tests  
* Financial Calculation Tests  
* FIFO Tests  
* Synchronization Tests  
* Regression Tests  
* API Adapter Tests  
* Permission Tests  
* Localization Tests  
* Performance Tests  
  
No module is considered complete without passing all applicable tests.  
  
⸻  
  
**ACCEPTANCE CRITERIA**  
  
A module is complete only when:  
  
* Business Rules implemented.  
* Formula Inspector implemented.  
* Localization supported.  
* Permissions enforced.  
* Tests passing.  
* Performance acceptable.  
* Documentation updated.  
* No known blocking defects.  
  
Anything less is considered incomplete.  
  
⸻  
  
**DEFINITION OF DONE**  
  
Implementation is considered finished only when:  
  
* Production Ready  
* Fully Tested  
* Fully Documented  
* Auditable  
* Scalable  
* Maintainable  
* Secure  
* Localized  
* API Ready  
  
Code compilation alone does not represent completion.  
  
⸻  
  
**FUTURE COMPATIBILITY**  
  
Design every module assuming future support for:  
  
* Additional Shipping Providers  
* Additional Order Providers  
* Additional Advertising Platforms  
* Additional Payment Methods  
* Additional Warehouses  
* Additional AI Models  
  
Future growth must not require redesign.  
  
⸻  
  
**FINAL IMPLEMENTATION DIRECTIVE**  
  
This repository represents the contractual specification for the project.  
  
Implement exactly what is documented.  
  
Do not implement undocumented functionality.  
  
Do not remove documented functionality.  
  
When uncertainty exists:  
  
Pause.  
  
Document the issue.  
  
Create an Extension Point.  
  
Continue implementing unaffected modules.  
  
Never guess.  
  
Never improvise.  
  
Never sacrifice financial correctness.  
  
⸻  
  
**END OF FILE**  
  
000_CLAUDE_MASTER_INSTRUCTIONS.md  
  
Version 1.0.0  
  
Status: FINAL  
