**015_USER_INTERFACE_SPECIFICATION.md**  
  
Version: 1.0.0  
  
Status: FINAL  
  
Priority: HIGH  
  
Read Order: 17 / Repository  
  
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
* 012_API_ARCHITECTURE.md  
* 013_SYNCHRONIZATION_ENGINE.md  
* 014_DASHBOARD_ARCHITECTURE.md  
  
⸻  
  
**PURPOSE**  
  
This document defines the User Interface (UI) specification for the platform.  
  
The goal is to create an interface that enables business owners to understand the health of their business in seconds, investigate problems in minutes, and make decisions confidently.  
  
The UI is a presentation layer only.  
  
Business logic belongs to the underlying engines.  
  
⸻  
  
**DESIGN PHILOSOPHY**  
  
The interface shall be:  
  
* Clean  
* Modern  
* Minimal  
* Fast  
* Executive-focused  
* Data-driven  
* Bilingual  
  
The interface should feel like a premium SaaS product rather than an ERP system.  
  
⸻  
  
**DESIGN PRINCIPLES**  
  
Every screen shall satisfy:  
  
* One primary purpose.  
* Minimal cognitive load.  
* Clear visual hierarchy.  
* Consistent navigation.  
* Predictable interactions.  
* Responsive layout.  
  
Beauty must never reduce usability.  
  
⸻  
  
**COLOR PHILOSOPHY**  
  
Colors communicate business meaning.  
  
Suggested meanings:  
  
Green  
  
Positive  
  
Blue  
  
Informational  
  
Orange  
  
Warning  
  
Red  
  
Critical  
  
Gray  
  
Inactive  
  
Colors shall never be the only indicator.  
  
Icons and labels must reinforce meaning.  
  
⸻  
  
**TYPOGRAPHY**  
  
Typography should prioritize readability.  
  
Hierarchy:  
  
* Page Title  
* Section Title  
* KPI Title  
* Supporting Text  
* Metadata  
  
Large numbers should be highly legible.  
  
⸻  
  
**SPACING**  
  
Every screen shall use consistent spacing.  
  
Spacing should create visual groups.  
  
Crowded layouts are prohibited.  
  
Whitespace improves comprehension.  
  
⸻  
  
**ICONOGRAPHY**  
  
Icons should communicate business meaning.  
  
Examples:  
  
Revenue  
  
Profit  
  
Inventory  
  
Marketing  
  
Shipping  
  
Cash Flow  
  
Settings  
  
AI  
  
Icons support navigation.  
  
Icons never replace text labels.  
  
⸻  
  
**NAVIGATION**  
  
Primary Navigation should include:  
  
* Dashboard  
* Finance  
* Inventory  
* Marketing  
* Shipping  
* Settlements  
* Reports  
* Decision Center  
* AI Copilot  
* Settings  
  
Navigation remains consistent across every page.  
  
⸻  
  
**PAGE STRUCTURE**  
  
Recommended page layout:  
  
Header  
  
↓  
  
Global Filters  
  
↓  
  
Primary KPIs  
  
↓  
  
Charts  
  
↓  
  
Detailed Tables  
  
↓  
  
Insights  
  
↓  
  
Drill Down  
  
The layout should remain predictable.  
  
⸻  
  
**HEADER**  
  
The application header should display:  
  
* Logo  
* Store Selector  
* Date Filter  
* Global Search  
* Notifications  
* Language Switch  
* Theme Switch  
* User Profile  
  
Header remains visible throughout the application.  
  
⸻  
  
**GLOBAL FILTER BAR**  
  
Global filters include:  
  
* Date Range  
* Store  
* Campaign  
* Product  
* Governorate  
* Shipment Status  
  
Global filters affect all supported widgets.  
  
⸻  
  
**KPI CARDS**  
  
Every KPI Card shall display:  
  
* KPI Name  
* Current Value  
* Previous Period Change  
* Trend Arrow  
* Formula Inspector  
* Drill Down  
* Last Updated  
  
Users should understand KPI health immediately.  
  
⸻  
  
**KPI COLORS**  
  
KPI colors shall reflect business meaning.  
  
Examples:  
  
Increasing Profit  
  
Green  
  
Increasing Revenue  
  
Green  
  
Increasing Return Rate  
  
Red  
  
Increasing Shipping Subsidy  
  
Orange  
  
Negative Net Profit  
  
Red  
  
Color rules should remain consistent throughout the application.  
  
⸻  
  
## END OF PART 1  
  
  
**\**  
  
  
**CONTINUATION OF 015_USER_INTERFACE_SPECIFICATION.md**  
  
⸻  
  
**CHART DESIGN**  
  
Charts shall emphasize business trends rather than decorative visuals.  
  
Every chart should contain:  
  
* Clear Title  
* Time Period  
* Legend  
* Tooltip  
* Drill Down  
* Export Option  
  
Charts must remain readable on desktop and mobile.  
  
⸻  
  
**TABLE DESIGN**  
  
Analytical tables shall support:  
  
* Sorting  
* Filtering  
* Pagination  
* Sticky Headers  
* Column Selection  
* Row Expansion  
* Export  
  
Large datasets should remain performant.  
  
⸻  
  
**DRILL-DOWN EXPERIENCE**  
  
Every drill-down follows the same navigation philosophy:  
  
Executive KPI  
  
↓  
  
Detailed KPI  
  
↓  
  
Business Breakdown  
  
↓  
  
Order Lookup  
  
↓  
  
Formula Inspector  
  
↓  
  
Supporting Business Events  
  
Users should never reach a dead end.  
  
⸻  
  
**FORMULA INSPECTOR PANEL**  
  
Formula Inspector shall open as a side panel or modal.  
  
It displays:  
  
* Formula Name  
* Formula Version  
* Business Meaning  
* Inputs  
* Intermediate Calculations  
* Output  
* Source Records  
  
This panel is read-only.  
  
⸻  
  
**ORDER LOOKUP SCREEN**  
  
The Order Lookup page should display:  
  
**General Information**  
  
* Order ID  
* Store  
* Customer Governorate  
* Order Date  
* Shipment Status  
  
**Financial Section**  
  
* Product Revenue  
* Customer Shipping Fee  
* Actual Shipping Cost  
* Shipping Subsidy  
* FIFO Cost  
* Gross Profit  
* Net Profit  
  
**Operational Section**  
  
* Shipment Timeline  
* Inventory Allocation  
* Marketing Attribution  
* Settlement Reference  
  
**AI Section**  
  
* AI Explanation  
* Profit Analysis  
* Suggested Insights  
  
Order Lookup is designed for investigation, not editing.  
  
⸻  
  
**DECISION CENTER UI**  
  
The Decision Center shall organize cards into:  
  
* Critical Issues  
* Opportunities  
* Risks  
* Recommendations  
  
Every card includes:  
  
* Priority  
* Confidence  
* Business Impact  
* Suggested Action  
* Supporting KPIs  
  
⸻  
  
**AI COPILOT INTERFACE**  
  
The AI Copilot panel shall include:  
  
* Chat Interface  
* Suggested Questions  
* Context Awareness  
* Business Explanations  
* Scenario Simulation  
* Follow-up Questions  
  
The AI interface should resemble a modern conversational assistant.  
  
⸻  
  
**NOTIFICATION CENTER**  
  
Notifications shall be categorized:  
  
* Critical  
* Warning  
* Information  
* AI Recommendation  
* Synchronization  
* Inventory  
* Finance  
  
Users should filter notifications by category.  
  
⸻  
  
**SEARCH EXPERIENCE**  
  
Global Search should support:  
  
* Orders  
* Products  
* Campaigns  
* Settlements  
* Reports  
  
Results should appear instantly with categorized sections.  
  
⸻  
  
**EMPTY STATES**  
  
When no data exists, the interface should explain:  
  
* Why the page is empty.  
* What data is expected.  
* Suggested next action.  
  
Never show blank pages.  
  
⸻  
  
**LOADING STATES**  
  
Loading indicators shall communicate progress.  
  
Use:  
  
* Skeleton Screens  
* Progress Indicators  
* Status Messages  
  
Avoid blocking the entire interface unnecessarily.  
  
⸻  
  
**ERROR STATES**  
  
Errors should explain:  
  
* What happened.  
* Possible reason.  
* Recommended action.  
  
Technical details belong in logs, not user messages.  
  
⸻  
  
**SUCCESS FEEDBACK**  
  
Successful actions should provide subtle confirmation.  
  
Examples:  
  
* Data synchronized successfully.  
* Report exported.  
* Settings updated.  
  
Feedback should disappear automatically when appropriate.  
  
⸻  
  
## END OF PART 2  
  
  
**\**  
  
  
**CONTINUATION OF 015_USER_INTERFACE_SPECIFICATION.md**  
  
⸻  
  
**RESPONSIVE DESIGN**  
  
The interface shall support:  
The interface shall support:  
  
* Desktop  
* Laptop  
* Tablet  
* Mobile  
  
Each screen shall adapt gracefully.  
  
No business functionality should disappear on smaller screens.  
  
Complex tables may use optimized mobile layouts.  
  
⸻  
  
**MOBILE EXPERIENCE**  
  
Mobile priorities:  
Mobile priorities:  
  
* Executive KPIs  
* Decision Center  
* AI Copilot  
* Order Lookup  
* Notifications  
  
Advanced analytical tables may be simplified while preserving access to all information.  
  
⸻  
  
**LANGUAGE SUPPORT**  
  
The interface shall support:  
The interface shall support:  
  
English  
  
Arabic  
  
Requirements:  
Requirements:  
  
* Runtime language switching  
* RTL support  
* LTR support  
* Localized dates  
* Localized numbers  
* Localized currency formatting  
  
Language switching must not require application restart.  
  
⸻  
  
**ACCESSIBILITY**  
  
Minimum accessibility requirements include:  
Minimum accessibility requirements include:  
  
* Keyboard Navigation  
* Screen Reader Compatibility  
* Focus Indicators  
* High Contrast Support  
* Scalable Text  
* Accessible Charts  
* Accessible Tables  
  
Accessibility is a first-class requirement.  
  
⸻  
  
**THEME SUPPORT**  
  
Supported themes:  
Supported themes:  
  
* Light  
* Dark  
  
Theme affects:  
  
* Colors  
* Shadows  
* Borders  
* Charts  
* Icons  
  
Theme never affects business calculations.  
Theme never affects business calculations.  
  
⸻  
  
**PERFORMANCE TARGETS**  
  
Target user experience:  
Target user experience:  
  
Dashboard Load  
  
< 2 seconds  
< 2 seconds  
  
Navigation  
Navigation  
  
Instant  
  
Filtering  
Filtering  
  
Near Instant  
Near Instant  
  
Drill Down  
Drill Down  
  
< 1 second  
< 1 second  
  
Search  
Search  
  
Instant  
Instant  
  
Performance should remain excellent with large datasets.  
  
⸻  
  
**COMPONENT LIBRARY**  
  
Reusable UI components include:  
  
* KPI Card  
* Chart Card  
* Metric Card  
* Status Badge  
* AI Insight Card  
* Recommendation Card  
* Alert Banner  
* Data Table  
* Timeline  
* Formula Inspector Panel  
* Filter Bar  
* Search Bar  
  
Reusable components ensure consistency.  
  
⸻  
  
**STATUS BADGES**  
  
Standard status colors:  
  
Success  
Success  
  
Green  
Green  
  
Warning  
Warning  
  
Orange  
  
Error  
Error  
  
Red  
Red  
  
Information  
Information  
  
Blue  
Blue  
  
Inactive  
Inactive  
  
Gray  
  
Status badges must remain consistent across all modules.  
Status badges must remain consistent across all modules.  
  
⸻  
  
**DASHBOARD CONSISTENCY**  
  
All dashboards shall share:  
  
* Same Header  
* Same Navigation  
* Same Filter Style  
* Same KPI Layout  
* Same Card Style  
* Same Chart Style  
* Same Typography  
* Same Color Rules  
  
Consistency improves usability.  
Consistency improves usability.  
  
⸻  
  
**ANIMATIONS**  
  
Animations should be subtle.  
Animations should be subtle.  
  
Allowed:  
Allowed:  
  
* Fade  
* Slide  
* Expand  
* Skeleton Loading  
  
Avoid distracting animations.  
  
Animation supports understanding.  
Animation supports understanding.  
  
It never becomes decoration.  
  
⸻  
  
**SECURITY INDICATORS**  
  
Sensitive screens should clearly indicate:  
  
* Read Only  
* Last Synchronization  
* Data Freshness  
* User Permissions  
  
Users should understand what actions are permitted.  
Users should understand what actions are permitted.  
  
⸻  
  
**FUTURE EXTENSIBILITY**  
  
The UI architecture shall support future modules without redesign.  
The UI architecture shall support future modules without redesign.  
  
Future modules may include:  
Future modules may include:  
  
* Purchasing  
* Suppliers  
* Warehouses  
* Multi-Currency  
* Multi-Company  
* Forecast Workbench  
  
Existing navigation shall remain stable.  
Existing navigation shall remain stable.  
  
⸻  
  
**SUCCESS CRITERIA**  
  
The User Interface Specification is considered complete only if:  
The User Interface Specification is considered complete only if:  
  
* The interface is intuitive.  
* Navigation is predictable.  
* Every KPI supports drill-down.  
* Formula Inspector is accessible everywhere.  
* Decision Center is prominent.  
* AI Copilot is integrated naturally.  
* English and Arabic are fully supported.  
* Mobile responsiveness is complete.  
* Accessibility requirements are satisfied.  
* Performance remains excellent under heavy analytical workloads.  
  
The interface should feel like a modern executive intelligence platform rather than a traditional ERP application.  
  
⸻  
  
**END OF FILE**  
  
015_USER_INTERFACE_SPECIFICATION.md  
  
Version: 1.0.0  
  
Status: FINAL  
