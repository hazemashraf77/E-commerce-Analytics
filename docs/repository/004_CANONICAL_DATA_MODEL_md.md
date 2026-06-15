**004_CANONICAL_DATA_MODEL.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 6 / Repository  
  
Depends On:  
  
* 000_CLAUDE_MASTER_INSTRUCTIONS.md  
* 000A_PROJECT_DECISION_PRINCIPLES.md  
* 001_PROJECT_CONSTITUTION.md  
* 002_BUSINESS_RULES.md  
* 003_DATA_DICTIONARY.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the internal Canonical Data Model used by the entire platform.  
  
Every external integration MUST first transform its data into these Canonical Models.  
  
Business logic MUST NEVER consume external API payloads directly.  
  
Every engine inside the application communicates exclusively through the Canonical Data Model.  
  
⸻  
  
**GENERAL PRINCIPLES**  
  
Each Canonical Entity shall have:  
  
* One Responsibility  
* One Identifier  
* One Source of Truth  
* One Business Meaning  
  
External APIs are translated.  
  
Internal Models are permanent.  
  
⸻  
  
**ENTITY 001**  
  
**Store**  
  
Purpose  
  
Represents one independent business.  
  
Primary Identifier  
  
Store ID  
  
Core Attributes  
  
* Store ID  
* Store Name  
* Store Code  
* Currency  
* Time Zone  
* Status  
* Created At  
* Updated At  
  
Relationships  
  
Store  
  
↓  
  
Products  
  
Orders  
  
Inventory  
  
Marketing  
  
Finance  
  
Reports  
  
⸻  
  
**ENTITY 002**  
  
**Product**  
  
Purpose  
  
Represents one physical sellable item.  
  
Primary Identifier  
  
Canonical Product ID  
  
Core Attributes  
  
* Product ID  
* SKU  
* Product Name  
* Product Category  
* Status  
* Default Selling Price  
* Current Inventory  
* Created At  
* Updated At  
  
Relationships  
  
Product  
  
↓  
  
Inventory Layers  
  
Order Items  
  
Marketing Aliases  
  
Profit  
  
Forecast  
  
⸻  
  
**ENTITY 003**  
  
**Product Alias**  
  
Purpose  
  
Maps external marketing names to one Canonical Product.  
  
Primary Identifier  
  
Alias ID  
  
Core Attributes  
  
* Alias ID  
* Canonical Product ID  
* Alias Name  
* Source Platform  
* Status  
  
Examples  
  
Meta Campaign Name  
  
TikTok Product Name  
  
Landing Page Product Name  
  
Internal Marketing Name  
  
⸻  
  
**ENTITY 004**  
  
**Order**  
  
Purpose  
  
Represents one imported customer order.  
  
Primary Identifier  
  
Canonical Order ID  
  
External Identifier  
  
Provider Order ID  
  
Core Attributes  
  
* Order ID  
* Store ID  
* Provider  
* Provider Order ID  
* Order Date  
* Customer Shipping Fee  
* Payment Method  
* Order Status  
* Shipment Status  
* Marketing Source  
* Campaign  
* Created At  
* Updated At  
  
Relationships  
  
Order  
  
↓  
  
Order Items  
  
Shipment  
  
Financial Events  
  
Settlement  
  
Manual Adjustments  
  
⸻  
  
**ENTITY 005**  
  
**Order Item**  
  
Purpose  
  
Represents one purchased product inside an order.  
  
Primary Identifier  
  
Order Item ID  
  
Core Attributes  
  
* Order Item ID  
* Order ID  
* Product ID  
* Quantity  
* Unit Price  
* Discount  
* Allocated Revenue  
* FIFO Cost  
* Profit Contribution  
  
Relationships  
  
Order Item  
  
↓  
  
Inventory Movement  
  
FIFO Layer  
  
Financial Engine  
  
⸻  
  
**ENTITY 006**  
  
**Shipment**  
  
Purpose  
  
Represents shipping lifecycle imported from Bosta.  
  
Primary Identifier  
  
Shipment ID  
  
Core Attributes  
  
* Shipment ID  
* Provider Shipment ID  
* Order ID  
* Shipment Status  
* Shipping Zone  
* Delivery Date  
* Return Date  
* Actual Shipping Cost  
* COD Amount  
* Created At  
* Updated At  
  
Relationships  
  
Shipment  
  
↓  
  
Settlement  
  
Financial Engine  
  
Inventory Engine  
  
⸻  
  
**ENTITY 007**  
  
**Inventory Layer**  
  
Purpose  
  
Represents one FIFO purchase layer.  
  
Primary Identifier  
  
Inventory Layer ID  
  
Core Attributes  
  
* Layer ID  
* Product ID  
* Purchase Date  
* Purchase Quantity  
* Remaining Quantity  
* Unit Cost  
* Supplier  
* Purchase Reference  
  
Relationships  
  
Inventory Layer  
  
↓  
  
Inventory Movements  
  
FIFO Engine  
  
Valuation Engine  
  
⸻  
  
**ENTITY 008**  
  
**Inventory Movement**  
  
Purpose  
  
Represents every stock movement.  
  
Primary Identifier  
  
Movement ID  
  
Core Attributes  
  
* Movement ID  
* Product ID  
* Movement Type  
* Quantity  
* Unit Cost  
* Related Order  
* Related Return  
* Related Exchange  
* Timestamp  
  
Movement Types  
  
Purchase  
  
Consumption  
  
Return  
  
Adjustment  
  
Exchange  
  
Correction  
  
Inventory Movement History is immutable.  
  
⸻  
  
**ENTITY 009**  
  
**Financial Adjustment**  
  
Purpose  
  
Represents exceptional manual financial records.  
  
Primary Identifier  
  
Adjustment ID  
  
Core Attributes  
  
* Adjustment ID  
* Order ID  
* Adjustment Type  
* Amount  
* Reason  
* Notes  
* Attachment  
* User  
* Timestamp  
  
Relationships  
  
Financial Adjustment  
  
↓  
  
Financial Engine  
  
Cash Flow  
  
Audit Trail  
  
⸻  
  
**ENTITY 010**  
  
**Settlement**  
  
Purpose  
  
Represents one settlement received from Bosta.  
  
Primary Identifier  
  
Settlement ID  
  
Core Attributes  
  
* Settlement ID  
* Settlement Date  
* Expected Amount  
* Actual Amount  
* Shipping Charges  
* Return Charges  
* Exchange Charges  
* Additional Charges  
* Net Transfer  
* Status  
  
Relationships  
  
Settlement  
  
↓  
  
Orders  
  
Shipments  
  
Cash Flow  
  
Reconciliation  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
  
**CONTINUATION OF 004_CANONICAL_DATA_MODEL.md**  
  
⸻  
  
**ENTITY 011**  
  
**Marketing Source**  
  
Purpose  
  
Represents the origin of customer acquisition.  
  
Primary Identifier  
  
Marketing Source ID  
  
Core Attributes  
  
* Source ID  
* Source Name  
* Platform  
* Status  
  
Supported Values  
  
* Meta  
* TikTok  
* Direct  
* Organic  
* Referral  
* Unknown  
  
Marketing Source participates in attribution only.  
  
It never affects financial logic.  
  
⸻  
  
**ENTITY 012**  
  
**Campaign**  
  
Purpose  
  
Represents one imported advertising campaign.  
  
Primary Identifier  
  
Campaign ID  
  
External Identifier  
  
Platform Campaign ID  
  
Core Attributes  
  
* Campaign ID  
* Platform  
* Campaign Name  
* Campaign Objective  
* Status  
* Start Date  
* End Date  
  
Relationships  
  
Campaign  
  
↓  
  
Marketing Spend  
  
Orders  
  
Products  
  
Analytics  
  
⸻  
  
**ENTITY 013**  
  
**Marketing Spend**  
  
Purpose  
  
Represents advertising cost imported from advertising platforms.  
  
Primary Identifier  
  
Marketing Spend ID  
  
Core Attributes  
  
* Spend ID  
* Platform  
* Campaign ID  
* Spend Date  
* Amount  
* Currency  
  
Relationships  
  
Marketing Spend  
  
↓  
  
Financial Engine  
  
Marketing Analytics  
  
True CPA  
  
Forecasting  
  
⸻  
  
**ENTITY 014**  
  
**Revenue Event**  
  
Purpose  
  
Represents realized revenue.  
  
Primary Identifier  
  
Revenue Event ID  
  
Core Attributes  
  
* Revenue Event ID  
* Order ID  
* Revenue Amount  
* Revenue Date  
* Recognition Status  
  
Revenue Events exist only after Delivered.  
  
⸻  
  
**ENTITY 015**  
  
**Cost Event**  
  
Purpose  
  
Represents realized product cost.  
  
Primary Identifier  
  
Cost Event ID  
  
Core Attributes  
  
* Cost Event ID  
* Order ID  
* FIFO Cost  
* Recognition Date  
  
Relationships  
  
Cost Event  
  
↓  
  
Gross Profit  
  
Net Profit  
  
⸻  
  
**ENTITY 016**  
  
**Profit Event**  
  
Purpose  
  
Represents realized profitability.  
  
Primary Identifier  
  
Profit Event ID  
  
Core Attributes  
  
* Profit Event ID  
* Order ID  
* Gross Profit  
* Net Profit  
* Profit Margin  
* Recognition Date  
  
Profit Events are generated exclusively by the Financial Engine.  
  
⸻  
  
**ENTITY 017**  
  
**Cash Flow Event**  
  
Purpose  
  
Represents movement of money.  
  
Primary Identifier  
  
Cash Flow Event ID  
  
Core Attributes  
  
* Event ID  
* Type  
* Amount  
* Direction  
* Reference  
* Event Date  
  
Direction  
  
Cash In  
  
Cash Out  
  
Relationships  
  
Cash Flow  
  
↓  
  
Financial Reports  
  
Forecast  
  
Dashboard  
  
⸻  
  
**ENTITY 018**  
  
**Forecast**  
  
Purpose  
  
Represents predictive business calculations.  
  
Primary Identifier  
  
Forecast ID  
  
Core Attributes  
  
* Forecast ID  
* Forecast Type  
* Period  
* Confidence  
* Expected Value  
* Generated At  
  
Forecasts never overwrite realized business values.  
  
⸻  
  
**ENTITY 019**  
  
**Scenario Simulation**  
  
Purpose  
  
Represents hypothetical business scenarios.  
  
Primary Identifier  
  
Simulation ID  
  
Core Attributes  
  
* Simulation ID  
* Scenario Name  
* Inputs  
* Results  
* Created By  
* Created At  
  
Simulation data is isolated.  
  
Simulation never modifies production data.  
  
⸻  
  
**ENTITY 020**  
  
**KPI**  
  
Purpose  
  
Represents one standardized business metric.  
  
Primary Identifier  
  
KPI ID  
  
Core Attributes  
  
* KPI ID  
* KPI Name  
* Formula ID  
* Category  
* Owner  
* Refresh Frequency  
  
Relationships  
  
KPI  
  
↓  
  
Formula  
  
Dashboard  
  
AI  
  
Reports  
  
⸻  
  
**ENTITY 021**  
  
**Formula**  
  
Purpose  
  
Represents one approved business calculation.  
  
Primary Identifier  
  
Formula ID  
  
Core Attributes  
  
* Formula ID  
* Formula Name  
* Formula Version  
* Business Purpose  
* Inputs  
* Output  
  
Relationships  
  
Formula  
  
↓  
  
Formula Inspector  
  
KPIs  
  
Reports  
  
AI  
  
⸻  
  
**ENTITY 022**  
  
**Formula Inspector**  
  
Purpose  
  
Represents the explainability layer.  
  
Primary Identifier  
  
Inspection ID  
  
Core Attributes  
  
* Inspection ID  
* Formula ID  
* Inputs  
* Intermediate Values  
* Output  
* Source Records  
  
Formula Inspector is generated dynamically.  
  
It is never manually edited.  
  
⸻  
  
**ENTITY 023**  
  
**AI Recommendation**  
  
Purpose  
  
Represents one AI-generated recommendation.  
  
Primary Identifier  
  
Recommendation ID  
  
Core Attributes  
  
* Recommendation ID  
* Priority  
* Category  
* Confidence  
* Supporting KPIs  
* Expected Impact  
* Recommended Action  
* Generated At  
  
AI Recommendations never modify business data.  
  
⸻  
  
**ENTITY 024**  
  
**Daily Snapshot**  
  
Purpose  
  
Represents historical KPI preservation.  
  
Primary Identifier  
  
Snapshot ID  
  
Core Attributes  
  
* Snapshot ID  
* Snapshot Date  
* Revenue  
* Profit  
* Cash Position  
* Inventory Value  
* Marketing Spend  
* Delivery Rate  
* Return Rate  
  
Snapshots are immutable.  
  
⸻  
  
**ENTITY 025**  
  
**Audit Record**  
  
Purpose  
  
Represents one permanent audit entry.  
  
Primary Identifier  
  
Audit Record ID  
  
Core Attributes  
  
* Audit ID  
* Entity Type  
* Entity ID  
* User  
* Action  
* Previous Value  
* New Value  
* Timestamp  
  
Audit Records are immutable.  
  
Audit Records are never deleted.  
  
⸻  
  
**ENTITY RELATIONSHIP PRINCIPLES**  
  
Every entity shall satisfy the following rules:  
  
* One business meaning.  
* One primary identifier.  
* One authoritative owner.  
* One source of truth.  
* One canonical definition.  
  
No entity shall duplicate another entity’s responsibility.  
  
Relationships must remain explicit.  
  
Implicit business relationships are prohibited.  
  
⸻  
  
**CANONICAL MODEL PRINCIPLES**  
  
Business Engines shall communicate exclusively through Canonical Models.  
  
External APIs shall never communicate directly with:  
  
* Financial Engine  
* Inventory Engine  
* Dashboard  
* AI Engine  
* Formula Engine  
  
Adapters always translate.  
  
Business Engines always calculate.  
  
Presentation Layers always display.  
  
Responsibilities must never overlap.  
  
⸻  
  
## END OF PART 2  
  
  
\  
  
  
  
## CONTINUATION OF 004_CANONICAL_DATA_MODEL.md  
   
⸻  
   
## DATA FLOW PRINCIPLES  
The entire platform shall follow one unified data flow.  
No module may bypass this flow.  
The standard processing pipeline is:  
External Platform  
↓  
API Adapter  
↓  
Validation Layer  
↓  
Canonical Data Model  
↓  
Business Engine  
↓  
Formula Engine  
↓  
Analytics Engine  
↓  
AI Engine  
↓  
Dashboard  
↓  
User  
Business logic must never execute before data becomes part of the Canonical Data Model.  
   
⸻  
   
## CANONICAL MODEL LIFECYCLE  
Every Canonical Entity passes through the following lifecycle:  
Imported  
↓  
Validated  
↓  
Normalized  
↓  
Stored  
↓  
Processed  
↓  
Calculated  
↓  
Reported  
↓  
Archived  
Each step must be traceable.  
   
⸻  
   
## DATA OWNERSHIP MATRIX  
Every Canonical Entity has exactly one owner.  

| Entity               | Owner             |
| -------------------- | ----------------- |
| Store                | Store Module      |
| Product              | Product Module    |
| Product Alias        | Product Module    |
| Inventory Layer      | Inventory Engine  |
| Inventory Movement   | Inventory Engine  |
| Order                | Order Module      |
| Order Item           | Order Module      |
| Shipment             | Shipping Module   |
| Marketing Spend      | Marketing Module  |
| Campaign             | Marketing Module  |
| Settlement           | Settlement Module |
| Financial Adjustment | Finance Module    |
| Revenue Event        | Financial Engine  |
| Cost Event           | Financial Engine  |
| Profit Event         | Financial Engine  |
| Cash Flow Event      | Financial Engine  |
| KPI                  | Analytics Engine  |
| Formula              | Formula Engine    |
| Formula Inspector    | Formula Engine    |
| AI Recommendation    | AI Engine         |
| Daily Snapshot       | Analytics Engine  |
| Audit Record         | Audit Engine      |
  
Ownership must never overlap.  
   
⸻  
   
## ENTITY STATE PRINCIPLES  
Every entity should have a clearly defined lifecycle.  
Typical lifecycle:  
Created  
↓  
Validated  
↓  
Active  
↓  
Archived  
Deletion should be avoided.  
Historical preservation is preferred.  
   
⸻  
   
## ENTITY IDENTIFIERS  
Every Canonical Entity shall contain:  
Internal ID  
External ID (when applicable)  
Created Timestamp  
Updated Timestamp  
Version  
Status  
Internal IDs never change.  
External IDs may change depending on provider behavior.  
   
⸻  
   
## ENTITY VERSIONING  
Business entities requiring historical preservation should support version tracking.  
Examples:  
Formula  
Business Rules  
Configuration  
Dashboard Layout  
Historical Reports  
Versioning prevents historical inconsistency.  
   
⸻  
   
## DATA NORMALIZATION  
Incoming external data must be normalized before storage.  
Normalization includes:  
* Standard Date Format  
* Standard Currency Format  
* Standard Status Values  
* Standard Product References  
* Standard Platform Names  
* Standard Governorate Names  
Normalization occurs before business calculations.  
   
⸻  
   
## ENUM STANDARDIZATION  
External providers may use different terminology.  
Adapters must translate provider values into internal enums.  
Example:  
Provider A  
“completed”  
↓  
Delivered  
Provider B  
“success”  
↓  
Delivered  
Provider C  
“delivered”  
↓  
Delivered  
Business Engines consume only standardized values.  
   
⸻  
   
## NULL VALUE POLICY  
Unknown values shall never be replaced with fabricated data.  
Allowed behavior:  
* Null  
* Unknown  
* Not Available  
Forbidden behavior:  
Estimated values without documentation.  
Hidden assumptions.  
Automatic guessing.  
   
⸻  
   
## OPTIONAL FIELDS  
Optional fields remain nullable.  
Business logic shall distinguish between:  
Value equals Zero  
and  
Value Unknown  
These are different business states.  
   
⸻  
   
## REQUIRED FIELDS  
Critical business entities require mandatory attributes.  
Examples include:  
Order  
* Order ID  
* Store  
* Date  
Inventory Layer  
* Product  
* Quantity  
* Unit Cost  
Settlement  
* Settlement ID  
* Settlement Date  
Missing required fields should prevent import until resolved.  
   
⸻  
   
## SOFT DELETE POLICY  
Business entities should support soft deletion where necessary.  
Soft deletion preserves history.  
Soft deletion never removes auditability.  
Financial entities should rarely support deletion.  
   
⸻  
   
## HARD DELETE POLICY  
Hard deletion is prohibited for:  
* Orders  
* Inventory  
* Financial Events  
* Settlements  
* Audit Records  
* Snapshots  
Administrative cleanup should archive rather than delete.  
   
⸻  
   
## DATA RETENTION  
Business data is considered long-term business knowledge.  
Historical data should remain available indefinitely unless legal requirements dictate otherwise.  
Analytics improve with longer history.  
AI improves with longer history.  
Forecasts improve with longer history.  
   
⸻  
   
## END OF PART 3  
  
  
**\**  
  
  
  
## CONTINUATION OF 004_CANONICAL_DATA_MODEL.md  
   
⸻  
   
## CANONICAL STATUS MODEL  
External providers may expose different lifecycle statuses.  
The application shall normalize every external status into the internal Canonical Status Model.  
Business Engines shall only consume Canonical Statuses.  
Example:  
Provider Status  
↓  
Canonical Status  
↓  
Business Interpretation  
   
⸻  
   
## ORDER STATUS MODEL  
Canonical Order Statuses include:  
* Draft  
* Pending  
* Confirmed  
* Processing  
* Ready To Ship  
* Shipped  
* Delivered  
* Cancelled  
* Closed  
Operational providers may expose additional statuses.  
Adapters shall normalize them.  
   
⸻  
   
## SHIPMENT STATUS MODEL  
Canonical Shipment Statuses include:  
* Created  
* Picked Up  
* In Transit  
* Out For Delivery  
* Delivered  
* Delivery Failed  
* Returned  
* Expected Return  
* Cancelled  
Shipment Status belongs exclusively to the Shipping Module.  
Financial interpretation belongs to the Financial Engine.  
   
⸻  
   
## PAYMENT STATUS MODEL  
Canonical Payment Statuses include:  
* Pending  
* Paid  
* Partially Paid  
* Refunded  
* Failed  
* Unknown  
Payment Status must remain independent from Shipment Status.  
   
⸻  
   
## INVENTORY MOVEMENT TYPES  
Canonical Inventory Movement Types include:  
* Purchase  
* Sale  
* Physical Return  
* Exchange  
* Manual Adjustment  
* Inventory Correction  
* Opening Balance  
Every movement shall reference its originating business event.  
   
⸻  
   
## FINANCIAL EVENT TYPES  
Canonical Financial Event Types include:  
* Revenue  
* COGS  
* Shipping Expense  
* Marketing Expense  
* Fixed Expense  
* Variable Expense  
* Refund  
* Compensation  
* Manual Adjustment  
* Settlement  
* Cash In  
* Cash Out  
Financial Events are immutable.  
   
⸻  
   
## MARKETING PLATFORM MODEL  
Supported Marketing Platforms include:  
* Meta  
* TikTok  
Future platforms shall integrate without modifying existing business logic.  
Adapters perform translation.  
Canonical Models remain unchanged.  
   
⸻  
   
## SHIPPING PROVIDER MODEL  
Supported Shipping Providers initially include:  
* Bosta  
Future providers may include additional shipping companies.  
Every provider requires an independent Adapter.  
The Canonical Shipment Model remains unchanged.  
   
⸻  
   
## ORDER PROVIDER MODEL  
Supported Order Providers initially include:  
* Eazy Order  
Future providers shall integrate through independent Adapters.  
Business Engines remain provider-independent.  
   
⸻  
   
## SOURCE OF TRUTH MATRIX  
Every Canonical Entity shall have exactly one authoritative owner.  

| Business Entity      | Source of Truth  |
| -------------------- | ---------------- |
| Orders               | Eazy Order       |
| Shipment Status      | Bosta            |
| Actual Shipping Cost | Bosta            |
| Product Cost         | Inventory Engine |
| Inventory Quantity   | Inventory Engine |
| Marketing Spend      | Meta / TikTok    |
| Manual Adjustments   | Finance Module   |
| Revenue              | Financial Engine |
| COGS                 | Financial Engine |
| Gross Profit         | Financial Engine |
| Net Profit           | Financial Engine |
| Cash Flow            | Financial Engine |
| KPIs                 | Analytics Engine |
| Formula Definitions  | Formula Engine   |
| AI Recommendations   | AI Engine        |
  
Violation of the Source of Truth Matrix is prohibited.  
   
⸻  
   
## CROSS-MODULE COMMUNICATION  
Modules communicate only through Canonical Models.  
Allowed Flow:  
API Adapter  
↓  
Canonical Model  
↓  
Business Engine  
↓  
Analytics Engine  
↓  
Dashboard  
Forbidden:  
Dashboard  
↓  
API  
Financial Engine  
↓  
API Payload  
Inventory Engine  
↓  
External Provider  
   
⸻  
   
## CANONICAL VALIDATION RULES  
Before any Canonical Entity becomes Active:  
The system shall verify:  
* Required Fields  
* Identifier Integrity  
* Relationship Integrity  
* Data Type Validation  
* Business Rule Validation  
* Duplicate Detection  
Validation failures prevent processing.  
   
⸻  
   
## CANONICAL ERROR HANDLING  
If Canonical Model generation fails:  
The platform shall:  
* Reject invalid data.  
* Preserve original payload.  
* Log validation errors.  
* Allow future reprocessing.  
* Protect existing analytical data.  
No invalid Canonical Entity shall enter business calculations.  
   
⸻  
   
## FUTURE EXTENSIBILITY  
The Canonical Data Model is intentionally provider-independent.  
Future integrations must require:  
New Adapter  
↓  
Existing Canonical Model  
↓  
Existing Business Engines  
Business Engines should never require redesign because of a new provider.  
   
⸻  
   
## CANONICAL MODEL SUCCESS CRITERIA  
The Canonical Data Model is considered complete only if:  
* Every external provider can map to it.  
* Every Business Engine consumes it.  
* Every Dashboard depends on it.  
* Every Formula uses it.  
* Every AI recommendation references it.  
* Every report is generated from it.  
The Canonical Data Model is the permanent language spoken by every subsystem inside the platform.  
   
⸻  
   
## END OF FILE  
004_CANONICAL_DATA_MODEL.md  
Version: 1.0.0  
Status: FINAL  
