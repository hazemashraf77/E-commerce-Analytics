**PROJECT_WORKFLOW.md**  
  
Version: 1.0.0  
Status: ACTIVE  
Status: ACTIVE  
Priority: ABSOLUTE  
Priority: ABSOLUTE  
  
**Standard Workflow**  
  
Claude must follow this workflow for every sprint, feature, bug fix, or refactor.  
  
**Step 1 — Read**  
  
Read:  
Read:  
  
* PROJECT_START.md  
* PROJECT_RULES.md  
* PROJECT_MEMORY.md  
* Relevant Repository documents  
  
**Step 2 — Plan**  
  
Before implementation, produce a short plan containing:  
  
* Objective  
* Relevant documents  
* Affected modules  
* Database changes  
* API changes  
* UI changes  
* Tests  
* Risks  
* Definition of Done  
  
**Step 3 — Implement**  
  
Implement only the approved scope.  
Implement only the approved scope.  
  
Do not add unrelated features.  
Do not add unrelated features.  
  
Do not change architecture silently.  
  
**Step 4 — Self Review**  
  
After implementation, Claude must review its own work against:  
  
* Repository rules  
* Business rules  
* Source of Truth  
* Formula ownership  
* KPI ownership  
* Security  
* Testing  
* Maintainability  
  
**Step 5 — Fix Violations**  
  
If violations are found, fix them before reporting completion.  
If violations are found, fix them before reporting completion.  
  
**Step 6 — Test**  
  
Run or generate:  
  
* Type checks  
* Unit tests  
* Integration tests  
* Business logic tests  
* UI tests where applicable  
  
**Step 7 — Update Documentation**  
  
Update documentation only when implementation changes documented behavior.  
Update documentation only when implementation changes documented behavior.  
  
Do not create unnecessary new documentation.  
Do not create unnecessary new documentation.  
  
**Step 8 — Update Project Memory**  
  
At the end of every session update PROJECT_MEMORY.md with:  
  
* Completed work  
* Current phase  
* Progress  
* Known issues  
* Next task  
  
**Step 9 — Completion Report**  
  
Every completed task must end with:  
  
* What was completed  
* Files changed  
* Tests added  
* Risks  
* Remaining work  
* Next recommended step  
  
**Sprint Execution Command**  
  
When the user says:  
  
“Start Sprint X”  
  
Claude must:  
  
1. Read the relevant Repository documents.  
2. Read the relevant Repository documents.  
3. Generate the Sprint plan.  
4. Generate the Sprint plan.  
5. Wait for approval unless told to continue.  
6. Wait for approval unless told to continue.  
7. Implement.  
8. Implement.  
9. Self-review.  
10. Self-review.  
11. Test.  
12. Test.  
13. Update PROJECT_MEMORY.md.  
14. Update PROJECT_MEMORY.md.  
15. Produce completion report.  
16. Produce completion report.  
  
## End of File  
