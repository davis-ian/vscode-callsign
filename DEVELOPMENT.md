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

### Quick Start (Development Mode)
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

## Building and Installing Locally

If you want to install the extension in your regular VS Code instance (not the Extension Development Host):

### Build the Extension Package

1. Build the production package:
```bash
npm run package
```

This creates a `.vsix` file in your project root (e.g., `callsign-0.1.0.vsix`)

### Install the Extension

**Option 1: Using VS Code UI**
1. Open VS Code
2. Go to Extensions panel (Ctrl+Shift+X / Cmd+Shift+X)
3. Click the "..." menu at the top of the Extensions panel
4. Select "Install from VSIX..."
5. Navigate to your `.vsix` file and select it
6. Reload VS Code when prompted

**Option 2: Using Command Line**
```bash
code --install-extension callsign-0.1.0.vsix
```

**Option 3: Using Command Palette**
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Extensions: Install from VSIX..."
3. Select your `.vsix` file

### Updating Your Local Installation

When you make changes and want to update the installed extension:
1. Run `npm run package` to rebuild
2. Reinstall the new `.vsix` file using any method above
3. Reload VS Code when prompted

## Available Scripts

- `npm run dev` - Run both extension and UI in watch mode
- `npm run watch` - Watch extension only (TypeScript + esbuild)
- `npm run build-all` - Build both UI and extension for production
- `npm run package` - Build and package extension as .vsix file
- `npm run lint` - Run ESLint
- `npm run check-types` - Run TypeScript type checking

## Project Structure
```
vscode-callsign/
├── src/           # Extension source code
├── ui/            # Vue.js UI application
├── dist/          # Compiled extension output
├── .vscode/       # VS Code configuration
└── *.vsix         # Packaged extension (generated)
```

## Testing API Requests

For local HTTPS APIs (e.g., `https://localhost:44348`):
- SSL certificate validation is automatically bypassed for localhost
- Make sure your API is running before testing endpoints

## Troubleshooting

**Extension not updating in Development Host?**
- The watchers should auto-rebuild, but you may need to reload the Extension Development Host (Ctrl+R / Cmd+R)
- If changes still don't appear, stop and restart with F5

**Extension not appearing after installation?**
- Check Extensions panel to confirm it's installed and enabled
- Try reloading VS Code (Developer: Reload Window)
- Check for errors in Output panel (View > Output > select "Callsign")

**Build errors when packaging?**
- Run `npm run check-types` to identify TypeScript errors
- Run `npm run lint` to check for linting issues
- Ensure all dependencies are installed in both root and ui/ directories

**Port conflicts?**
- UI dev server runs on a default port (check `ui/vite.config.ts`)
- Make sure no other instances are running

**TypeScript errors?**
- Run `npm run check-types` to see all type errors
- Warnings won't block the build, but should be addressed

## Development vs Production

**Development Mode (F5):**
- Hot reloading enabled
- Source maps available for debugging
- Unminified code
- Faster iteration

**Production Build (.vsix):**
- Minified and optimized
- No source maps
- Smaller file size
- Ready for distribution
