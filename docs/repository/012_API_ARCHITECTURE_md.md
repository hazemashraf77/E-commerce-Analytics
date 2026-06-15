**012_API_ARCHITECTURE.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 14 / Repository  
  
Depends On:  
  
* 000_CLAUDE_MASTER_INSTRUCTIONS.md  
* 000A_PROJECT_DECISION_PRINCIPLES.md  
* 001_PROJECT_CONSTITUTION.md  
* 002_BUSINESS_RULES.md  
* 003_DATA_DICTIONARY.md  
* 004_CANONICAL_DATA_MODEL.md  
* 005_SOURCE_OF_TRUTH_MATRIX.md  
* 006_DATABASE_SPECIFICATION.md  
* 007_FINANCIAL_ENGINE.md  
* 008_INVENTORY_FIFO_ENGINE.md  
* 009_FORMULA_ENGINE.md  
* 010_ANALYTICS_ENGINE.md  
* 011_AI_ENGINE.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the API Architecture of the platform.  
  
Its objective is to guarantee that external providers can change independently without affecting business logic.  
  
External APIs are considered unstable.  
  
Business logic is considered permanent.  
  
⸻  
  
**ARCHITECTURE PHILOSOPHY**  
  
The platform follows an **API Adapter Architecture**.  
  
External APIs are never consumed directly by:  
  
* Financial Engine  
* Inventory Engine  
* Formula Engine  
* Analytics Engine  
* AI Engine  
* Dashboards  
  
Every provider must pass through an Adapter Layer.  
  
⸻  
  
**HIGH LEVEL FLOW**  
  
External Provider  
  
↓  
  
Authentication Layer  
  
↓  
  
API Adapter  
  
↓  
  
Validation  
  
↓  
  
Normalization  
  
↓  
  
Canonical Data Model  
  
↓  
  
Business Engines  
  
↓  
  
Dashboards  
  
No business module may bypass this flow.  
  
⸻  
  
**SUPPORTED PROVIDERS (VERSION 1)**  
  
Operational Systems  
  
* Eazy Order  
  
Shipping  
  
* Bosta  
  
Advertising  
  
* Meta Ads  
* TikTok Ads  
  
Future providers shall integrate without redesigning Business Engines.  
  
⸻  
  
**API ADAPTER PRINCIPLES**  
  
Every provider receives its own independent Adapter.  
  
Example:  
  
Eazy Order Adapter  
  
Bosta Adapter  
  
Meta Adapter  
  
TikTok Adapter  
  
Adapters never communicate with each other.  
  
Each Adapter owns only one provider.  
  
⸻  
  
**RESPONSIBILITIES OF AN ADAPTER**  
  
Every Adapter is responsible for:  
  
* Authentication  
* API Communication  
* Rate Limit Handling  
* Retry Logic  
* Response Validation  
* Payload Normalization  
* Error Logging  
* Canonical Model Conversion  
  
Adapters never calculate KPIs.  
  
Adapters never calculate Profit.  
  
Adapters never implement FIFO.  
  
Adapters never execute business rules.  
  
⸻  
  
**AUTHENTICATION**  
  
Every provider shall implement its own authentication strategy.  
  
Supported authentication mechanisms may include:  
  
* API Key  
* OAuth  
* Bearer Token  
* Refresh Token  
  
Authentication belongs exclusively to the Adapter Layer.  
  
Business modules never manage authentication.  
  
⸻  
  
**TOKEN MANAGEMENT**  
  
Access Tokens may expire.  
  
Adapters shall support:  
  
* Automatic Token Refresh  
* Expiration Detection  
* Secure Storage  
* Retry after Refresh  
  
Users should rarely need manual token renewal.  
  
⸻  
  
**RATE LIMITS**  
  
External providers may impose API limits.  
  
Adapters shall respect provider limits.  
  
Strategies include:  
  
* Request Queue  
* Background Synchronization  
* Retry with Backoff  
* Incremental Synchronization  
  
Dashboards must never trigger excessive API requests.  
  
⸻  
  
**BACKGROUND SYNCHRONIZATION**  
  
Synchronization always occurs in background jobs.  
  
Users browsing dashboards never wait for API responses.  
  
Synchronization updates the local analytical database.  
  
Dashboards consume local data only.  
  
⸻  
  
**API FAILURE POLICY**  
  
Temporary API failures are expected.  
  
Failures shall never:  
  
* Corrupt business data.  
* Delete historical records.  
* Produce incorrect KPIs.  
* Block dashboard usage.  
  
Previously synchronized data remains available.  
  
⸻  
  
**VALIDATION**  
  
Every imported payload shall be validated before entering the Canonical Data Model.  
  
Validation includes:  
  
* Required Fields  
* Data Types  
* Business Identifiers  
* Duplicate Detection  
* Relationship Integrity  
  
Invalid payloads remain outside production data.  
  
⸻  
  
**NORMALIZATION**  
  
Every provider uses different terminology.  
  
Adapters shall normalize:  
  
* Statuses  
* Dates  
* Currency  
* Product Names  
* Governorates  
* Campaign Names  
  
Business Engines consume only Canonical Models.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 012_API_ARCHITECTURE.md**  
  
⸻  
  
**CANONICAL CONVERSION**  
  
Every Adapter converts external payloads into the Canonical Data Model.  
  
Example:  
Example:  
  
External Provider Payload  
External Provider Payload  
  
↓  
↓  
  
Provider Adapter  
Provider Adapter  
  
↓  
  
Canonical Order  
Canonical Order  
  
↓  
↓  
  
Business Engines  
  
Business Engines never understand provider-specific payloads.  
Business Engines never understand provider-specific payloads.  
  
⸻  
  
**IDENTITY MAPPING**  
  
Each Adapter shall preserve:  
  
* External ID  
* Internal Canonical ID  
  
The relationship between both identifiers must remain permanent.  
  
Internal IDs never change.  
  
External IDs may change according to provider behavior.  
External IDs may change according to provider behavior.  
  
⸻  
  
**DUPLICATE DETECTION**  
  
Before importing data, Adapters shall detect duplicates.  
Before importing data, Adapters shall detect duplicates.  
  
Detection methods may include:  
Detection methods may include:  
  
* Provider ID  
* Composite Keys  
* Update Timestamp  
* Business Rules  
  
Duplicate imports must never create duplicate analytical records.  
  
⸻  
  
**INCREMENTAL SYNCHRONIZATION**  
  
Whenever supported, synchronization shall import only changed records.  
Whenever supported, synchronization shall import only changed records.  
  
Benefits:  
  
* Faster Imports  
* Lower API Usage  
* Lower Rate Limit Consumption  
* Better Performance  
  
Full synchronization remains available when required.  
  
⸻  
  
**RETRY POLICY**  
  
Transient API failures should automatically retry.  
Transient API failures should automatically retry.  
  
Recommended strategy:  
Recommended strategy:  
  
Attempt 1  
Attempt 1  
  
↓  
↓  
  
Retry  
Retry  
  
↓  
↓  
  
Retry  
Retry  
  
↓  
  
Exponential Backoff  
  
↓  
↓  
  
Failure Logged  
  
Retries must never create duplicate business events.  
Retries must never create duplicate business events.  
  
⸻  
  
**WEBHOOK SUPPORT**  
  
Where providers support Webhooks:  
Where providers support Webhooks:  
  
Preferred Flow  
Preferred Flow  
  
Provider  
Provider  
  
↓  
↓  
  
Webhook  
Webhook  
  
↓  
↓  
  
Validation  
  
↓  
  
Queue  
Queue  
  
↓  
↓  
  
Adapter  
Adapter  
  
↓  
↓  
  
Canonical Model  
Canonical Model  
  
↓  
↓  
  
Business Engines  
  
Polling remains available when Webhooks are unavailable.  
  
⸻  
  
**POLLING STRATEGY**  
  
Providers without Webhooks shall use scheduled synchronization.  
Providers without Webhooks shall use scheduled synchronization.  
  
Recommended schedules:  
  
Orders  
  
Every 5–15 minutes  
  
Shipments  
Shipments  
  
Every 10–15 minutes  
Every 10–15 minutes  
  
Marketing  
  
Every 30–60 minutes  
Every 30–60 minutes  
  
Settlements  
  
Every 30–60 minutes  
Every 30–60 minutes  
  
Schedules should remain configurable.  
Schedules should remain configurable.  
  
⸻  
  
**API QUEUE**  
  
Synchronization jobs should execute through a background queue.  
  
Queue responsibilities:  
Queue responsibilities:  
  
* Retry  
* Ordering  
* Parallelism  
* Monitoring  
* Failure Recovery  
  
Queues isolate APIs from business processing.  
  
⸻  
  
**SYNCHRONIZATION LOG**  
  
Every synchronization shall generate:  
  
* Job ID  
* Provider  
* Start Time  
* End Time  
* Imported Records  
* Updated Records  
* Failed Records  
* Duration  
* Status  
  
Synchronization history supports monitoring.  
Synchronization history supports monitoring.  
  
⸻  
  
**ERROR HANDLING**  
  
Adapters shall classify errors.  
Adapters shall classify errors.  
  
Examples:  
  
Authentication Error  
Authentication Error  
  
Rate Limit Error  
Rate Limit Error  
  
Network Error  
Network Error  
  
Validation Error  
Validation Error  
  
Provider Error  
  
Unknown Error  
Unknown Error  
  
Each error type should recommend an appropriate recovery strategy.  
Each error type should recommend an appropriate recovery strategy.  
  
⸻  
  
**STAGING AREA**  
  
Imported payloads should first enter a staging area.  
Imported payloads should first enter a staging area.  
  
Pipeline:  
Pipeline:  
  
Provider  
Provider  
  
↓  
  
Raw Payload  
  
↓  
  
Validation  
Validation  
  
↓  
↓  
  
Normalization  
  
↓  
↓  
  
Canonical Model  
Canonical Model  
  
↓  
↓  
  
Production Tables  
Production Tables  
  
Invalid payloads remain inside staging for investigation.  
  
⸻  
  
**PARTIAL IMPORTS**  
  
If only part of a synchronization succeeds:  
If only part of a synchronization succeeds:  
  
Successful records remain committed.  
Successful records remain committed.  
  
Failed records remain isolated.  
  
Future synchronization retries failed records only.  
  
Partial success is acceptable.  
Partial success is acceptable.  
  
Partial corruption is not.  
  
⸻  
  
**PROVIDER VERSIONING**  
  
Adapters should tolerate provider API evolution.  
  
Examples:  
Examples:  
  
New Fields  
  
Deprecated Fields  
Deprecated Fields  
  
Renamed Fields  
  
Optional Fields  
Optional Fields  
  
Business Engines should remain unaffected.  
  
Only the Adapter requires modification.  
Only the Adapter requires modification.  
  
⸻  
  
**API TIMEOUT POLICY**  
  
Long-running requests shall timeout gracefully.  
Long-running requests shall timeout gracefully.  
  
Timeouts should:  
Timeouts should:  
  
* Abort request  
* Log failure  
* Preserve previous data  
* Retry when appropriate  
  
Timeouts shall never corrupt synchronization state.  
Timeouts shall never corrupt synchronization state.  
  
⸻  
  
**API SUCCESS CRITERIA**  
  
The API Architecture is considered complete only if:  
  
* Every provider has its own Adapter.  
* Business Engines never consume external payloads.  
* Tokens refresh automatically.  
* Rate limits are respected.  
* Synchronization is idempotent.  
* Duplicate imports never occur.  
* Validation precedes business processing.  
* Canonical Models isolate providers from business logic.  
* Dashboards never call production APIs directly.  
* New providers can be added without redesigning existing business engines.  
  
The Adapter Layer is the protective boundary between unstable external systems and the permanent business architecture.  
The Adapter Layer is the protective boundary between unstable external systems and the permanent business architecture.  
  
⸻  
  
**END OF FILE**  
  
012_API_ARCHITECTURE.md  
012_API_ARCHITECTURE.md  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
