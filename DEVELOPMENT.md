# Development Guide

## Prerequisites

- Node.js (v18 or higher)
- VS Code

## Setup

1. Install dependencies:
```bash
   npm install
```

2. Install UI dependencies:
```bash
   cd ui && npm install
```

## Running the Extension Locally

### Quick Start
Press **F5** in VS Code - this will:
- Start the build watchers (TypeScript + esbuild)
- Start the Vue.js UI dev server
- Launch the Extension Development Host

### Manual Start (Alternative)
1. Start the dev server:
```bash
   npm run dev
```

2. Press **F5** to launch the Extension Development Host

## Available Scripts

- `npm run dev` - Run both extension and UI in watch mode
- `npm run watch` - Watch extension only (TypeScript + esbuild)
- `npm run build-all` - Build both UI and extension for production
- `npm run lint` - Run ESLint
- `npm run check-types` - Run TypeScript type checking

## Project Structure
```
vscode-callsign/
├── src/           # Extension source code
├── ui/            # Vue.js UI application
├── dist/          # Compiled extension output
└── .vscode/       # VS Code configuration
```

## Testing API Requests

For local HTTPS APIs (e.g., `https://localhost:44348`):
- SSL certificate validation is automatically bypassed for localhost
- Make sure your API is running before testing endpoints

## Troubleshooting

**Extension not updating?**
- The watchers should auto-rebuild, but you may need to reload the Extension Development Host (Ctrl+R / Cmd+R)

**Port conflicts?**
- UI dev server runs on a default port (check `ui/vite.config.ts`)
- Make sure no other instances are running

**TypeScript errors?**
- Run `npm run check-types` to see all type errors
- Warnings won't block the build, but should be addressed
