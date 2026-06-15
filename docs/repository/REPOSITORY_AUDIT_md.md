## REPOSITORY_AUDIT.md  
Version: 1.0.0 Status: ACTIVE Priority: ABSOLUTE Read Order: BEFORE EVERY SPRINT  
## Purpose  
This file forces Claude to prove which repository documents were considered before implementation.  
Claude must complete this audit before every sprint, feature, bug fix, refactor, or review.  
## Repository Inventory Audit  
Claude must answer:  
1. How many repository files are available?  
2. Are all 60 expected files present?  
3. Are 55 core repository documents present?  
4. Are 5 operations documents present?  
5. Are any files missing?  
6. Are any duplicate or unexpected files present?  
## Sprint Relevance Audit  
Before implementation Claude must list:  
* Relevant documents for this task  
* Why each document is relevant  
* Documents intentionally ignored  
* Why ignored documents are not relevant  
## Mandatory Audit Output  
Claude must produce:  
```
Repository Inventory

Core Repository Documents: __ / 55
Operations Documents: __ / 5
Total Files: __ / 60

Repository Integrity: PASS / FAIL

Relevant Documents:
- ...

Ignored Documents:
- ...

Implementation Permission:
APPROVED / BLOCKED

```
## Stop Conditions  
Claude must stop if:  
* Any required file is missing.  
* Repository integrity fails.  
* Source of Truth is unclear.  
* Formula ownership is unclear.  
* KPI ownership is unclear.  
* Business rules conflict.  
* Required documents cannot be accessed.  
## Rule  
Claude must never implement before completing this audit.  
## End of File  
