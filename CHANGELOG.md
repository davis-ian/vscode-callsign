# Change Log

All notable changes to the "callsign" extension will be documented in this file.

## [0.2.0] – 2025-06-15

### ✨ Added

-   **API Request Panel**
    You can now send test requests directly from the Callsign route view using a built-in panel.
    Supports custom headers, query params, and request body preview.

-   **cURL Preview Command**
    Instantly copy the current request as a `curl` command using `Callsign: Copy as cURL`.
    Helpful for debugging or sharing with teammates.

-   **QuickPick-Powered Route Search**
    `Callsign: Search Routes` command added.
    Lets you fuzzy-search and jump to a route by method + path.

-   **Request History Panel**
    `Callsign: Request History` command added.
    Lets you details on past requests.

### 🧩 Improved

-   Refined layout and spacing in the Callsign route panel.
-   Added icons for methods (GET, POST, etc.) and improved tag grouping display.

---

## [0.1.0] – 2025-06-14

### Initial Release

-   Route Explorer panel with tag grouping
-   Route expansion with summary, method, and description
-   Spec loading from saved URLs
-   Built-in QuickPick commands:
    -   `Callsign: Show Commands`
    -   `Callsign: Load Spec from URL`
    -   `Callsign: Add/Remove Spec`

---
