**PROJECT_RULES.md**  
  
Version: 2.0.0  
  
Status: ACTIVE  
  
Priority: ABSOLUTE  
  
Document Type: Governance Document  
  
Repository Classification: Operations  
  
⸻  
  
**Purpose**  
  
This document defines the mandatory operational, engineering, architectural and business rules governing the implementation of the Enterprise E-Commerce Analytics Platform.  
  
Every implementation decision must comply with these rules.  
  
These rules are mandatory.  
  
No prompt, implementation detail, assumption, or AI reasoning may override them.  
  
⸻  
  
**Scope**  
  
These rules apply to:  
  
* Claude  
* AI Assistants  
* Developers  
* Future Contributors  
* Every Sprint  
* Every Feature  
* Every API  
* Every Formula  
* Every KPI  
* Every Database Change  
* Every Dashboard Component  
* Every Report  
  
⸻  
  
**Rule Classification**  
  
Rules are grouped into categories.  
  
CP = Core Principles  
  
ER = Engineering Rules  
  
BR = Business Rules  
  
FR = Financial Rules  
  
IR = Integration Rules  
  
AR = AI Rules  
  
TR = Testing Rules  
  
OR = Operational Rules  
  
⸻  
  
**Severity Levels**  
  
CRITICAL  
  
Violating these rules blocks implementation.  
  
HIGH  
  
Implementation must stop until resolved.  
  
MEDIUM  
  
Must be corrected before sprint completion.  
  
LOW  
  
Should be corrected during refactoring.  
  
⸻  
  
**====================================================**  
  
**PART I**  
  
**CORE PRINCIPLES**  
  
**====================================================**  
  
**CP-001 Repository is the Single Source of Truth**  
  
Repository documentation is the only authoritative source for:  
  
* Architecture  
* Business Rules  
* Financial Rules  
* Formula Definitions  
* KPI Definitions  
* Database Design  
* Workflow  
* Naming  
  
No implementation may contradict repository documentation.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-002 Never Invent Business Logic**  
  
Business logic must never be invented.  
  
If documentation is missing:  
  
STOP.  
  
Ask.  
  
Do not guess.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-003 Never Invent Formulas**  
  
No financial or analytical formula may be invented.  
  
Every formula must exist inside the Formula Catalog.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-004 Never Invent KPIs**  
  
Every KPI must originate from the KPI Catalog.  
  
No custom KPI may appear without repository approval.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-005 Repository Before Prompt**  
  
When a prompt conflicts with repository documentation:  
  
Repository wins.  
  
Always.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-006 Ask Instead of Guess**  
  
Whenever required information is unavailable:  
  
Ask.  
  
Never assume.  
  
Never estimate.  
  
Never hallucinate.  
  
Severity  
  
HIGH  
  
⸻  
  
**CP-007 Business Correctness Before Speed**  
  
Fast implementation is never more important than business correctness.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-008 Architecture Integrity**  
  
Architecture may never be modified without explicit approval.  
  
Suggested improvements are allowed.  
  
Automatic modifications are forbidden.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-009 Explainability**  
  
Every important decision must be explainable.  
  
Every Formula  
  
Every KPI  
  
Every Financial Calculation  
  
Every AI Recommendation  
  
must be explainable.  
  
Severity  
  
HIGH  
  
⸻  
  
**CP-010 Deterministic Behavior**  
  
Given identical inputs,  
  
the system must always produce identical outputs.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-011 Separation of Responsibilities**  
  
Business Logic  
  
Analytics  
  
Financial Calculations  
  
UI  
  
AI  
  
Infrastructure  
  
must remain separated.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-012 No Hidden Logic**  
  
Business logic may never exist:  
  
* inside UI  
* inside Dashboard  
* inside Reports  
* inside Components  
  
Business logic belongs only inside Business Engines.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-013 Repository Compliance**  
  
Every completed feature must comply with repository documentation.  
  
Implementation must report:  
  
Repository Compliance  
  
PASS  
  
before completion.  
  
Severity  
  
HIGH  
  
⸻  
  
**CP-014 Self Review Required**  
  
Before considering any task complete,  
  
perform a self-review.  
  
Check:  
  
* Rules  
* Architecture  
* Naming  
* Formula Usage  
* KPI Usage  
* Repository Compliance  
  
Severity  
  
HIGH  
  
⸻  
  
**CP-015 Documentation First**  
  
Implementation follows documentation.  
  
Documentation never follows implementation.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-016 No Silent Changes**  
  
Architectural changes,  
  
Business Rule changes,  
  
Financial changes,  
  
Formula changes,  
  
must always be documented.  
  
Severity  
  
HIGH  
  
⸻  
  
**CP-017 Canonical Model First**  
  
External data shall never directly enter Business Engines.  
  
All external providers must first become Canonical Models.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-018 Mock Before Integration**  
  
Missing APIs must never stop development.  
  
Use Mock Providers.  
  
Replace with Real Providers later.  
  
Severity  
  
HIGH  
  
⸻  
  
**CP-019 AI Is Advisory**  
  
AI may:  
  
Suggest  
  
Recommend  
  
Explain  
  
Analyze  
  
AI may NOT:  
  
Change Business Logic  
  
Change Architecture  
  
Invent Rules  
  
Invent Formulas  
  
Invent KPIs  
  
Severity  
  
CRITICAL  
  
⸻  
  
**CP-020 Project Quality Before Completion**  
  
A sprint is complete only when:  
  
Repository Compliance = PASS  
  
Architecture Review = PASS  
  
Self Review = PASS  
  
Required Tests = PASS  
  
Business Validation = PASS  
  
Severity  
  
CRITICAL  
  
⸻  
  
## End of Part I  
  
**\**  
  
**====================================================**  
  
**PART II**  
  
**ENGINEERING RULES**  
  
**====================================================**  
  
**ER-001 Business Logic Isolation**  
  
Rule  
  
Business logic shall exist only inside Business Engines.  
  
Never place business logic inside:  
  
* UI  
* Dashboard  
* Components  
* API Controllers  
* Reports  
  
Why  
  
Business logic must remain reusable, testable and deterministic.  
  
Severity  
  
CRITICAL  
  
Expected Behavior  
  
UI requests calculations.  
  
Business Engines perform calculations.  
  
⸻  
  
**ER-002 Dashboard Never Calculates**  
  
Rule  
  
Dashboards display results only.  
  
No KPI  
  
No Formula  
  
No Profit  
  
No Financial Calculation  
  
may be calculated inside dashboard components.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**ER-003 Formula Ownership**  
  
Rule  
  
Every formula shall exist in exactly one location.  
  
Duplicate implementations are forbidden.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**ER-004 Single Responsibility**  
  
Every module shall have one responsibility.  
  
Examples  
  
Financial Engine  
  
Inventory Engine  
  
Analytics Engine  
  
Shipping Engine  
  
AI Engine  
  
must remain independent.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-005 Strong Naming**  
  
Names must be:  
  
* explicit  
* descriptive  
* business oriented  
  
Forbidden  
  
data  
  
temp  
  
result  
  
test2  
  
value  
  
Good  
  
ProjectedProfit  
  
DeliveredRevenue  
  
PendingShippingCost  
  
Severity  
  
MEDIUM  
  
⸻  
  
**ER-006 No Magic Numbers**  
  
Hardcoded business numbers are forbidden.  
  
Business constants belong in configuration.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-007 Reusable Components**  
  
Every reusable UI component shall remain generic.  
  
Business calculations are forbidden inside reusable components.  
  
Severity  
  
MEDIUM  
  
⸻  
  
**ER-008 API Layer Isolation**  
  
Controllers validate requests.  
  
Controllers never perform business calculations.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-009 Database Independence**  
  
Business Engines must not depend directly on database implementation.  
  
Future database replacement shall require minimal changes.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-010 Error Transparency**  
  
Errors must be:  
  
Understandable  
  
Traceable  
  
Actionable  
  
Never hide failures.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-011 Logging**  
  
Every important operation shall generate structured logs.  
  
Especially:  
  
Financial updates  
  
Order synchronization  
  
Refunds  
  
Exchange operations  
  
AI recommendations  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-012 Configuration First**  
  
Environment specific values belong only inside configuration.  
  
Never hardcode:  
  
URLs  
  
Keys  
  
Secrets  
  
IDs  
  
Severity  
  
CRITICAL  
  
⸻  
  
**ER-013 Secure Defaults**  
  
Every new feature shall start with secure defaults.  
  
Public access is never assumed.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**ER-014 Code Simplicity**  
  
When two implementations achieve identical business results,  
  
choose the simpler one.  
  
Severity  
  
MEDIUM  
  
⸻  
  
**ER-015 Backward Compatibility**  
  
Repository updates shall avoid unnecessary breaking changes.  
  
If breaking changes are required,  
  
document them.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-016 Layer Communication**  
  
Allowed  
  
UI  
  
↓  
  
API  
  
↓  
  
Business Engine  
  
↓  
  
Repository  
  
↓  
  
Database  
  
Forbidden  
  
UI  
  
↓  
  
Database  
  
UI  
  
↓  
  
External API  
  
Dashboard  
  
↓  
  
Business Calculations  
  
Severity  
  
CRITICAL  
  
⸻  
  
**ER-017 Canonical Models**  
  
Business Engines consume Canonical Models only.  
  
Never provider-specific payloads.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**ER-018 Adapter Pattern**  
  
Every external service shall have its own Adapter.  
  
Examples  
  
Bosta Adapter  
  
Meta Adapter  
  
Shopify Adapter  
  
Future providers require new adapters only.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-019 Mock First**  
  
If external integration is unavailable,  
  
implement:  
  
Mock Provider  
  
Mock Responses  
  
Mock Tests  
  
Development must continue.  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-020 Zero External Dependency Development**  
  
Repository implementation shall never stop because:  
  
API unavailable  
  
Credentials unavailable  
  
Sandbox unavailable  
  
Internet unavailable  
  
Continue using mock implementations.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**ER-021 Explain Every Decision**  
  
Important architectural decisions shall include reasoning.  
  
Future developers must understand why.  
  
Severity  
  
MEDIUM  
  
⸻  
  
**ER-022 Repository Compliance Check**  
  
Every completed feature shall verify:  
  
Architecture  
  
Rules  
  
Business Logic  
  
Naming  
  
Security  
  
Repository Compliance  
  
PASS  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-023 Self Review**  
  
Before completion review:  
  
Business correctness  
  
Financial correctness  
  
Formula usage  
  
KPI usage  
  
Repository compliance  
  
Severity  
  
HIGH  
  
⸻  
  
**ER-024 No Temporary Solutions**  
  
Temporary implementations are forbidden unless explicitly documented.  
  
Severity  
  
MEDIUM  
  
⸻  
  
**ER-025 Production Mindset**  
  
Every implementation shall be written as production-ready software.  
  
Prototype quality is unacceptable.  
  
Severity  
  
HIGH  
  
⸻  
  
## End of Part II  
  
**\**  
  
**====================================================**  
  
**PART III**  
  
**BUSINESS & FINANCIAL GOVERNANCE**  
  
**====================================================**  
  
**BR-001 Business Rules are Immutable**  
  
Rule  
  
Business rules defined by the Repository are immutable.  
  
Implementation must never change business behavior to simplify code.  
  
Why  
  
Business requirements drive software, not the opposite.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**BR-002 Business Before Technology**  
  
Technology serves business requirements.  
  
Never modify business logic because a framework or library makes another solution easier.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**BR-003 Repository Formula Ownership**  
  
Every business calculation must reference a documented formula.  
  
Business Engines are the only place where formulas may execute.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**BR-004 Repository KPI Ownership**  
  
Every KPI must have:  
  
* Definition  
* Formula  
* Unit  
* Source  
* Purpose  
  
No undocumented KPI may exist.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**BR-005 Formula Explainability**  
  
Every formula must answer:  
  
What does it calculate?  
  
Why does it exist?  
  
Which inputs are required?  
  
Which Repository document defines it?  
  
Severity  
  
HIGH  
  
⸻  
  
**BR-006 KPI Explainability**  
  
Every KPI shown to users must explain:  
  
Definition  
  
Formula  
  
Business purpose  
  
Severity  
  
HIGH  
  
⸻  
  
**BR-007 Financial Safety**  
  
Financial calculations are never estimated.  
  
Every amount must originate from documented business rules.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-001 Revenue Recognition**  
  
Revenue is recognized only after successful delivery.  
  
New orders  
  
In-transit orders  
  
Returned orders  
  
Cancelled orders  
  
must never increase realized revenue.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-002 Projected vs Realized**  
  
Projected values and realized values must remain completely separated.  
  
Examples  
  
Projected Revenue  
  
≠  
  
Delivered Revenue  
  
Projected Profit  
  
≠  
  
Realized Profit  
  
Projected Shipping  
  
≠  
  
Actual Shipping  
  
Mixing them is forbidden.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-003 Profit Calculation**  
  
Profit must always include every documented cost.  
  
Examples  
  
COGS  
  
Shipping Cost  
  
Packaging  
  
Discounts  
  
Refunds  
  
Exchange Costs  
  
Compensation  
  
Marketing Cost  
  
Payment Fees  
  
Hidden costs are forbidden.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-004 Cash Flow Is Not Profit**  
  
Cash Flow  
  
Revenue  
  
Profit  
  
are independent concepts.  
  
Implementation must never treat them as identical.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-005 Shipping Accounting**  
  
Shipping fees paid by customers  
  
and  
  
actual shipping cost  
  
must remain separate values.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-006 Refund Accounting**  
  
Refunds never delete historical revenue.  
  
Refunds create financial adjustments.  
  
Historical data must remain auditable.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-007 Exchange Accounting**  
  
Exchange operations create independent financial events.  
  
Never overwrite original delivery history.  
  
Severity  
  
HIGH  
  
⸻  
  
**FR-008 Financial Auditability**  
  
Every financial value must be reproducible.  
  
If a number cannot be reproduced,  
  
the implementation fails.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-009 Historical Integrity**  
  
Historical financial records are immutable.  
  
Adjustments are appended.  
  
Never rewrite history.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-010 Formula Centralization**  
  
Financial formulas shall exist only inside Formula Engine.  
  
No duplicated calculations.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-011 Pending Liabilities**  
  
Future financial obligations must remain visible.  
  
Examples  
  
Pending Shipping  
  
Pending Refunds  
  
Pending Exchanges  
  
Pending Compensation  
  
Pending Marketing Costs  
  
Severity  
  
HIGH  
  
⸻  
  
**FR-012 Forecast Isolation**  
  
Forecasts never modify historical data.  
  
Forecasts remain simulations only.  
  
Severity  
  
HIGH  
  
⸻  
  
**FR-013 Scenario Simulation**  
  
Scenario simulations must never affect production data.  
  
Simulation is isolated.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**FR-014 Financial Precision**  
  
Currency calculations must preserve precision.  
  
Premature rounding is forbidden.  
  
Severity  
  
HIGH  
  
⸻  
  
**FR-015 Financial Traceability**  
  
Every financial figure must be traceable to:  
  
Order  
  
Adjustment  
  
Formula  
  
Repository Definition  
  
Severity  
  
CRITICAL  
  
⸻  
  
**BR-008 Source of Truth**  
  
Every business entity has one authoritative owner.  
  
Examples  
  
Orders  
  
Products  
  
Inventory  
  
Customers  
  
Marketing  
  
Shipping  
  
Formulas  
  
KPIs  
  
No duplicate ownership.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**BR-009 Manual Data Restrictions**  
  
Orders are synchronized from APIs.  
  
Manual order creation is forbidden unless explicitly documented.  
  
Manual adjustments are allowed only for:  
  
Refunds  
  
Exchanges  
  
Compensation  
  
Post-delivery corrections  
  
Severity  
  
HIGH  
  
⸻  
  
**BR-010 AI Business Restrictions**  
  
AI may explain business logic.  
  
AI may analyze business data.  
  
AI may recommend actions.  
  
AI may never modify business data automatically.  
  
Severity  
  
CRITICAL  
  
⸻  
  
## End of Part III  
  
**\**  
  
**====================================================**  
  
**PART IV**  
  
**INTEGRATION • AI • TESTING • SECURITY • DOCUMENTATION**  
  
**====================================================**  
  
**====================================================**  
  
**INTEGRATION RULES**  
  
**====================================================**  
  
**IR-001 External APIs Never Block Development**  
  
Rule  
  
Development shall continue regardless of external API availability.  
  
When APIs are unavailable:  
  
* Use Mock Providers  
* Use Mock Data  
* Continue implementation  
  
Severity  
  
CRITICAL  
  
⸻  
  
**IR-002 Adapter Layer Required**  
  
Every external provider must have its own Adapter Layer.  
  
Examples  
  
* Bosta Adapter  
* Meta Adapter  
* Shopify Adapter  
* WooCommerce Adapter  
  
Business Engines must never communicate directly with providers.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**IR-003 Canonical Data Model**  
  
All provider responses shall first be transformed into the Canonical Data Model.  
  
Business Engines consume Canonical Models only.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**IR-004 Replaceable Integrations**  
  
Replacing one shipping provider with another must not require Business Logic modifications.  
  
Only the Adapter Layer changes.  
  
Severity  
  
HIGH  
  
⸻  
  
**IR-005 Provider Independence**  
  
No provider-specific field names may exist inside Business Engines.  
  
Severity  
  
HIGH  
  
⸻  
  
**====================================================**  
  
**AI RULES**  
  
**====================================================**  
  
**AR-001 AI Is an Advisor**  
  
AI assists.  
  
AI explains.  
  
AI recommends.  
  
AI never owns business decisions.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**AR-002 AI Never Changes Data**  
  
AI shall never:  
  
Insert  
  
Delete  
  
Modify  
  
Approve  
  
financial or operational data automatically.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**AR-003 Explain Recommendations**  
  
Every recommendation must explain:  
  
* Why  
* Which data  
* Which KPI  
* Which Formula  
* Confidence  
  
Severity  
  
HIGH  
  
⸻  
  
**AR-004 Repository First**  
  
When Repository and AI reasoning disagree:  
  
Repository wins.  
  
Always.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**AR-005 Unknown Information**  
  
If Repository lacks information:  
  
AI asks.  
  
AI never invents.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**AR-006 Formula Transparency**  
  
AI must identify every formula used in an explanation.  
  
Severity  
  
HIGH  
  
⸻  
  
**AR-007 Confidence Declaration**  
  
Every prediction shall include:  
  
High  
  
Medium  
  
Low  
  
confidence.  
  
Severity  
  
MEDIUM  
  
⸻  
  
**====================================================**  
  
**TESTING RULES**  
  
**====================================================**  
  
**TR-001 Test Before Completion**  
  
No implementation is complete before testing.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**TR-002 Business Tests**  
  
Business Rules require dedicated tests.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**TR-003 Formula Tests**  
  
Every Formula shall have validation tests.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**TR-004 KPI Tests**  
  
Every KPI calculation shall be tested.  
  
Severity  
  
HIGH  
  
⸻  
  
**TR-005 Regression Safety**  
  
New implementations must never break existing functionality.  
  
Severity  
  
HIGH  
  
⸻  
  
**TR-006 Edge Cases**  
  
Edge cases shall be tested.  
  
Examples  
  
Zero Orders  
  
Refund Only  
  
Exchange Only  
  
100% Delivery Failure  
  
Negative Profit  
  
Severity  
  
HIGH  
  
⸻  
  
**TR-007 Mock Integration Tests**  
  
Mock Providers shall be tested exactly like production providers.  
  
Severity  
  
MEDIUM  
  
⸻  
  
**====================================================**  
  
**SECURITY RULES**  
  
**====================================================**  
  
**SR-001 Secrets**  
  
Secrets never appear inside source code.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**SR-002 API Keys**  
  
API Keys belong only inside environment configuration.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**SR-003 Least Privilege**  
  
Every integration receives minimum required permissions.  
  
Severity  
  
HIGH  
  
⸻  
  
**SR-004 Input Validation**  
  
All external inputs shall be validated.  
  
Severity  
  
HIGH  
  
⸻  
  
**SR-005 Financial Protection**  
  
Financial operations require explicit validation before execution.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**====================================================**  
  
**DOCUMENTATION RULES**  
  
**====================================================**  
  
**DR-001 Documentation Before Code**  
  
Repository documentation defines implementation.  
  
Implementation follows documentation.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**DR-002 Architecture Changes**  
  
Architecture modifications require documentation updates.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**DR-003 Formula Updates**  
  
Formula changes require Formula Catalog updates.  
  
Severity  
  
HIGH  
  
⸻  
  
**DR-004 KPI Updates**  
  
KPI changes require KPI Catalog updates.  
  
Severity  
  
HIGH  
  
⸻  
  
**DR-005 Changelog**  
  
Breaking architectural changes shall update CHANGELOG.md.  
  
Severity  
  
HIGH  
  
⸻  
  
**DR-006 Repository Integrity**  
  
Documentation shall never become inconsistent.  
  
One concept  
  
One definition  
  
One owner.  
  
Severity  
  
CRITICAL  
  
⸻  
  
**DR-007 Self Documentation**  
  
Complex implementations should explain themselves through:  
  
Clear naming  
  
Readable structure  
  
Minimal comments  
  
Severity  
  
MEDIUM  
  
**End of Part IV**  
  
**\**  
  
**====================================================**  
  
**PART V**  
  
**OPERATIONAL GOVERNANCE**  
  
**====================================================**  
  
**====================================================**  
  
**OPERATIONAL RULES**  
  
**====================================================**  
  
**OR-001 Repository Validation First**  
  
No implementation may begin before Repository Validation completes successfully.  
  
Severity  
  
CRITICAL  
CRITICAL  
  
⸻  
  
**OR-002 Repository Audit**  
  
Every Sprint shall begin with a Repository Audit.  
  
The implementation must verify:  
  
* Repository availability  
* Required documents  
* Relevant documents  
* Repository integrity  
  
Severity  
Severity  
  
CRITICAL  
CRITICAL  
  
⸻  
  
**OR-003 Sprint Planning**  
  
Every Sprint begins with:  
Every Sprint begins with:  
  
* Goal  
* Scope  
* Deliverables  
* Risks  
* Dependencies  
  
Severity  
Severity  
  
HIGH  
  
⸻  
  
**OR-004 One Sprint One Objective**  
  
Each Sprint should have a single clear objective.  
  
Avoid mixing unrelated features.  
  
Severity  
Severity  
  
MEDIUM  
MEDIUM  
  
⸻  
  
**OR-005 Review Before Completion**  
  
Every Sprint shall perform:  
  
* Self Review  
* Repository Compliance Review  
* Business Review  
* QA Review  
  
Severity  
  
HIGH  
HIGH  
  
⸻  
  
**OR-006 No Hidden Work**  
  
No undocumented implementation is allowed.  
No undocumented implementation is allowed.  
  
Severity  
Severity  
  
HIGH  
HIGH  
  
⸻  
  
**OR-007 Stop on Uncertainty**  
  
If implementation requires guessing:  
  
STOP.  
  
Ask.  
  
Do not continue.  
Do not continue.  
  
Severity  
Severity  
  
CRITICAL  
  
⸻  
  
**OR-008 Repository Compliance**  
  
Every completed Sprint shall explicitly declare:  
Every completed Sprint shall explicitly declare:  
  
Repository Compliance  
  
PASS  
PASS  
  
Severity  
Severity  
  
CRITICAL  
CRITICAL  
  
⸻  
  
**OR-009 Completion Report**  
  
Every Sprint shall finish with:  
  
Completed Features  
Completed Features  
  
Remaining Work  
Remaining Work  
  
Known Risks  
Known Risks  
  
Repository Compliance  
Repository Compliance  
  
Next Sprint Recommendation  
Next Sprint Recommendation  
  
Severity  
Severity  
  
MEDIUM  
MEDIUM  
  
⸻  
  
**====================================================**  
  
**ANTI-PATTERNS**  
  
**====================================================**  
  
The following are forbidden.  
The following are forbidden.  
  
❌ Business Logic inside UI  
❌ Business Logic inside UI  
  
❌ Dashboard Calculations  
❌ Dashboard Calculations  
  
❌ Duplicate Formulas  
❌ Duplicate Formulas  
  
❌ Duplicate KPI Definitions  
  
❌ Hardcoded Business Values  
❌ Hardcoded Business Values  
  
❌ Provider-Specific Logic inside Business Engines  
  
❌ Direct API Consumption  
  
❌ Hidden Financial Calculations  
❌ Hidden Financial Calculations  
  
❌ Historical Financial Modification  
  
❌ AI-generated Business Rules  
  
❌ AI-generated Financial Rules  
❌ AI-generated Financial Rules  
  
❌ Architecture Changes without Approval  
❌ Architecture Changes without Approval  
  
❌ Skipping Validation  
❌ Skipping Validation  
  
❌ Skipping Testing  
❌ Skipping Testing  
  
❌ Skipping Repository Audit  
  
⸻  
  
**====================================================**  
  
**DECISION FRAMEWORK**  
  
**====================================================**  
  
When uncertainty exists, follow this order.  
  
Repository  
Repository  
  
↓  
↓  
  
PROJECT_RULES  
PROJECT_RULES  
  
↓  
  
PROJECT_WORKFLOW  
PROJECT_WORKFLOW  
  
↓  
↓  
  
Repository Manifest  
Repository Manifest  
  
↓  
  
Repository Audit  
  
↓  
↓  
  
README  
README  
  
↓  
  
User Request  
User Request  
  
↓  
↓  
  
AI Reasoning  
  
If conflict exists,  
  
the higher priority wins.  
  
⸻  
  
**====================================================**  
  
**DEFINITION OF DONE**  
  
**====================================================**  
  
A task is complete only when:  
  
Repository Compliance  
  
PASS  
PASS  
  
Architecture Compliance  
Architecture Compliance  
  
PASS  
PASS  
  
Business Validation  
Business Validation  
  
PASS  
  
Formula Validation  
  
PASS  
PASS  
  
KPI Validation  
KPI Validation  
  
PASS  
  
Required Tests  
  
PASS  
PASS  
  
Security Validation  
Security Validation  
  
PASS  
  
Self Review  
Self Review  
  
PASS  
  
Documentation Updated (if required)  
  
PASS  
PASS  
  
No Critical Violations  
  
PASS  
PASS  
  
⸻  
  
**====================================================**  
  
**VIOLATION CLASSIFICATION**  
  
**====================================================**  
  
CRITICAL  
CRITICAL  
  
Implementation stops immediately.  
Implementation stops immediately.  
  
Examples  
Examples  
  
Business Rule violation  
  
Architecture violation  
Architecture violation  
  
Financial violation  
Financial violation  
  
Formula violation  
  
Repository violation  
Repository violation  
  
⸻  
  
HIGH  
HIGH  
  
Must be corrected before Sprint completion.  
Must be corrected before Sprint completion.  
  
Examples  
Examples  
  
Naming inconsistencies  
  
Repository warnings  
Repository warnings  
  
Missing tests  
Missing tests  
  
Incomplete documentation  
Incomplete documentation  
  
⸻  
  
MEDIUM  
  
Correct before Release.  
Correct before Release.  
  
Examples  
  
Formatting  
Formatting  
  
Minor refactoring  
Minor refactoring  
  
Non-critical improvements  
  
⸻  
  
LOW  
  
Can be corrected during maintenance.  
  
Examples  
  
Comment quality  
  
Readability improvements  
Readability improvements  
  
Documentation wording  
Documentation wording  
  
⸻  
  
**====================================================**  
  
**IMPLEMENTATION AUTHORITY**  
  
**====================================================**  
  
Claude shall:  
  
Explain  
Explain  
  
Recommend  
Recommend  
  
Implement  
Implement  
  
Review  
Review  
  
Test  
  
Document  
  
Claude shall never:  
  
Invent Business Rules  
  
Invent Financial Rules  
Invent Financial Rules  
  
Invent KPIs  
Invent KPIs  
  
Invent Formulas  
Invent Formulas  
  
Modify Repository  
  
Override Repository  
Override Repository  
  
Ignore Repository  
Ignore Repository  
  
Skip Validation  
Skip Validation  
  
Skip Testing  
Skip Testing  
  
Skip Review  
  
⸻  
  
**====================================================**  
  
**FINAL DECLARATION**  
  
**====================================================**  
  
This document governs every implementation inside the Enterprise E-Commerce Analytics Platform.  
  
Repository integrity has absolute priority.  
  
Business correctness has absolute priority.  
Business correctness has absolute priority.  
  
Financial correctness has absolute priority.  
  
Documentation governs implementation.  
  
Implementation never governs documentation.  
  
If uncertainty exists:  
If uncertainty exists:  
  
STOP.  
STOP.  
  
Ask.  
  
Never Guess.  
Never Guess.  
  
⸻  
  
END OF DOCUMENT  
