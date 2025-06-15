# 🚀 Callsign – OpenAPI Explorer & HTTP Client for VS Code

Callsign is a modern, developer-first OpenAPI extension for VS Code that turns your Swagger spec into an interactive API explorer and HTTP client—without leaving your editor.

Whether you're building an API or consuming one, Callsign helps you **explore**, **test**, and **generate** client code from your OpenAPI spec.

---

## ✨ Features

-   🔍 **OpenAPI Viewer**
    Instantly browse your OpenAPI spec in a fast, readable UI—grouped by tag like Swagger UI, but native to VS Code.

-   ⚙️ **Expandable Endpoints**
    Click to expand any route and view method, description, path parameters, and more.

-   🧩 **VS Code Native**
    Designed to feel right at home inside your editor, using native APIs and webviews.

-   💻 **No Context Switching**
    Stay inside your dev environment—no tabs, no clutter.

-   🧪 **API Request Panel**
    Preview and send real requests with headers, path and query params.

-   👀 **cURL Preview**
    Instantly preview a fully-formed `curl` command based on the request panel inputs.

-   🛠️ **Code Generation**
    Generate TypeScript clients using `openapi-typescript-codegen` directly from a saved spec.

-   🧑‍🍳 **Mock Server Support (planned)**
    Preview and simulate endpoints without needing the backend live.

---

## 📦 Usage

1. **Open Command Palette** → `Callsign: Show Commands`
   Or use the default shortcut: `Ctrl+Shift+c`

2. **Choose a spec** from saved URLs or paste a new OpenAPI spec URL

3. **Browse** endpoints grouped by tag

4. **Click any route** to view its method, summary, parameters, and schema (if available)

> Want to test the API or generate code? That's next on the roadmap—stay tuned!

---

## 💻 Developer Experience

-   Minimal runtime dependencies
-   Offline support for local OpenAPI files
-   Fully native to VS Code (no Electron hacks or browser dependencies)
-   Codegen powered by [`openapi-typescript-codegen`](https://github.com/ferdikoomen/openapi-typescript-codegen)

---

## 🧠 Roadmap

Callsign is built to become a single-source OpenAPI toolkit inside VS Code:

### ✅ MVP

-   [x] Load OpenAPI v3 spec from URL
-   [x] Tree view grouped by tag
-   [x] Route expansion + details
-   [x] Add basic auth / API key support
-   [x] Add pinned routes
-   [x] Add saved requests history
-   [x] Code generation (TS clients)

### 🛠️ In Progress

-   [ ] Add testing UI

### 🔜 Planned

-   [ ] Mock server preview
-   [ ] Theme customization
-   [ ] File-based spec loading (local dev)

---

## 📓 Release Notes

### v0.1.0

-   Initial release
-   Grouped route explorer
-   Route details panel
-   Support for OpenAPI v3.0 JSON
-   Client Code generation

---

## 📬 Author

Built by [Ian Davis](https://iandavis.dev) – a toolmaker for developers who want fewer tabs and better DX.

---

## 🙌 Feedback & Contributions

💡 Have a feature request or bug? [Submit an issue](https://github.com/davis-ian/callsign/issues)
✨ Want to contribute? PRs are welcome!
⭐ Love the extension? Star it on GitHub and share it with your team.

---

## 🔗 Resources

-   [VS Code Extension API Docs](https://code.visualstudio.com/api)
-   [OpenAPI Specification](https://swagger.io/specification/)
-   [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen)

---

**Callsign – make your API your ally.**
