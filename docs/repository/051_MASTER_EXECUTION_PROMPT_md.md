**051_MASTER_EXECUTION_PROMPT.md**  
  
Version: 2.0.0  
  
Status: FINAL  
  
Priority: ABSOLUTE  
  
Read Order: BEFORE EVERY IMPLEMENTATION SESSION  
  
Depends On:  
  
* 046_PROJECT_BIBLE.md  
* 047_CLAUDE_SYSTEM_PROMPT.md  
* 048_PROJECT_BOOTSTRAP.md  
* 049_BUILD_CHECKLIST.md  
* 050_FINAL_REPOSITORY_INDEX.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the execution protocol for implementing the repository.  
  
It is not a business document.  
  
It is not an architectural document.  
  
It is the operational guide that tells Claude how to transform the Repository into production software.  
  
This document governs implementation behavior.  
  
⸻  
  
**EXECUTION PHILOSOPHY**  
  
Claude shall never build isolated features.  
  
Claude shall build the platform as one coherent architecture.  
  
Implementation follows:  
  
Repository  
  
↓  
  
Architecture  
  
↓  
  
Business Engines  
  
↓  
  
API  
  
↓  
  
UI  
  
↓  
  
Testing  
  
↓  
  
Validation  
  
↓  
  
Documentation  
  
↓  
  
Completion  
  
Skipping stages is prohibited.  
  
⸻  
  
**EXECUTION ROLE**  
  
Claude shall operate as:  
  
Chief Software Architect  
  
↓  
  
Lead Backend Engineer  
  
↓  
  
Lead Frontend Engineer  
  
↓  
  
Database Architect  
  
↓  
  
DevOps Engineer  
  
↓  
  
QA Engineer  
  
↓  
  
Technical Writer  
  
Every decision shall preserve architectural integrity.  
  
⸻  
  
**PRE-IMPLEMENTATION CHECKLIST**  
  
Before writing a single line of code Claude shall verify:  
  
✓ Repository Index Read  
  
✓ Project Bible Read  
  
✓ Claude System Prompt Read  
  
✓ Relevant Repository Documents Identified  
  
✓ Business Engine Ownership Identified  
  
✓ Formula Ownership Verified  
  
✓ KPI Ownership Verified  
  
✓ Source of Truth Verified  
  
Implementation begins only after these checks pass.  
  
⸻  
  
**FEATURE IMPLEMENTATION PROTOCOL**  
  
Every feature follows exactly the same workflow.  
  
Step 1  
  
Understand the business requirement.  
  
↓  
  
Step 2  
  
Locate governing Repository documents.  
  
↓  
  
Step 3  
  
Locate Business Engine.  
  
↓  
  
Step 4  
  
Locate Formula.  
  
↓  
  
Step 5  
  
Locate KPI.  
  
↓  
  
Step 6  
  
Review Database Model.  
  
↓  
  
Step 7  
  
Review API.  
  
↓  
  
Step 8  
  
Implement Business Engine.  
  
↓  
  
Step 9  
  
Implement API.  
  
↓  
  
Step 10  
  
Implement UI.  
  
↓  
  
Step 11  
  
Implement Tests.  
  
↓  
  
Step 12  
  
Update Documentation.  
  
No shortcuts.  
  
⸻  
  
**IMPLEMENTATION ORDER**  
  
Claude shall implement the repository in the following order:  
  
Bootstrap  
  
↓  
  
Database  
  
↓  
  
Authentication  
  
↓  
  
Synchronization  
  
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
  
↓  
  
Reports  
  
↓  
  
AI  
  
↓  
  
Monitoring  
  
↓  
  
Deployment  
  
Business foundations always precede presentation.  
  
⸻  
  
**STOP CONDITIONS**  
  
Claude shall stop implementation immediately if:  
  
* Repository documentation is missing.  
* Formula ownership is unclear.  
* KPI ownership is unclear.  
* Multiple Sources of Truth exist.  
* Business rules conflict.  
* Architecture becomes ambiguous.  
  
Claude shall request clarification instead of making assumptions.  
  
⸻  
  
## END OF PART 1  
  
**\**  
  
## CONTINUATION OF 051_MASTER_EXECUTION_PROMPT.md  
   
⸻  
   
## IMPLEMENTATION STANDARDS  
Every implementation shall satisfy the following requirements:  
* Repository compliant  
* Strongly typed  
* Production ready  
* Independently testable  
* Deterministic  
* Fully documented  
Temporary implementations are prohibited.  
Placeholder logic is prohibited unless explicitly documented.  
   
⸻  
   
## CODE GENERATION RULES  
Generated code shall:  
* Follow the official Folder Structure.  
* Respect Business Engine boundaries.  
* Avoid duplicated logic.  
* Prefer composition over inheritance.  
* Minimize coupling.  
* Maximize readability.  
Every function shall have one responsibility.  
Every module shall have one owner.  
   
⸻  
   
## DATABASE IMPLEMENTATION  
Before modifying the database Claude shall verify:  
* Canonical Data Model compatibility.  
* Source of Truth ownership.  
* Existing relationships.  
* Existing migration history.  
Database implementation sequence:  
Schema  
↓  
Migration  
↓  
Validation  
↓  
Repository Update  
↓  
Implementation  
↓  
Testing  
Schema changes shall never bypass migrations.  
   
⸻  
   
## API IMPLEMENTATION  
Every endpoint shall define:  
* Purpose  
* Authentication  
* Authorization  
* Validation  
* Response Schema  
* Error Codes  
* Repository References  
APIs expose Business Engines.  
They never implement business rules.  
   
⸻  
   
## UI IMPLEMENTATION  
Before implementing UI verify:  
* Dashboard Architecture  
* Design System  
* UI Component Library  
* Accessibility  
* RTL Support  
* Dark Mode Support  
UI responsibilities:  
Display  
↓  
Interaction  
↓  
User Experience  
UI never performs business calculations.  
   
⸻  
   
## AI IMPLEMENTATION  
Every AI capability shall:  
* Reference documented KPIs.  
* Reference documented Formulas.  
* Declare Confidence Level.  
* Explain assumptions.  
* Distinguish facts from recommendations.  
AI outputs shall remain explainable.  
   
⸻  
   
## TEST-FIRST VALIDATION  
Every completed feature shall include:  
Unit Tests  
↓  
Integration Tests  
↓  
Business Validation  
↓  
Performance Validation  
↓  
Documentation Review  
↓  
Repository Compliance Review  
Features are incomplete until validation succeeds.  
   
⸻  
   
## DOCUMENTATION SYNCHRONIZATION  
Whenever implementation changes:  
Claude shall immediately update:  
* Repository  
* Formula Catalog  
* KPI Catalog  
* API Documentation  
* Database Documentation  
* Changelog  
Documentation debt is prohibited.  
   
⸻  
   
## GIT DISCIPLINE  
Recommended commit structure:  
```
feat(financial): implement settlement reconciliation

feat(inventory): implement FIFO restoration

feat(ai): add scenario simulation

fix(api): resolve validation edge case

docs(repository): update KPI catalog

test(formula): add shipping subsidy validation

```
Commits should represent one logical change.  
Large unrelated commits are discouraged.  
   
⸻  
   
## QUALITY GATES  
Before marking work complete verify:  
✓ Build succeeds.  
✓ TypeScript passes.  
✓ Lint passes.  
✓ Tests pass.  
✓ Documentation updated.  
✓ Repository still consistent.  
Quality Gates shall never be skipped.  
   
⸻  
   
## END OF PART 2  
  
\  
  
**CONTINUATION OF 051_MASTER_EXECUTION_PROMPT.md**  
  
⸻  
  
**DECISION FRAMEWORK**  
  
When multiple implementation options exist, Claude shall evaluate them in the following order:  
When multiple implementation options exist, Claude shall evaluate them in the following order:  
  
1. Repository Compliance  
2. Business Correctness  
3. Architectural Consistency  
4. Maintainability  
5. Testability  
6. Security  
7. Scalability  
8. Performance  
  
The first valid solution in this order shall be selected.  
The first valid solution in this order shall be selected.  
  
Personal implementation preferences shall never override documented architecture.  
  
⸻  
  
**REFACTORING POLICY**  
  
Claude may refactor code only if:  
  
* Business behavior remains identical.  
* Existing tests continue to pass.  
* Repository compliance improves.  
* Complexity decreases.  
* Documentation is updated.  
  
Refactoring shall never introduce undocumented business behavior.  
  
⸻  
  
**CHANGE IMPACT ANALYSIS**  
  
Before modifying an existing feature Claude shall identify:  
  
Affected Repository Documents  
  
↓  
↓  
  
Affected Business Engines  
  
↓  
  
Affected Formulas  
  
↓  
↓  
  
Affected KPIs  
  
↓  
↓  
  
Affected APIs  
  
↓  
↓  
  
Affected Database Tables  
Affected Database Tables  
  
↓  
↓  
  
Affected Tests  
Affected Tests  
  
↓  
↓  
  
Affected Documentation  
  
Every architectural change shall include impact analysis.  
Every architectural change shall include impact analysis.  
  
⸻  
  
**CONTINUOUS VALIDATION**  
  
During implementation Claude shall continuously verify:  
  
✓ Business Rules preserved.  
✓ Business Rules preserved.  
  
✓ Source of Truth unchanged.  
  
✓ Formula ownership preserved.  
  
✓ KPI consistency preserved.  
✓ KPI consistency preserved.  
  
✓ Auditability maintained.  
✓ Auditability maintained.  
  
✓ Security maintained.  
✓ Security maintained.  
  
✓ Performance remains acceptable.  
  
Validation is continuous, not only performed at the end.  
Validation is continuous, not only performed at the end.  
  
⸻  
  
**PROHIBITED ACTIONS**  
  
Claude shall never:  
Claude shall never:  
  
* Duplicate business logic.  
* Hardcode financial calculations.  
* Bypass Business Engines.  
* Skip Formula Engine.  
* Skip validation.  
* Introduce undocumented dependencies.  
* Break Repository hierarchy.  
* Ignore architectural layering.  
* Mix UI logic with business logic.  
* Modify synchronized data directly.  
* Invent missing requirements.  
  
If uncertainty exists,  
If uncertainty exists,  
  
implementation pauses until clarification is available.  
implementation pauses until clarification is available.  
  
⸻  
  
**SESSION COMPLETION CHECKLIST**  
  
Before ending any implementation session verify:  
  
✓ Feature completed.  
✓ Feature completed.  
  
✓ Build successful.  
  
✓ Tests passed.  
✓ Tests passed.  
  
✓ Documentation synchronized.  
✓ Documentation synchronized.  
  
✓ Repository compliance verified.  
✓ Repository compliance verified.  
  
✓ No TODO items remain without documentation.  
  
✓ No temporary code remains.  
  
✓ No duplicated logic introduced.  
  
Every session shall leave the repository in a production-ready state.  
Every session shall leave the repository in a production-ready state.  
  
⸻  
  
**LONG-TERM MAINTENANCE**  
  
Every future contributor shall:  
  
* Read the Repository before coding.  
* Preserve Business Engine boundaries.  
* Extend architecture instead of replacing it.  
* Prefer evolution over redesign.  
* Preserve backward compatibility whenever practical.  
* Document every architectural decision.  
  
The Repository shall remain the living blueprint of the platform.  
The Repository shall remain the living blueprint of the platform.  
  
⸻  
  
**FINAL EXECUTION DIRECTIVE**  
  
This Repository is not merely documentation.  
This Repository is not merely documentation.  
  
It is the executable architectural specification of the platform.  
  
Claude shall treat every Repository document as an engineering contract.  
  
Business Rules define behavior.  
Business Rules define behavior.  
  
Business Engines implement behavior.  
Business Engines implement behavior.  
  
Formulas explain behavior.  
  
KPIs measure behavior.  
  
Dashboards present behavior.  
  
AI explains behavior.  
AI explains behavior.  
  
Testing validates behavior.  
  
Documentation preserves behavior.  
Documentation preserves behavior.  
  
Implementation is successful only when every layer remains aligned.  
  
At all times:  
At all times:  
  
Repository  
Repository  
  
↓  
  
Architecture  
  
↓  
↓  
  
Implementation  
Implementation  
  
↓  
↓  
  
Verification  
  
↓  
↓  
  
Documentation  
Documentation  
  
↓  
↓  
  
Production  
Production  
  
Never the reverse.  
Never the reverse.  
  
⸻  
  
**EXECUTION OATH**  
  
Before implementing any feature, Claude shall internally affirm:  
Before implementing any feature, Claude shall internally affirm:  
  
“I will preserve the Repository.  
“I will preserve the Repository.  
  
I will not invent business rules.  
I will not invent business rules.  
  
I will not duplicate Sources of Truth.  
  
I will implement deterministically.  
I will implement deterministically.  
  
I will update documentation.  
  
I will prioritize business correctness above convenience.  
  
I will leave the architecture stronger than I found it.”  
I will leave the architecture stronger than I found it.”  
  
This principle governs every implementation session.  
  
⸻  
  
**END OF FILE**  
  
051_MASTER_EXECUTION_PROMPT.md  
051_MASTER_EXECUTION_PROMPT.md  
  
Version: 2.0.0  
  
Status: FINAL  
Status: FINAL  
  
Priority: ABSOLUTE  
Priority: ABSOLUTE  
  
Repository Role: Master Execution Protocol  
Repository Role: Master Execution Protocol  
  
Execution Status: **MANDATORY BEFORE EVERY IMPLEMENTATION SESSION**  
Execution Status: **MANDATORY BEFORE EVERY IMPLEMENTATION SESSION**  
