**027_TECH_STACK.md**  
  
Version: 2.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 27 / Repository  
  
Depends On:  
  
ALL PREVIOUS DOCUMENTS  
  
⸻  
  
**PURPOSE**  
  
This document defines the official technology stack for the platform.  
  
Its purpose is to ensure that every implementation follows one consistent technical architecture.  
  
Claude shall not substitute technologies unless explicitly approved.  
  
⸻  
  
**DESIGN PHILOSOPHY**  
  
Technology choices shall prioritize:  
  
* Long-Term Maintainability  
* Type Safety  
* Scalability  
* Performance  
* Developer Experience  
* AI-Assisted Development  
* Claude Code Compatibility  
  
Technology is selected to serve the architecture.  
  
Never the opposite.  
  
⸻  
  
**PRIMARY STACK**  
  
Frontend  
  
React  
  
↓  
  
Next.js  
  
↓  
  
TypeScript  
  
↓  
  
Tailwind CSS  
  
↓  
  
shadcn/ui  
  
↓  
  
TanStack Query  
  
↓  
  
React Hook Form  
  
↓  
  
Zod  
  
Backend  
  
Next.js Server Actions  
  
↓  
  
Next.js Route Handlers  
  
↓  
  
TypeScript  
  
↓  
  
Supabase  
  
↓  
  
PostgreSQL  
  
No secondary backend framework is required for Version 1.  
  
⸻  
  
**FRONTEND**  
  
Framework  
  
Next.js (App Router)  
  
Reasons:  
  
* Server Components  
* Excellent Performance  
* Routing  
* SEO  
* TypeScript  
* Claude Compatibility  
  
Pages Router is prohibited.  
  
⸻  
  
**LANGUAGE**  
  
TypeScript  
  
Strict Mode  
  
Mandatory.  
  
JavaScript files are prohibited except configuration files where unavoidable.  
  
⸻  
  
**UI LIBRARY**  
  
Primary UI  
  
shadcn/ui  
  
Reasons:  
  
* Accessible  
* Modern  
* Customizable  
* Tailwind Native  
* Excellent Claude Compatibility  
  
Avoid large monolithic UI frameworks.  
  
⸻  
  
**STYLING**  
  
Tailwind CSS  
  
Principles:  
  
* Utility First  
* Responsive  
* Consistent Design Tokens  
* Dark Mode  
* RTL Compatibility  
  
Custom CSS should remain minimal.  
  
⸻  
  
**ICONS**  
  
Preferred library:  
  
Lucide React  
  
Reasons:  
  
* Consistency  
* Performance  
* Tree Shaking  
* Modern Design  
  
⸻  
  
**CHARTS**  
  
Recommended:  
  
Recharts  
  
Supported visualizations:  
  
* Line  
* Bar  
* Area  
* Pie  
* Donut  
* Waterfall  
* Funnel  
  
Charts consume Analytics Engine outputs only.  
  
⸻  
  
**STATE MANAGEMENT**  
  
Recommended strategy:  
  
React Query  
  
↓  
  
Server State  
  
React Context  
  
↓  
  
Global UI State  
  
Local State  
  
↓  
  
Component State  
  
Global state libraries are unnecessary for Version 1.  
  
⸻  
  
**FORM MANAGEMENT**  
  
Forms shall use:  
  
React Hook Form  
  
Validation:  
  
Zod  
  
Validation rules remain shared between frontend and backend whenever possible.  
  
⸻  
  
## END OF PART 1  
  
**\**  
  
  
**CONTINUATION OF 027_TECH_STACK.md**  
  
⸻  
  
**DATABASE**  
  
Primary Database  
  
PostgreSQL  
  
Recommended Provider  
  
Supabase PostgreSQL  
  
Reasons:  
  
* Reliability  
* SQL Support  
* Excellent Performance  
* Row Level Security  
* Real-time Capabilities  
* Claude Compatibility  
  
Business logic never lives inside database triggers.  
  
⸻  
  
**ORM**  
  
Recommended ORM  
  
Prisma  
  
Alternative  
  
Supabase Native SQL  
  
Business Rules remain inside Business Engines.  
  
The ORM is responsible only for data persistence.  
  
⸻  
  
**AUTHENTICATION**  
  
Recommended  
  
Supabase Auth  
  
Version 1 supports:  
  
* Email & Password  
  
Future Support  
  
* Google OAuth  
* GitHub OAuth  
* Microsoft OAuth  
* SSO  
  
Authentication remains independent from authorization.  
  
⸻  
  
**AUTHORIZATION**  
  
Authorization shall be implemented within the application.  
  
Recommended approach:  
  
Role-Based Access Control (RBAC)  
  
Roles:  
  
* Administrator  
* Manager  
* Finance  
* Inventory  
* Marketing  
* Read Only  
  
Business permissions remain application-controlled.  
  
⸻  
  
**STORAGE**  
  
Recommended  
  
Supabase Storage  
  
Used for:  
  
* Logos  
* Attachments  
* Adjustment Documents  
* Import Files  
* Future Reports  
  
Business records remain inside PostgreSQL.  
  
⸻  
  
**FILE EXPORT**  
  
Recommended libraries:  
  
PDF  
  
pdf-lib  
  
Excel  
  
ExcelJS  
  
CSV  
  
Native Generation  
  
Exports consume Reporting Engine outputs only.  
  
⸻  
  
**INTERNATIONALIZATION**  
  
Recommended  
  
next-intl  
  
Requirements:  
  
* English  
* Arabic  
* Runtime Language Switching  
* RTL  
* LTR  
  
Translation files remain version controlled.  
  
⸻  
  
**DATE HANDLING**  
  
Recommended  
  
date-fns  
  
Time Zone support shall be centralized.  
  
Moment.js is prohibited.  
  
⸻  
  
**VALIDATION**  
  
Recommended  
  
Zod  
  
Validation should occur:  
  
Client  
  
↓  
  
API  
  
↓  
  
Business Module  
  
↓  
  
Database  
  
Validation is never skipped.  
  
⸻  
  
**DATA FETCHING**  
  
Recommended  
  
TanStack Query  
  
Responsibilities:  
  
* Caching  
* Background Refresh  
* Request Deduplication  
* Retry  
* Loading States  
  
Business calculations remain server-side.  
  
⸻  
  
**SEARCH**  
  
Global search shall support:  
  
* Orders  
* Products  
* Campaigns  
* Settlements  
* Reports  
  
Recommended implementation:  
  
PostgreSQL Full Text Search  
  
Future:  
  
Dedicated Search Engine if required.  
  
⸻  
  
**LOGGING**  
  
Recommended  
  
Pino  
  
Responsibilities:  
  
* Application Logs  
* API Logs  
* Synchronization Logs  
* Error Logs  
* Performance Logs  
  
Sensitive information shall never appear in logs.  
  
⸻  
  
**ERROR TRACKING**  
  
Recommended  
  
Sentry  
  
Track:  
  
* Frontend Errors  
* Backend Errors  
* API Failures  
* Synchronization Failures  
  
Business errors remain explainable.  
  
⸻  
  
## END OF PART 2  
  
**\**  
  
  
## CONTINUATION OF 027_TECH_STACK.md  
   
⸻  
   
## BACKGROUND JOBS  
Recommended:  
Trigger.dev  
Alternative:  
Supabase Cron + Edge Functions  
Responsibilities:  
* API Synchronization  
* Scheduled Reports  
* Daily Snapshots  
* AI Daily Brief  
* Background Recalculation  
* Cleanup Tasks  
Background jobs never execute business logic independently.  
They orchestrate Business Engines.  
   
⸻  
   
## API COMMUNICATION  
Recommended:  
Native Fetch API  
Wrapped inside:  
Adapter Layer  
Every provider shall expose:  
* Authentication  
* Retry Logic  
* Validation  
* Canonical Conversion  
Business Engines never consume raw APIs.  
   
⸻  
   
## TESTING STACK  
Recommended:  
Unit Testing  
Vitest  
Component Testing  
React Testing Library  
End-to-End  
Playwright  
Performance  
Lighthouse  
Testing remains fully automated.  
   
⸻  
   
## CODE QUALITY  
Recommended:  
ESLint  
↓  
Prettier  
↓  
TypeScript Strict Mode  
↓  
Husky  
↓  
lint-staged  
Every commit should pass validation automatically.  
   
⸻  
   
## CI/CD  
Recommended:  
GitHub Actions  
Pipeline:  
Install  
↓  
Type Check  
↓  
Lint  
↓  
Tests  
↓  
Build  
↓  
Deploy  
Production deployment occurs only after successful pipeline completion.  
   
⸻  
   
## DEPLOYMENT  
Recommended:  
Frontend  
Vercel  
Backend  
Next.js + Vercel  
Database  
Supabase  
Storage  
Supabase Storage  
Monitoring  
Sentry  
Analytics  
PostHog (Future)  
The deployment stack should remain fully cloud-native.  
   
⸻  
   
## ENVIRONMENT VARIABLES  
Environment variables should include:  
```
NEXT_PUBLIC_APP_NAME

NEXT_PUBLIC_APP_URL

SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

META_APP_ID

META_ACCESS_TOKEN

TIKTOK_ACCESS_TOKEN

EAZY_ORDER_API_KEY

BOSTA_API_KEY

SENTRY_DSN

APP_SECRET

JWT_SECRET

```
Secrets shall never be exposed to the client unless explicitly intended.  
   
⸻  
   
## PACKAGE MANAGEMENT  
Recommended:  
pnpm  
Alternative:  
npm  
Yarn is discouraged for Version 1.  
Package manager should remain consistent throughout the repository.  
   
⸻  
   
## BROWSER SUPPORT  
Supported browsers:  
* Chrome  
* Edge  
* Safari  
* Firefox  
Mobile:  
* iOS Safari  
* Android Chrome  
Legacy browser support is not required.  
   
⸻  
   
## FUTURE TECHNOLOGY SUPPORT  
The architecture should support future migration to:  
* Dedicated Backend Services  
* Microservices  
* Event Bus  
* Redis  
* Elasticsearch  
* ClickHouse  
* Data Warehouse  
* ML Models  
* Vector Database  
Future migration shall extend architecture rather than replace it.  
   
⸻  
   
## TECHNOLOGY DECISION MATRIX  

| Layer           | Official Technology    |
| --------------- | ---------------------- |
| Frontend        | Next.js                |
| Language        | TypeScript             |
| Styling         | Tailwind CSS           |
| UI              | shadcn/ui              |
| Charts          | Recharts               |
| Database        | PostgreSQL             |
| Backend         | Next.js Server Actions |
| Auth            | Supabase Auth          |
| Storage         | Supabase Storage       |
| Validation      | Zod                    |
| Forms           | React Hook Form        |
| Data Fetching   | TanStack Query         |
| ORM             | Prisma                 |
| Logging         | Pino                   |
| Error Tracking  | Sentry                 |
| Testing         | Vitest + Playwright    |
| Deployment      | Vercel                 |
| Package Manager | pnpm                   |
  
   
⸻  
   
## SUCCESS CRITERIA  
The Technology Stack is considered complete only if:  
* Every technology has one documented responsibility.  
* TypeScript Strict Mode is enabled.  
* Business logic remains independent from framework choices.  
* Technologies are consistent across the repository.  
* Claude Code can generate production-ready code using the documented stack.  
* Future technologies can be integrated without architectural redesign.  
The Technology Stack defines the official implementation platform for the repository.  
Technology serves architecture.  
Architecture never serves technology.  
   
⸻  
   
## END OF FILE  
027_TECH_STACK.md  
Version: 2.0.0  
Status: FINAL  
