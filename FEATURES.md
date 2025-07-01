# ✨ Callsign Features

Callsign is a developer-first OpenAPI explorer and HTTP client built natively for VS Code. It eliminates the need to leave your editor when working with REST APIs by providing fast, keyboard-friendly tooling for reading specs, making requests, and generating code.

---

## 🔍 API Explorer

Explore your OpenAPI schema interactively within VS Code:

-   **Grouped by Tag** – Endpoints are categorized by tag for intuitive browsing.
-   **Readable Format** – Method, path, and summary are displayed with proper alignment and color-coding.
-   **Expandable Endpoints** – Click a route to view parameters, body schema, and more.
-   **Live Spec Loading** – Load OpenAPI 3.x specs from URL or local file.

---

## ⚡️ Built-In API Client

Callsign includes a native request runner panel:

-   **Params, Headers, Body Input** – Set request parameters in a simple form-based UI.
-   **Environment Headers** – Define and reuse auth headers for different environments.
-   **Instant Feedback** – See formatted response data in real-time.
-   **Request History** – View and replay past requests.

---

## 🧩 Code Generation

Generate client-side API code in seconds:

-   **Supports Fetch / Axios / Node / XHR clients**
-   **Powered by `openapi-typescript-codegen`**
-   **Scaffold output to `/src/generated-api` or custom path**
-   **Ideal for frontend consumption of REST APIs**

---

## 📋 cURL Preview & Export

Quickly preview and share API requests:

-   **One-click “Copy as cURL” from the Request Panel**
-   **Clean formatting with headers, query params, and JSON body**
-   **Ideal for debugging, sharing, or reproducing issues in terminal**
-   **Supports common methods: GET, POST, PUT, DELETE**

---

## 🔐 Auth Header Management

-   **Save Auth Credentials** – Store headers securely with VS Code’s secrets API.
-   **Quick Switch Between Tokens** – Pick active credentials from a Command Palette menu.
-   **Key/Value Editing** – Add, edit, and delete auth headers easily.

---

## 🧠 Keyboard-Friendly UX

-   **Command Palette-First Design**
-   Trigger any major action (`Search Routes`, `Run Request`, `Generate Code`, etc.) via `Cmd+Shift+P` / `Ctrl+Shift+P`.

---

## 🧪 Upcoming Features (Planned)

-   [ ] Mock server generation for frontend development

---

## 🔧 Developer Experience

-   Built with native VS Code APIs
-   Designed for fast iteration and keyboard-first workflows
-   Code generation powered by [`openapi-typescript-codegen`](https://github.com/ferdikoomen/openapi-typescript-codegen)

---

## 💬 Suggestions?

File a [GitHub issue](https://github.com/your-org/callsign/issues) to share feedback and feature requests.

---

**Callsign** is built for developers who want the power of Postman and Swagger UI without leaving VS Code. 🧠
