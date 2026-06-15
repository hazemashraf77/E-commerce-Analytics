**000A_PROJECT_DECISION_PRINCIPLES.md**  
  
Version: 1.0.0  
Version: 1.0.0  
  
Status: FINAL  
Status: FINAL  
  
Priority: CRITICAL  
  
Read Order: 2 / Repository  
  
Depends On:  
Depends On:  
  
* 000_CLAUDE_MASTER_INSTRUCTIONS.md  
  
⸻  
  
**PURPOSE**  
  
This document explains every major architectural and business decision taken during the design of this project.  
This document explains every major architectural and business decision taken during the design of this project.  
  
The objective is not to describe implementation.  
  
The objective is to prevent future architectural drift.  
  
Claude MUST understand WHY each decision exists before implementing any module.  
Claude MUST understand WHY each decision exists before implementing any module.  
  
Never replace an approved decision with a different approach unless explicitly instructed.  
  
⸻  
  
**DECISION 001**  
  
Project Type  
Project Type  
  
Decision:  
Decision:  
  
The project is an AI-Powered E-Commerce Financial & Decision Operating System.  
  
It is NOT merely a dashboard.  
  
Reason:  
Reason:  
  
A dashboard displays information.  
A dashboard displays information.  
  
This project calculates, validates, explains, forecasts, reconciles and assists decision making.  
This project calculates, validates, explains, forecasts, reconciles and assists decision making.  
  
The dashboard is only one presentation layer.  
The dashboard is only one presentation layer.  
  
⸻  
  
**DECISION 002**  
  
Do Not Replace Existing Operational Systems  
  
Decision:  
Decision:  
  
The application complements operational systems.  
The application complements operational systems.  
  
It does not replace them.  
It does not replace them.  
  
Existing operational systems include:  
  
* Eazy Order  
* Bosta  
  
Reason:  
  
These systems already solve operational workflows.  
These systems already solve operational workflows.  
  
Duplicating them increases complexity without adding business value.  
Duplicating them increases complexity without adding business value.  
  
This project focuses on financial intelligence.  
This project focuses on financial intelligence.  
  
⸻  
  
**DECISION 003**  
  
No CRM  
  
Decision:  
  
Customer Relationship Management is intentionally excluded.  
  
Reason:  
Reason:  
  
Customer management already exists inside operational platforms.  
Customer management already exists inside operational platforms.  
  
This application does not benefit from storing complete customer profiles.  
  
Only exceptional financial events may reference an Order ID.  
  
⸻  
  
**DECISION 004**  
  
Store Imported Orders  
Store Imported Orders  
  
Decision:  
Decision:  
  
Imported orders SHALL be stored locally.  
Imported orders SHALL be stored locally.  
  
Reason:  
Reason:  
  
Historical analytics.  
  
FIFO valuation.  
FIFO valuation.  
  
Financial audit.  
  
Formula Inspector.  
Formula Inspector.  
  
Forecasting.  
  
Cash Flow.  
Cash Flow.  
  
AI analysis.  
AI analysis.  
  
Order Lookup.  
  
Without local persistence these capabilities become impossible or unreliable.  
  
This does NOT transform the application into an Order Management System.  
This does NOT transform the application into an Order Management System.  
  
⸻  
  
**DECISION 005**  
  
Order Lookup Instead Of Order Management  
  
Decision:  
Decision:  
  
Implement Order Lookup only.  
Implement Order Lookup only.  
  
Do not implement a complete order management interface.  
Do not implement a complete order management interface.  
  
Reason:  
  
The objective is financial auditing.  
The objective is financial auditing.  
  
Operational editing belongs to Eazy Order.  
  
⸻  
  
**DECISION 006**  
  
Revenue Recognition  
Revenue Recognition  
  
Decision:  
Decision:  
  
Revenue becomes realized only after Delivered.  
  
Reason:  
Reason:  
  
Confirmed orders are not guaranteed revenue.  
Confirmed orders are not guaranteed revenue.  
  
Financial statements must reflect actual delivered business.  
Financial statements must reflect actual delivered business.  
  
Forecasts are separated from realized profit.  
Forecasts are separated from realized profit.  
  
⸻  
  
**DECISION 007**  
  
FIFO Inventory  
FIFO Inventory  
  
Decision:  
  
FIFO is mandatory.  
  
Average Cost is rejected.  
  
Reason:  
Reason:  
  
FIFO preserves historical inventory valuation.  
  
Returned inventory can recover its original cost.  
Returned inventory can recover its original cost.  
  
Historical profitability remains accurate.  
  
Average Cost would distort profitability after multiple purchase prices.  
Average Cost would distort profitability after multiple purchase prices.  
  
This decision is immutable.  
This decision is immutable.  
  
⸻  
  
**DECISION 008**  
  
Expected Returns  
Expected Returns  
  
Decision:  
Decision:  
  
Expected Returns never restore inventory.  
Expected Returns never restore inventory.  
  
Reason:  
Reason:  
  
The products have not physically returned.  
  
Inventory does not exist inside the warehouse yet.  
  
Only physically received Returned shipments restore inventory.  
Only physically received Returned shipments restore inventory.  
  
⸻  
  
**DECISION 009**  
  
Shipping Cost  
  
Decision:  
Decision:  
  
Customer Shipping Fee and Actual Shipping Cost are different financial values.  
Customer Shipping Fee and Actual Shipping Cost are different financial values.  
  
Reason:  
Reason:  
  
The business frequently subsidizes shipping.  
  
Ignoring this difference produces incorrect profit calculations.  
Ignoring this difference produces incorrect profit calculations.  
  
Both values must remain independent.  
Both values must remain independent.  
  
⸻  
  
**DECISION 010**  
  
API First Architecture  
API First Architecture  
  
Decision:  
  
Every external system communicates through adapters.  
Every external system communicates through adapters.  
  
Reason:  
  
External APIs evolve.  
External APIs evolve.  
  
Internal business logic should remain stable.  
Internal business logic should remain stable.  
  
Future integrations must require adapter changes only.  
  
⸻  
  
**DECISION 011**  
  
Formula Inspector  
Formula Inspector  
  
Decision:  
  
Every calculated KPI must expose its calculation.  
Every calculated KPI must expose its calculation.  
  
Reason:  
Reason:  
  
Business owners must trust the numbers.  
Business owners must trust the numbers.  
  
Financial transparency is mandatory.  
  
Every value must be explainable.  
  
Hidden calculations are forbidden.  
Hidden calculations are forbidden.  
  
⸻  
  
**DECISION 012**  
  
Seed Data  
Seed Data  
  
Decision:  
Decision:  
  
The first implementation uses realistic seed data.  
The first implementation uses realistic seed data.  
  
Reason:  
Reason:  
  
Production APIs are not yet available.  
Production APIs are not yet available.  
  
Development should continue without waiting.  
Development should continue without waiting.  
  
Later synchronization must replace seed data seamlessly.  
Later synchronization must replace seed data seamlessly.  
  
⸻  
  
**DECISION 013**  
  
Background Synchronization  
Background Synchronization  
  
Decision:  
Decision:  
  
Dashboards never call production APIs directly.  
Dashboards never call production APIs directly.  
  
Reason:  
Reason:  
  
Performance.  
  
Reliability.  
  
Rate Limits.  
Rate Limits.  
  
Offline resilience.  
Offline resilience.  
  
Historical consistency.  
  
⸻  
  
**DECISION 014**  
  
Local Database  
  
Decision:  
  
The local database is the analytical source.  
The local database is the analytical source.  
  
Operational APIs are synchronization sources.  
  
Reason:  
Reason:  
  
Fast reporting.  
  
Historical consistency.  
Historical consistency.  
  
Reliable calculations.  
Reliable calculations.  
  
Forecasting.  
Forecasting.  
  
Auditability.  
Auditability.  
  
⸻  
  
**DECISION 015**  
  
Financial Correctness  
  
Decision:  
Decision:  
  
Financial correctness overrides every engineering optimization.  
Financial correctness overrides every engineering optimization.  
  
Reason:  
Reason:  
  
Incorrect profit is worse than slow software.  
Incorrect profit is worse than slow software.  
  
Financial trust is the core value of this product.  
  
⸻  
  
**END OF FILE**  
  
000A_PROJECT_DECISION_PRINCIPLES.md  
000A_PROJECT_DECISION_PRINCIPLES.md  
  
Version 1.0.0  
Version 1.0.0  
  
Status: FINAL  
