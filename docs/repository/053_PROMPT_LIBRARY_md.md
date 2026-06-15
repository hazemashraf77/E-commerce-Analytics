**053_PROMPT_LIBRARY.md**  
  
Version: 2.0.0  
  
Status: FINAL  
  
Priority: ABSOLUTE  
  
Read Order: BEFORE EVERY VIBE CODING SESSION  
  
Depends On:  
  
* 046_PROJECT_BIBLE.md  
* 047_CLAUDE_SYSTEM_PROMPT.md  
* 048_PROJECT_BOOTSTRAP.md  
* 049_BUILD_CHECKLIST.md  
* 050_FINAL_REPOSITORY_INDEX.md  
* 051_MASTER_EXECUTION_PROMPT.md  
* 052_PROJECT_MEMORY.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the official Prompt Library used for Vibe Coding.  
  
The objective is to provide production-ready prompts that instruct Claude to implement the platform while remaining fully compliant with the Repository.  
  
Every prompt in this library assumes that the Repository is the authoritative source of truth.  
  
⸻  
  
**PROMPT PHILOSOPHY**  
  
Repository  
  
↓  
  
Prompt  
  
↓  
  
Architecture  
  
↓  
  
Implementation  
  
↓  
  
Validation  
  
↓  
  
Documentation  
  
Prompts shall orchestrate implementation.  
  
They shall never redefine architecture.  
  
⸻  
  
**GLOBAL PREFIX**  
  
Every implementation prompt begins with the following instruction.  
  
⸻  
  
You are implementing an enterprise-grade e-commerce analytics platform.  
  
The Repository is the authoritative specification.  
  
Before writing code:  
  
* Read all relevant Repository documents.  
* Respect Business Engine boundaries.  
* Respect Source of Truth ownership.  
* Never duplicate business logic.  
* Never invent business rules.  
* Never invent formulas.  
* Never invent KPIs.  
* Generate production-ready code.  
* Generate strongly typed code.  
* Update documentation whenever implementation changes.  
  
If Repository documentation is missing,  
  
stop implementation and explain what is missing.  
  
⸻  
  
**PROMPT 001**  
  
**Bootstrap Project**  
  
Purpose  
  
Initialize the entire project.  
  
Prompt:  
  
Read:  
  
046_PROJECT_BIBLE  
  
047_CLAUDE_SYSTEM_PROMPT  
  
048_PROJECT_BOOTSTRAP  
  
050_FINAL_REPOSITORY_INDEX  
  
051_MASTER_EXECUTION_PROMPT  
  
Bootstrap the project exactly as documented.  
  
Create:  
  
* Folder Structure  
* Dependencies  
* Configuration  
* TypeScript  
* Prisma  
* Supabase  
* Authentication  
* Logging  
* Monitoring  
* Localization  
  
Do not implement business features.  
  
Stop only after the bootstrap checklist passes.  
  
⸻  
  
**PROMPT 002**  
  
**Build Database**  
  
Read:  
  
Canonical Data Model  
  
Database Design  
  
Database Migrations  
  
Source of Truth Matrix  
  
Implement the complete PostgreSQL schema using Prisma.  
  
Requirements:  
  
* Deterministic  
* Fully normalized  
* Strong foreign keys  
* Indexes  
* Constraints  
* Migration ready  
  
Generate migration files.  
  
Generate seed data when documented.  
  
⸻  
  
**PROMPT 003**  
  
**Build Business Engine**  
  
Prompt:  
  
Implement one Business Engine.  
  
Read all governing Repository documents first.  
  
Requirements:  
  
* One responsibility  
* Framework independent  
* Unit tested  
* Fully typed  
* Deterministic  
  
Generate:  
  
* Engine  
* Services  
* Tests  
* Documentation  
  
Business correctness has priority.  
  
⸻  
  
**PROMPT 004**  
  
**Build REST API**  
  
Prompt:  
  
Expose Business Engine capabilities through REST APIs.  
  
Requirements:  
  
* Authentication  
* Authorization  
* Validation  
* Error Codes  
* OpenAPI Compliance  
* Versioning  
  
Business rules remain inside Business Engines.  
  
⸻  
  
**PROMPT 005**  
  
**Build Dashboard**  
  
Prompt:  
  
Implement the Dashboard Architecture.  
  
Requirements:  
  
* KPI Cards  
* Charts  
* Tables  
* Filters  
* AI Panels  
* Responsive Design  
* RTL  
* Dark Mode  
  
Consume Analytics Engine outputs only.  
  
⸻  
  
## END OF PART 1  
  
**\**  
  
**CONTINUATION OF 053_PROMPT_LIBRARY.md**  
  
⸻  
  
**PROMPT 006**  
  
**Build Reporting Engine**  
  
Prompt:  
  
Implement the Reporting Engine according to the Repository.  
  
Requirements:  
  
* Executive Reports  
* Financial Reports  
* Inventory Reports  
* Marketing Reports  
* Shipping Reports  
* Settlement Reports  
  
Support:  
  
* PDF  
* Excel  
* CSV  
  
Large reports shall execute using Background Jobs.  
  
Reports consume Analytics Engine outputs only.  
  
⸻  
  
**PROMPT 007**  
  
**Build AI Copilot**  
  
Prompt:  
  
Implement the AI Engine exactly as documented.  
  
Requirements:  
  
* KPI Explanation  
* Formula Explanation  
* Decision Center  
* Daily Brief  
* Scenario Simulation  
* Product Scoring  
* Campaign Scoring  
* Risk Detection  
* Opportunity Detection  
  
Every response shall reference:  
  
* Formula Catalog  
* KPI Catalog  
  
AI shall remain advisory.  
  
⸻  
  
**PROMPT 008**  
  
**Build Synchronization**  
  
Prompt:  
  
Implement all synchronization providers.  
  
Requirements:  
  
* Meta  
* TikTok  
* Bosta  
* Eazy Order  
  
Generate:  
  
* Adapters  
* Canonical Mapping  
* Retry Logic  
* Queue Integration  
* Synchronization Logs  
  
Business Engines consume Canonical Models only.  
  
⸻  
  
**PROMPT 009**  
  
**Build Authentication & Security**  
  
Prompt:  
  
Implement the complete security architecture.  
  
Requirements:  
  
* Authentication  
* Authorization  
* RBAC  
* Protected Routes  
* Middleware  
* Audit Logging  
* Session Management  
  
Respect the documented Permission Matrix.  
  
⸻  
  
**PROMPT 010**  
  
**Build Monitoring**  
  
Prompt:  
  
Implement:  
  
* Logging  
* Monitoring  
* Health Checks  
* Alerting  
* Correlation IDs  
* Performance Metrics  
* Background Job Monitoring  
  
Follow the Monitoring Architecture and Logging Standard.  
  
⸻  
  
**PROMPT 011**  
  
**Build UI Components**  
  
Prompt:  
  
Implement reusable UI components.  
  
Requirements:  
  
* Accessibility  
* RTL  
* Responsive  
* Dark Mode  
* Design Tokens  
* shadcn/ui  
  
Business logic is prohibited inside reusable components.  
  
⸻  
  
**PROMPT 012**  
  
**Build Formula Engine**  
  
Prompt:  
  
Implement the Formula Engine.  
  
Requirements:  
  
* Formula Registry  
* Formula Execution  
* Versioning  
* Formula Validation  
* Formula Inspector  
  
Every Formula shall match the Formula Catalog exactly.  
  
Never hardcode calculations outside the engine.  
  
⸻  
  
**PROMPT 013**  
  
**Build Analytics Engine**  
  
Prompt:  
  
Implement:  
  
* KPI Generation  
* Historical Snapshots  
* Rankings  
* Trends  
* Dashboard Cache  
* Comparisons  
  
Consume Business Engine outputs only.  
  
Analytics never modifies business data.  
  
⸻  
  
**PROMPT 014**  
  
**Build Background Jobs**  
  
Prompt:  
  
Implement Background Jobs.  
  
Requirements:  
  
* Queue  
* Workers  
* Retry Logic  
* Dead Letter Queue  
* Monitoring  
* Logging  
  
Background Jobs orchestrate business operations.  
  
They never own business logic.  
  
⸻  
  
**PROMPT 015**  
  
**Build Testing Suite**  
  
Prompt:  
  
Generate complete automated tests.  
  
Include:  
  
* Unit Tests  
* Integration Tests  
* API Tests  
* Formula Tests  
* Business Validation  
* End-to-End Tests  
* Accessibility Tests  
* Performance Tests  
  
Testing shall validate Repository compliance.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
  
**CONTINUATION OF 053_PROMPT_LIBRARY.md**  
  
⸻  
  
**PROMPT 016**  
  
**Review Existing Code**  
  
Prompt:  
Prompt:  
  
Review the implementation against the Repository.  
Review the implementation against the Repository.  
  
Identify:  
Identify:  
  
* Business Rule Violations  
* Architecture Violations  
* Duplicated Logic  
* Missing Tests  
* Missing Documentation  
* Performance Risks  
* Security Risks  
  
Produce a Repository Compliance Report.  
  
Do not modify code automatically.  
  
⸻  
  
**PROMPT 017**  
  
**Refactor Module**  
  
Prompt:  
Prompt:  
  
Refactor the selected module.  
Refactor the selected module.  
  
Requirements:  
Requirements:  
  
* Preserve behavior.  
* Preserve Business Rules.  
* Preserve APIs.  
* Improve readability.  
* Improve maintainability.  
* Improve testability.  
  
Update documentation if architecture changes.  
  
⸻  
  
**PROMPT 018**  
  
**Fix Bug**  
  
Prompt:  
  
Fix the reported bug.  
Fix the reported bug.  
  
Before changing code:  
Before changing code:  
  
* Identify Business Engine ownership.  
* Verify Repository behavior.  
* Locate Formula (if applicable).  
* Verify KPI impact.  
  
Generate:  
Generate:  
  
* Root Cause Analysis  
* Code Fix  
* Regression Tests  
* Documentation Update (if required)  
  
Never introduce behavioral changes unrelated to the bug.  
Never introduce behavioral changes unrelated to the bug.  
  
⸻  
  
**PROMPT 019**  
  
**Production Readiness Review**  
  
Prompt:  
Prompt:  
  
Review the entire platform before production.  
Review the entire platform before production.  
  
Verify:  
Verify:  
  
✓ Repository Compliance  
✓ Repository Compliance  
  
✓ Business Correctness  
✓ Business Correctness  
  
✓ Formula Consistency  
✓ Formula Consistency  
  
✓ KPI Consistency  
✓ KPI Consistency  
  
✓ Security  
  
✓ Testing  
  
✓ Monitoring  
  
✓ Performance  
  
✓ Deployment  
  
✓ Disaster Recovery  
✓ Disaster Recovery  
  
Generate a detailed Production Readiness Report.  
  
⸻  
  
**PROMPT 020**  
  
**Continue Project**  
  
Prompt:  
  
Read:  
  
052_PROJECT_MEMORY.md  
052_PROJECT_MEMORY.md  
  
Identify:  
Identify:  
  
* Current Phase  
* Completed Work  
* Active Tasks  
* Blockers  
* Next Recommended Task  
  
Continue implementation exactly where the previous session ended.  
  
Update Project Memory before finishing.  
Update Project Memory before finishing.  
  
⸻  
  
**UNIVERSAL END-OF-SESSION PROMPT**  
  
At the end of every implementation session Claude shall:  
At the end of every implementation session Claude shall:  
  
1. Update PROJECT_MEMORY.md.  
2. Record completed milestones.  
3. Record remaining work.  
4. Record blockers.  
5. Recommend the next implementation step.  
6. Verify Repository compliance.  
7. Verify Build Checklist.  
8. Ensure documentation remains synchronized.  
  
Never finish a session without updating Project Memory.  
  
⸻  
  
**VIBE CODING PRINCIPLES**  
  
When using this Prompt Library:  
  
* Copy one prompt only.  
* Complete one architectural unit at a time.  
* Do not mix unrelated features.  
* Validate before continuing.  
* Keep commits small and logical.  
* Update Project Memory after every completed task.  
  
Small, verified iterations are preferred over large, risky implementations.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The Prompt Library is considered complete only if:  
The Prompt Library is considered complete only if:  
  
* Every implementation phase has a dedicated prompt.  
* Prompts remain Repository-compliant.  
* Prompts never redefine business rules.  
* Prompts encourage deterministic implementation.  
* Prompts enforce testing and documentation.  
* Prompts support implementation continuity through Project Memory.  
* Prompts enable a complete build of the platform from Bootstrap to Production.  
  
The Prompt Library transforms the Repository from a documentation system into an executable implementation workflow for Vibe Coding.  
  
⸻  
  
**END OF FILE**  
  
053_PROMPT_LIBRARY.md  
  
Version: 2.0.0  
Version: 2.0.0  
  
Status: FINAL  
  
Priority: ABSOLUTE  
  
Repository Role: Official Vibe Coding Prompt Library  
Repository Role: Official Vibe Coding Prompt Library  
  
Repository Completion Status: **ULTIMATE EDITION** 🚀  
Repository Completion Status: **ULTIMATE EDITION** 🚀  
