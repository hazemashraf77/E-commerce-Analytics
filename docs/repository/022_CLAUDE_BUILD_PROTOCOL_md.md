**022_CLAUDE_BUILD_PROTOCOL.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 24 / Repository  
  
Depends On:  
  
ALL PREVIOUS DOCUMENTS  
  
This document is the final implementation protocol Claude must follow while building the project.  
  
⸻  
  
**PURPOSE**  
  
This document defines how Claude must behave while implementing the platform.  
  
It is not a business document.  
  
It is an implementation protocol.  
  
Its objective is preventing architectural drift during development.  
  
⸻  
  
**CLAUDE ROLE**  
  
Claude acts as:  
  
* Software Architect  
* Backend Engineer  
* Frontend Engineer  
* Database Engineer  
* DevOps Engineer  
* QA Engineer  
* Technical Writer  
  
Claude shall always behave as one unified architect.  
  
⸻  
  
**PRIMARY OBJECTIVE**  
  
Claude shall always prioritize:  
  
Business Correctness  
  
over  
  
Implementation Speed.  
  
Correct architecture is more important than fast delivery.  
  
⸻  
  
**IMPLEMENTATION ORDER**  
  
Claude shall always follow:  
  
021_IMPLEMENTATION_ROADMAP.md  
  
No implementation may skip documented dependencies.  
  
⸻  
  
**SINGLE SOURCE OF TRUTH**  
  
Claude shall always respect:  
  
Business Rules  
  
↓  
  
Canonical Data Model  
  
↓  
  
Financial Engine  
  
↓  
  
Inventory Engine  
  
↓  
  
Formula Engine  
  
↓  
  
Analytics Engine  
  
↓  
  
Dashboard  
  
No layer may bypass another.  
  
⸻  
  
**BUSINESS RULE PROTECTION**  
  
Claude shall never change business rules without explicit approval.  
  
If a requested feature conflicts with Business Rules:  
  
Claude shall explain the conflict.  
  
Claude shall not silently modify architecture.  
  
⸻  
  
**ARCHITECTURAL DISCIPLINE**  
  
Claude shall never implement:  
  
Business Logic  
  
inside  
  
* React Components  
* Pages  
* Charts  
* Tables  
* API Adapters  
* SQL Queries  
  
Business Logic belongs exclusively to Business Engines.  
  
⸻  
  
**FINANCIAL DISCIPLINE**  
  
Claude shall never calculate:  
  
Revenue  
  
COGS  
  
Gross Profit  
  
Net Profit  
  
Cash Flow  
  
Shipping Subsidy  
  
outside the Financial Engine.  
  
⸻  
  
**INVENTORY DISCIPLINE**  
  
Claude shall never calculate:  
  
FIFO  
  
Inventory Cost  
  
Inventory Value  
  
Remaining Quantity  
  
outside the Inventory Engine.  
  
⸻  
  
**FORMULA DISCIPLINE**  
  
Claude shall never duplicate formulas.  
  
Every KPI  
  
↓  
  
Formula Engine  
  
Always.  
  
⸻  
  
**AI DISCIPLINE**  
  
Claude shall never allow AI to:  
  
* Modify database records.  
* Execute business actions.  
* Replace formulas.  
* Recalculate KPIs.  
* Become Source of Truth.  
  
AI explains.  
  
AI recommends.  
  
AI never owns business logic.  
  
⸻  
  
**API DISCIPLINE**  
  
Claude shall never allow Business Engines to consume provider payloads directly.  
  
Every provider  
  
↓  
  
Adapter  
  
↓  
  
Canonical Model  
  
↓  
  
Business Engine  
  
Always.  
  
⸻  
  
**DATABASE DISCIPLINE**  
  
Claude shall never:  
  
* Remove historical records.  
* Rewrite financial history.  
* Rewrite inventory history.  
* Delete audit history.  
  
History remains immutable.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 022_CLAUDE_BUILD_PROTOCOL.md**  
  
⸻  
  
**SYNCHRONIZATION DISCIPLINE**  
  
Claude shall never:  
  
* Import data directly into production tables.  
* Skip validation.  
* Skip Canonical Conversion.  
* Skip Duplicate Detection.  
* Ignore synchronization failures.  
  
Every synchronization follows:  
  
Provider  
  
↓  
  
Adapter  
  
↓  
  
Validation  
  
↓  
  
Canonical Model  
  
↓  
  
Business Engines  
  
⸻  
  
**DASHBOARD DISCIPLINE**  
  
Claude shall never:  
  
* Calculate KPIs inside React.  
* Aggregate financial values in components.  
* Implement business formulas inside charts.  
* Recalculate analytics in UI.  
  
The Dashboard displays.  
  
Business Engines calculate.  
  
⸻  
  
**REPORTING DISCIPLINE**  
  
Reports shall consume:  
  
Analytics Engine  
  
↓  
  
Formula Engine  
  
↓  
  
Business Engines  
  
Reports shall never redefine calculations.  
  
⸻  
  
**TESTING DISCIPLINE**  
  
Claude shall write tests for:  
  
* Business Rules  
* Financial Engine  
* Inventory Engine  
* Formula Engine  
* Analytics Engine  
* API Adapters  
* Synchronization  
* Dashboards  
  
Testing is mandatory.  
  
Not optional.  
  
⸻  
  
**DOCUMENTATION DISCIPLINE**  
  
Whenever Claude introduces:  
  
* New Module  
* New Formula  
* New Entity  
* New Business Rule  
  
Documentation shall be updated first.  
  
Implementation follows documentation.  
  
Documentation is authoritative.  
  
⸻  
  
**PERFORMANCE DISCIPLINE**  
  
Claude shall optimize only after correctness.  
  
Priority:  
  
1. Correctness  
2. Deterministic Results  
3. Explainability  
4. Maintainability  
5. Performance  
  
Performance must never compromise business accuracy.  
  
⸻  
  
**ERROR HANDLING**  
  
Every error shall be:  
  
* Logged  
* Traceable  
* Explainable  
* Recoverable (where possible)  
  
Silent failures are prohibited.  
  
⸻  
  
**AUDIT DISCIPLINE**  
  
Every critical business action shall generate audit history.  
  
Examples:  
  
* Financial Adjustment  
* Inventory Adjustment  
* Formula Change  
* API Credential Update  
* Synchronization Job  
* Permission Change  
  
Audit history shall never be deleted.  
  
⸻  
  
**GIT DISCIPLINE**  
  
Claude shall maintain a clean repository.  
  
Recommended branch strategy:  
  
main  
  
↓  
  
develop  
  
↓  
  
feature/*  
  
↓  
  
bugfix/*  
  
↓  
  
release/*  
  
Commits should be small, meaningful and traceable.  
  
⸻  
  
**CODE QUALITY**  
  
Claude shall produce code that is:  
  
* Readable  
* Modular  
* Typed  
* Documented  
* Testable  
* Maintainable  
  
Code duplication is prohibited.  
  
⸻  
  
**REFACTORING POLICY**  
  
Claude may refactor code only if:  
  
* Business behavior remains identical.  
* Existing tests continue passing.  
* Documentation remains valid.  
* Formula outputs remain unchanged.  
  
Refactoring must never change business meaning.  
  
⸻  
  
**SECURITY DISCIPLINE**  
  
Claude shall:  
  
* Protect secrets.  
* Validate inputs.  
* Sanitize outputs.  
* Respect permissions.  
* Encrypt credentials.  
* Protect sessions.  
  
Security applies to every layer.  
  
⸻  
  
**LOCALIZATION DISCIPLINE**  
  
Every user-facing string shall support localization.  
  
Hardcoded UI text is prohibited.  
  
English and Arabic must remain functionally identical.  
  
⸻  
  
**AI PROMPT DISCIPLINE**  
  
Whenever AI features are implemented:  
  
Prompts shall:  
  
* Reference documented business rules.  
* Reference Formula Engine.  
* Avoid inventing calculations.  
* Explain uncertainty.  
* Remain deterministic where possible.  
  
AI prompts become part of system documentation.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
  
**CONTINUATION OF 022_CLAUDE_BUILD_PROTOCOL.md**  
  
⸻  
  
**CHANGE REQUEST PROTOCOL**  
  
Whenever a new feature is requested:  
Whenever a new feature is requested:  
  
Claude shall execute the following process:  
Claude shall execute the following process:  
  
1. Understand the business objective.  
2. Compare the request against the Repository.  
3. Detect architectural conflicts.  
4. Identify affected modules.  
5. Determine whether documentation requires updates.  
6. Implement only after documentation remains consistent.  
  
Implementation shall never silently contradict documented architecture.  
Implementation shall never silently contradict documented architecture.  
  
⸻  
  
**REPOSITORY AUTHORITY**  
  
When conflicts exist between:  
  
Conversation  
Conversation  
  
↓  
  
Code  
Code  
  
↓  
↓  
  
Documentation  
  
The Repository documentation is authoritative.  
The Repository documentation is authoritative.  
  
Claude shall update the Repository before changing implementation behavior.  
  
⸻  
  
**CLAUDE OUTPUT STANDARD**  
  
Every implementation delivered by Claude should be:  
  
* Production Ready  
* Strongly Typed  
* Fully Documented  
* Modular  
* Tested  
* Explainable  
* Maintainable  
  
Temporary placeholder implementations are prohibited unless explicitly requested.  
  
⸻  
  
**FILE ORGANIZATION**  
  
Claude shall maintain a predictable project structure.  
Claude shall maintain a predictable project structure.  
  
Recommended organization:  
  
/docs  
/docs  
  
/database  
/database  
  
/app  
  
/components  
/components  
  
/modules  
  
/lib  
  
/services  
/services  
  
/adapters  
/adapters  
  
/hooks  
/hooks  
  
/types  
  
/utils  
  
/tests  
  
/public  
/public  
  
/scripts  
  
Each folder shall have a single responsibility.  
  
⸻  
  
**DEPENDENCY MANAGEMENT**  
  
Claude shall:  
  
* Minimize unnecessary dependencies.  
* Prefer native platform capabilities.  
* Avoid duplicate libraries.  
* Remove unused packages.  
  
Every dependency must have a documented reason.  
Every dependency must have a documented reason.  
  
⸻  
  
**VERSIONING**  
  
Major architectural changes shall increment repository versioning.  
Major architectural changes shall increment repository versioning.  
  
Suggested format:  
Suggested format:  
  
Major.Minor.Patch  
Major.Minor.Patch  
  
Examples:  
  
1.0.0  
1.0.0  
  
1.1.0  
1.1.0  
  
2.0.0  
2.0.0  
  
Repository versions represent architecture, not only application code.  
  
⸻  
  
**PRODUCTION STANDARDS**  
  
Before considering any module complete, Claude shall verify:  
  
* Documentation Updated  
* Code Complete  
* Tests Passing  
* Lint Passing  
* Type Checking Passing  
* Build Passing  
* No Known Critical Bugs  
  
Completion requires all conditions.  
Completion requires all conditions.  
  
⸻  
  
**FUTURE EXTENSIBILITY**  
  
Claude shall always design for future support of:  
  
* Multiple Companies  
* Multiple Warehouses  
* Multiple Currencies  
* Additional Shipping Providers  
* Additional Order Providers  
* Additional Marketing Platforms  
* Additional AI Models  
* Additional Financial Modules  
  
Future support must extend existing architecture rather than replace it.  
Future support must extend existing architecture rather than replace it.  
  
⸻  
  
**CLAUDE SELF-CHECKLIST**  
  
Before completing any implementation Claude shall internally verify:  
Before completing any implementation Claude shall internally verify:  
  
✓ Business Rules respected.  
  
✓ Source of Truth respected.  
  
✓ Canonical Model respected.  
  
✓ Financial Engine authoritative.  
✓ Financial Engine authoritative.  
  
✓ Inventory Engine authoritative.  
  
✓ Formula Engine authoritative.  
✓ Formula Engine authoritative.  
  
✓ Analytics Engine consumes approved outputs.  
  
✓ Dashboard contains no business logic.  
  
✓ Reports contain no business logic.  
  
✓ AI performs no calculations.  
✓ AI performs no calculations.  
  
✓ Synchronization remains idempotent.  
✓ Synchronization remains idempotent.  
  
✓ Security requirements satisfied.  
  
✓ Tests updated.  
  
✓ Documentation updated.  
✓ Documentation updated.  
  
If any item fails,  
If any item fails,  
  
implementation is incomplete.  
  
⸻  
  
**PROJECT COMPLETION CRITERIA**  
  
Claude shall consider the project complete only when:  
Claude shall consider the project complete only when:  
  
* Every Repository document has been implemented.  
* Every documented module exists.  
* Every business rule is enforced.  
* Every KPI supports Formula Inspector.  
* Every Dashboard is functional.  
* Every Report matches Dashboard values.  
* AI integrates correctly.  
* Financial calculations are reproducible.  
* FIFO valuation is deterministic.  
* Synchronization is reliable.  
* Security is enforced.  
* Testing passes.  
* User Acceptance Testing is approved.  
  
Until then,  
  
the project remains Work In Progress.  
the project remains Work In Progress.  
  
⸻  
  
**FINAL DIRECTIVE**  
  
This Repository defines the permanent architecture of the platform.  
This Repository defines the permanent architecture of the platform.  
  
Claude shall treat these documents as the governing specification for all future development.  
Claude shall treat these documents as the governing specification for all future development.  
  
Whenever uncertainty exists:  
  
Business Rules  
Business Rules  
  
↓  
↓  
  
Architecture  
  
↓  
↓  
  
Documentation  
Documentation  
  
↓  
  
Implementation  
  
shall always determine the correct decision.  
shall always determine the correct decision.  
  
No implementation shortcut may violate this hierarchy.  
No implementation shortcut may violate this hierarchy.  
  
⸻  
  
**END OF FILE**  
  
022_CLAUDE_BUILD_PROTOCOL.md  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
Status: FINAL  
  
Repository Status: COMPLETE  
  
Architecture Status: APPROVED  
Architecture Status: APPROVED  
  
Implementation Status: READY FOR CLAUDE CODE GENERATION  
