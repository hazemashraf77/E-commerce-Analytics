## 026_FOLDER_STRUCTURE.md  
Version: 2.0.0  
Status: FINAL  
Priority: CRITICAL  
Read Order: 26 / Repository  
Depends On:  
ALL PREVIOUS DOCUMENTS  
   
⸻  
   
## PURPOSE  
This document defines the official project folder structure.  
The folder structure is designed to:  
* Maximize maintainability  
* Prevent architectural drift  
* Separate responsibilities  
* Support long-term scalability  
* Make Claude Code generate predictable code  
Every folder has exactly one responsibility.  
   
⸻  
   
## ARCHITECTURE PHILOSOPHY  
The project follows:  
Business First Architecture  
Not  
Framework First Architecture.  
Folders are organized around business responsibilities.  
Not around UI pages.  
   
⸻  
   
## ROOT STRUCTURE  
```
project-root/

├── app/

├── modules/

├── components/

├── lib/

├── services/

├── adapters/

├── database/

├── types/

├── hooks/

├── utils/

├── config/

├── public/

├── docs/

├── scripts/

├── tests/

├── prisma/ (or Supabase)

├── package.json

├── tsconfig.json

├── README.md

```
The root directory shall remain minimal.  
   
⸻  
   
## APP DIRECTORY  
Purpose:  
Application Routing.  
Contains only:  
* Routes  
* Layouts  
* Providers  
* Pages  
The app directory shall never contain business logic.  
Example:  
```
/app

/dashboard

/finance

/inventory

/marketing

/shipping

/reports

/settings

/login

/layout.tsx

/page.tsx

```
   
⸻  
   
## MODULES DIRECTORY  
Purpose:  
Business Logic.  
Every business engine belongs here.  
Example:  
```
/modules

financial-engine/

inventory-engine/

formula-engine/

analytics-engine/

ai-engine/

settlement-engine/

marketing-engine/

shipping-engine/

synchronization-engine/

```
Business logic exists only here.  
   
⸻  
   
## COMPONENTS DIRECTORY  
Purpose:  
Reusable UI Components.  
Contains:  
* Cards  
* Tables  
* Charts  
* Buttons  
* Dialogs  
* Inputs  
* Layout Components  
Components never own business logic.  
Example:  
```
/components

charts/

tables/

cards/

forms/

navigation/

layout/

common/

```
   
⸻  
   
## LIB DIRECTORY  
Purpose:  
Shared infrastructure.  
Examples:  
```
/lib

database/

auth/

cache/

localization/

permissions/

logger/

monitoring/

```
Business logic shall not live inside lib.  
   
⸻  
   
## SERVICES DIRECTORY  
Purpose:  
Application Services.  
Examples:  
```
/services

export/

email/

notifications/

search/

storage/

```
Services support business modules.  
They do not own business rules.  
   
⸻  
   
## ADAPTERS DIRECTORY  
Purpose:  
External Integrations.  
Example:  
```
/adapters

eazy-order/

bosta/

meta/

tiktok/

future/

```
Each provider receives one Adapter.  
Adapters never communicate with each other.  
   
⸻  
   
## DATABASE DIRECTORY  
Purpose:  
Database Infrastructure.  
Example:  
```
/database

migrations/

views/

functions/

seeds/

backups/

```
Business calculations never live inside SQL.  
   
⸻  
   
## TYPES DIRECTORY  
Purpose:  
Shared Type Definitions.  
Examples:  
```
/types

financial.ts

inventory.ts

marketing.ts

shipping.ts

formula.ts

analytics.ts

api.ts

shared.ts

```
Types remain reusable.  
   
⸻  
   
## END OF PART 1  
  
\  
  
## CONTINUATION OF 026_FOLDER_STRUCTURE.md  
   
⸻  
   
## HOOKS DIRECTORY  
Purpose:  
Reusable React Hooks.  
Examples:  
```
/hooks

useLanguage.ts

useTheme.ts

usePermissions.ts

useFormulaInspector.ts

useDashboardFilters.ts

useSynchronization.ts

```
Hooks shall never implement business calculations.  
Hooks orchestrate UI behavior only.  
   
⸻  
   
## UTILS DIRECTORY  
Purpose:  
Pure helper functions.  
Examples:  
```
/utils

formatCurrency.ts

formatDate.ts

formatNumber.ts

validators.ts

constants.ts

string.ts

array.ts

```
Utilities must remain deterministic.  
Utilities never contain business rules.  
   
⸻  
   
## CONFIG DIRECTORY  
Purpose:  
Application configuration.  
Examples:  
```
/config

app.ts

permissions.ts

routes.ts

localization.ts

dashboard.ts

constants.ts

```
Configuration is centralized.  
Hardcoded configuration across the project is prohibited.  
   
⸻  
   
## PUBLIC DIRECTORY  
Purpose:  
Static assets.  
Examples:  
```
/public

images/

icons/

logos/

fonts/

translations/

manifest.json

```
Business data never belongs inside public.  
   
⸻  
   
## DOCS DIRECTORY  
Purpose:  
Repository documentation.  
Examples:  
```
/docs

repository/

architecture/

api/

database/

deployment/

project-bible/

```
Repository documentation remains version controlled.  
   
⸻  
   
## SCRIPTS DIRECTORY  
Purpose:  
Developer automation.  
Examples:  
```
/scripts

seed.ts

sync.ts

backup.ts

migration.ts

cleanup.ts

test-data.ts

```
Scripts automate operational tasks.  
Scripts never replace business engines.  
   
⸻  
   
## TESTS DIRECTORY  
Purpose:  
Automated testing.  
Structure:  
```
/tests

unit/

integration/

e2e/

performance/

fixtures/

helpers/

```
Testing remains completely separated from production code.  
   
⸻  
   
## PRISMA / SUPABASE  
Depending on implementation:  
```
/prisma

schema.prisma

migrations/

seed.ts

```
or  
```
/Database

Supabase Schema

Policies

Functions

Storage

```
Database definitions remain centralized.  
   
⸻  
   
## ASSETS ORGANIZATION  
Recommended asset structure:  
```
/assets

icons/

illustrations/

charts/

flags/

branding/

```
Assets shall remain independent from business logic.  
   
⸻  
   
## END OF PART 2  
  
\  
  
  
## CONTINUATION OF 026_FOLDER_STRUCTURE.md  
   
⸻  
   
## MODULE INTERNAL STRUCTURE  
Every Business Module shall follow the same internal structure.  
Example:  
```
/modules

financial-engine/

├── domain/

├── application/

├── infrastructure/

├── api/

├── dto/

├── validators/

├── repositories/

├── services/

├── formulas/

├── tests/

└── index.ts

```
Responsibilities:  
* domain → Business Rules  
* application → Use Cases  
* infrastructure → Database & External Access  
* api → Internal APIs  
* dto → Data Transfer Objects  
* validators → Input Validation  
* repositories → Data Access  
* services → Internal Orchestration  
* formulas → Module-specific Formula Definitions  
* tests → Module Tests  
Every module follows identical organization.  
   
⸻  
   
## FEATURE ISOLATION  
Business modules shall remain isolated.  
Examples:  
Financial Engine  
↓  
Own Services  
↓  
Own Repository  
↓  
Own Tests  
↓  
Own Validators  
Modules communicate through documented interfaces only.  
Direct cross-module database manipulation is prohibited.  
   
⸻  
   
## SHARED COMPONENT POLICY  
Shared code belongs only if it is genuinely reusable.  
Allowed shared components include:  
* Buttons  
* Tables  
* Cards  
* Dialogs  
* Charts  
* Layout Components  
Business-specific UI components belong inside their respective module.  
   
⸻  
   
## FILE NAMING CONVENTION  
Use consistent file naming.  
Examples:  
```
financial-engine.service.ts

financial-adjustment.repository.ts

formula-inspector.component.tsx

inventory-value.formula.ts

cash-flow.chart.tsx

```
Avoid abbreviations unless universally understood.  
Names should describe business intent.  
   
⸻  
   
## IMPORT RULES  
Imports shall follow one direction:  
Infrastructure  
↓  
Business Modules  
↓  
Analytics  
↓  
Presentation  
Lower layers must never import higher layers.  
Circular dependencies are prohibited.  
   
⸻  
   
## BARREL EXPORTS  
Each folder should expose a single public entry point.  
Example:  
```
/modules/financial-engine/index.ts

```
Consumers import only from the module root.  
Internal implementation details remain private.  
   
⸻  
   
## ENVIRONMENT VARIABLES  
Environment configuration shall remain centralized.  
Example:  
```
.env

.env.local

.env.production

.env.example

```
Secrets must never be committed to source control.  
Environment variables should always be validated during startup.  
   
⸻  
   
## REPOSITORY CONSISTENCY  
Every new module shall follow the documented structure.  
Claude shall never invent new top-level folders unless repository documentation is updated first.  
Consistency across the repository is mandatory.  
   
⸻  
   
## SUCCESS CRITERIA  
The Folder Structure is considered complete only if:  
* Every folder has one responsibility.  
* Business logic exists only inside Business Modules.  
* UI components remain presentation-only.  
* External integrations remain isolated in Adapters.  
* Shared infrastructure remains centralized.  
* Tests remain separated from production code.  
* Documentation remains version controlled.  
* Folder organization is predictable.  
* New modules can be added without restructuring the repository.  
The folder structure is the physical representation of the architecture.  
Maintaining it consistently preserves long-term maintainability.  
   
⸻  
   
## END OF FILE  
026_FOLDER_STRUCTURE.md  
Version: 2.0.0  
Status: FINAL  
