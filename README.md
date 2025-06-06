# Callsign 🛰️

**Callsign** is a modern, VS Code-native OpenAPI companion built for full-stack developers. It simplifies local API development by providing an integrated, fast, and beautiful interface for exploring, testing, and generating code from OpenAPI specs—all without leaving VS Code.

## ✨ Features

-   🔍 **OpenAPI Viewer** — Beautiful, readable endpoint explorer grouped by tags, like Swagger UI, but faster and more responsive.
-   🧩 **VS Code Native** — Works directly in your editor, with no browser tabs or context switching.
-   ⚙️ **Expandable Endpoints** — Click any endpoint to view method, description, request body, response schema, and more.
-   🧪 **Interactive Testing (planned)** — Run API requests from inside the panel with saved environment headers.
-   🛠️ **Client Code Generation (planned)** — Generate TypeScript client code for calling endpoints, scoped by tag.
-   🧪 **Mock Server Preview (planned)** — Generate mock endpoints to simulate backend during frontend development.
-   🎯 **Lightweight & Fast** — Minimal dependencies and native performance inside the VS Code webview.

> TODO: Add screenshots or GIFs (ex: `images/overview.gif`, `images/expanding.gif`)

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

---

## 📦 Requirements

Callsign reads OpenAPI JSON files. You can:

-   Load a local file.
-   Load a remote OpenAPI URL (CORS must be enabled).
-   Auto-load from a `swagger.json` in your workspace (coming soon).

> No external services required.

## ⚙️ Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

-   `myExtension.enable`: Enable/disable this extension.
-   `myExtension.thing`: Set to `blah` to do something.

> TODO: Add settings when environment variables, theme customization, or auto-loading are implemented.

## 💻 Who It's For

Callsign is built for:

-   Frontend developers consuming REST APIs.
-   Full-stack teams working locally across frontend/backend code.
-   Developers who prefer working **inside VS Code**.

---

## 🐞 Known Issues

-   Currently only supports OpenAPI v3 JSON.
-   No support for authentication headers or auth flows (coming soon).
-   Testing feature is in progress.

---

## 📓 Release Notes

### 0.1.0

-   Initial launch with panel UI
-   Grouped endpoints by tag
-   Route expansion and display of summary, method, and path

> TODO: Fill in future releases.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

-   [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

-   Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
-   Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
-   Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

-   [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
-   [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

## 🧠 Vision & Roadmap

Callsign aims to be the **Postman + Swagger UI + OpenAPI generator**—inside VS Code.

### ✅ MVP Goals

-   [x] Load OpenAPI from URL or file
-   [x] Display grouped route list
-   [x] Expand route for details

### 🛠️ Next Sprints

-   [ ] Add request body/response schema display
-   [ ] Add API testing UI
-   [ ] Add client code generator (TS)
-   [ ] Add mock server generator
-   [ ] Add dark/light theme auto-detection
-   [ ] Add auth/token support

---

## 📚 Resources

-   [VS Code Extension Docs](https://code.visualstudio.com/api)
-   [OpenAPI Spec](https://swagger.io/specification/)
-   [Redocly Inspiration](https://redocly.com/)
-   [Mintlify Docs Inspiration](https://mintlify.com/blog/top-7-api-documentation-tools-of-2025)

---

## 🧪 Working with Markdown

You can preview this file in VS Code with:

-   `Cmd+\` to split editor
-   `Shift+Cmd+V` to preview
-   `Ctrl+Space` to see Markdown snippets

---

**Enjoy using Callsign—and may your APIs be well documented!**

## 📬 Contact

Created by [Ian Davis](https://iandavis.dev) — Built to showcase dev experience and simplify local API work
