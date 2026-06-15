**046_PROJECT_BIBLE.md**  
  
Version: 2.0.0  
  
Status: FINAL  
  
Priority: ABSOLUTE  
  
Read Order: MASTER DOCUMENT  
  
Depends On:  
  
ALL REPOSITORY DOCUMENTS  
  
⸻  
  
**PURPOSE**  
  
This document is the constitutional document of the repository.  
  
It defines:  
  
* Vision  
* Mission  
* Core Principles  
* Architectural Philosophy  
* Business Rules  
* Repository Governance  
* Claude Responsibilities  
* Development Standards  
  
Every implementation shall comply with this document.  
  
If any repository document appears to conflict,  
  
this document takes precedence unless a newer official revision explicitly states otherwise.  
  
⸻  
  
**PROJECT VISION**  
  
Build the most accurate, explainable, scalable, and AI-assisted analytics platform for e-commerce operations.  
  
The platform shall provide complete visibility into:  
  
* Finance  
* Inventory  
* Marketing  
* Shipping  
* Settlements  
* Business Performance  
* Decision Support  
  
Every business metric shall be explainable.  
  
Every business decision shall be supported by evidence.  
  
⸻  
  
**PROJECT MISSION**  
  
Provide business owners with a single platform capable of answering:  
  
* What happened?  
* Why did it happen?  
* What will probably happen?  
* What should I do next?  
* What happens if I change something?  
  
The platform transforms raw operational data into trusted business intelligence.  
  
⸻  
  
**CORE VALUES**  
  
The repository is built upon the following values:  
  
Business Correctness  
  
↓  
  
Explainability  
  
↓  
  
Consistency  
  
↓  
  
Determinism  
  
↓  
  
Auditability  
  
↓  
  
Scalability  
  
↓  
  
Performance  
  
↓  
  
Developer Experience  
  
Performance never overrides correctness.  
  
⸻  
  
**ARCHITECTURAL PHILOSOPHY**  
  
External Providers  
  
↓  
  
Canonical Data Model  
  
↓  
  
Business Engines  
  
↓  
  
Formula Engine  
  
↓  
  
Analytics Engine  
  
↓  
  
Dashboards  
  
↓  
  
Reports  
  
↓  
  
AI  
  
Every layer has exactly one responsibility.  
  
Business logic remains centralized.  
  
Presentation remains independent.  
  
⸻  
  
**BUSINESS PHILOSOPHY**  
  
Business rules are documented.  
  
Business rules are versioned.  
  
Business rules are tested.  
  
Business rules are deterministic.  
  
Business rules never depend on:  
  
* UI  
* Framework  
* Database  
* AI  
* External Providers  
  
Business rules define the platform.  
  
⸻  
  
**SINGLE SOURCE OF TRUTH**  
  
Every business value shall have one authoritative source.  
  
Examples:  
  
Orders  
  
↓  
  
Canonical Order Model  
  
Revenue  
  
↓  
  
Financial Engine  
  
Inventory Cost  
  
↓  
  
FIFO Engine  
  
Formula  
  
↓  
  
Formula Catalog  
  
KPI  
  
↓  
  
KPI Catalog  
  
Prompt  
  
↓  
  
AI Prompt Library  
  
No duplicate ownership is permitted.  
  
⸻  
  
**GOLDEN RULES**  
  
Business correctness has absolute priority.  
  
Business Engines own business logic.  
  
Formulas are documented before implementation.  
  
KPIs always reference Formulas.  
  
AI explains business.  
  
AI never invents business.  
  
Synchronization never bypasses validation.  
  
Historical records remain immutable.  
  
Repository documentation drives implementation.  
  
Implementation never defines architecture.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 046_PROJECT_BIBLE.md**  
  
⸻  
  
**BUSINESS ENGINES**  
  
The platform is built around independent Business Engines.  
  
Official engines include:  
  
* Financial Engine  
* Inventory FIFO Engine  
* Formula Engine  
* Analytics Engine  
* Synchronization Engine  
* AI Engine  
* Reporting Engine  
  
Every Business Engine:  
  
* Owns one business domain.  
* Is independently testable.  
* Is deterministic.  
* Is framework independent.  
  
Business Engines never communicate directly with UI components.  
  
⸻  
  
**AI PHILOSOPHY**  
  
AI exists to:  
  
* Explain  
* Analyze  
* Compare  
* Recommend  
* Forecast  
* Simulate  
  
AI shall never:  
  
* Invent KPIs  
* Invent Formulas  
* Modify Business Records  
* Override Business Rules  
* Execute irreversible business actions  
  
AI is an advisor.  
  
The Repository is the authority.  
  
⸻  
  
**DEVELOPMENT PHILOSOPHY**  
  
Development follows:  
  
Repository  
  
↓  
  
Architecture  
  
↓  
  
Business Engines  
  
↓  
  
Implementation  
  
↓  
  
Testing  
  
↓  
  
Documentation  
  
↓  
  
Deployment  
  
No implementation shall bypass repository governance.  
  
⸻  
  
**CLAUDE RESPONSIBILITIES**  
  
Claude shall:  
  
* Read Repository documents before implementation.  
* Respect documented architecture.  
* Preserve Business Rules.  
* Maintain type safety.  
* Update documentation when architecture changes.  
* Generate production-ready code.  
* Avoid undocumented assumptions.  
  
Claude shall never replace documented behavior with personal interpretation.  
  
⸻  
  
**CLAUDE PROHIBITIONS**  
  
Claude shall never:  
  
* Invent undocumented formulas.  
* Duplicate business logic.  
* Store synchronized business data manually.  
* Introduce circular dependencies.  
* Break deterministic calculations.  
* Ignore validation rules.  
* Expose sensitive information.  
* Modify repository governance without documentation.  
  
Repository compliance is mandatory.  
  
⸻  
  
**IMPLEMENTATION ORDER**  
  
Every implementation follows:  
  
Repository Review  
  
↓  
  
Business Analysis  
  
↓  
  
Architecture  
  
↓  
  
Database  
  
↓  
  
Business Engines  
  
↓  
  
API  
  
↓  
  
UI  
  
↓  
  
Testing  
  
↓  
  
Documentation  
  
↓  
  
Deployment  
  
Implementation order preserves architectural integrity.  
  
⸻  
  
**REPOSITORY GOVERNANCE**  
  
Every repository document shall have:  
  
* Version  
* Status  
* Read Order  
* Dependencies  
* Purpose  
* Success Criteria  
  
Repository documents are version-controlled architectural assets.  
  
⸻  
  
**CHANGE MANAGEMENT**  
  
Every architectural change requires:  
  
Business Justification  
  
↓  
  
Architectural Review  
  
↓  
  
Repository Update  
  
↓  
  
Implementation  
  
↓  
  
Testing  
  
↓  
  
Deployment  
  
Architecture evolves through documentation first.  
  
⸻  
  
**VERSIONING**  
  
The following artifacts are independently versioned:  
  
* Repository  
* Database  
* API  
* Formula Catalog  
* KPI Catalog  
* AI Prompt Library  
* Events  
* Application Releases  
  
Version history shall remain permanent.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
**CONTINUATION OF 046_PROJECT_BIBLE.md**  
  
⸻  
  
**REPOSITORY READING ORDER**  
  
Every implementation shall begin by understanding the Repository in the documented order.  
Every implementation shall begin by understanding the Repository in the documented order.  
  
Recommended sequence:  
Recommended sequence:  
  
1. Vision & Principles  
2. Canonical Data Model  
3. Business Engines  
4. Formula Engine  
5. Analytics Engine  
6. Dashboard Architecture  
7. Security  
8. API Architecture  
9. Technology Stack  
10. Implementation Standards  
11. Supporting Reference Documents  
  
Claude shall never implement isolated features without understanding their architectural context.  
Claude shall never implement isolated features without understanding their architectural context.  
  
⸻  
  
**BUSINESS CORRECTNESS**  
  
Business correctness is the highest architectural requirement.  
  
If a conflict exists between:  
If a conflict exists between:  
  
Performance  
Performance  
  
↓  
  
Convenience  
Convenience  
  
↓  
↓  
  
Developer Preference  
Developer Preference  
  
↓  
  
Business Correctness  
Business Correctness  
  
Business Correctness always wins.  
Business Correctness always wins.  
  
Every Business Engine shall produce deterministic results from identical inputs.  
  
⸻  
  
**TESTING PHILOSOPHY**  
  
Every implementation shall be validated through:  
Every implementation shall be validated through:  
  
* Unit Tests  
* Integration Tests  
* Formula Tests  
* Financial Validation  
* Inventory Validation  
* API Validation  
* End-to-End Tests  
  
Testing proves business correctness.  
  
Passing tests are required before production deployment.  
Passing tests are required before production deployment.  
  
⸻  
  
**DOCUMENTATION PHILOSOPHY**  
  
Documentation is part of the implementation.  
Documentation is part of the implementation.  
  
Every architectural change shall update:  
  
* Repository Documents  
* Formula Catalog  
* KPI Catalog  
* API Documentation  
* Change History  
  
Undocumented architecture does not officially exist.  
Undocumented architecture does not officially exist.  
  
⸻  
  
**FUTURE EVOLUTION**  
  
The Repository is designed to evolve safely.  
The Repository is designed to evolve safely.  
  
Future expansion may include:  
Future expansion may include:  
  
* Multi-Company Support  
* Multi-Warehouse Support  
* Multi-Currency  
* Purchasing  
* Supplier Management  
* Manufacturing  
* Forecasting  
* Budgeting  
* Public APIs  
* Mobile Applications  
* Advanced AI Capabilities  
  
Future features shall extend the architecture rather than replace it.  
Future features shall extend the architecture rather than replace it.  
  
⸻  
  
**MASTER SUCCESS CRITERIA**  
  
The Repository is considered complete only if:  
  
* Business Rules are fully documented.  
* Every Formula is explainable.  
* Every KPI references a documented Formula.  
* Every Business Engine has one responsibility.  
* Historical data remains reproducible.  
* AI remains evidence-based.  
* Security protects every business operation.  
* Documentation precedes implementation.  
* Architecture remains scalable and deterministic.  
* Future modules integrate without architectural redesign.  
  
⸻  
  
**FINAL ARCHITECTURAL PRINCIPLE**  
  
The Repository is the authoritative source of truth for the platform.  
The Repository is the authoritative source of truth for the platform.  
  
Business requirements define the architecture.  
  
Architecture defines the implementation.  
Architecture defines the implementation.  
  
Implementation follows the Repository.  
  
Never the reverse.  
Never the reverse.  
  
⸻  
  
**END OF FILE**  
  
046_PROJECT_BIBLE.md  
046_PROJECT_BIBLE.md  
  
Version: 2.0.0  
  
Status: FINAL  
Status: FINAL  
  
Priority: ABSOLUTE  
Priority: ABSOLUTE  
  
Repository Status: MASTER CONSTITUTION  
