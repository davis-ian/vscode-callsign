import * as vscode from 'vscode';
import * as fs from 'fs';

export function getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    context?: vscode.ExtensionContext,
) {
    const isDev = process.env.NODE_ENV === 'development';

    console.log('IS DEV: ', isDev);
    // Get the last selected spec URL from context if available
    const lastSelectedSpecUrl: string | null = context
        ? context.workspaceState.get<string>('callsign.lastSelectedSpecUrl') ?? null
        : null;

    if (isDev) {
        return getDevServerHtml(lastSelectedSpecUrl);
    }

    // --- Production: Load from built files in ui-dist ---
    const distPath = vscode.Uri.joinPath(extensionUri, 'ui-dist');
    const indexPath = vscode.Uri.joinPath(distPath, 'index.html');

    // Read raw index.html
    let html = fs.readFileSync(indexPath.fsPath, 'utf8');

    // Convert file:/// paths to webview-safe URIs
    const assetUri = (file: string) => webview.asWebviewUri(vscode.Uri.joinPath(distPath, file)).toString();

    // Rewrite ./assets/... and ./vite.svg
    html = html.replace(/"\.\/(.*?)"/g, (_match, p1) => `"${assetUri(p1)}"`);

    // Inject initial data and navigation handling script before closing body tag
    const scriptsToInject = getInitialDataScript(lastSelectedSpecUrl) + getNavigationScript();
    html = html.replace('</body>', `${scriptsToInject}</body>`);

    return html;
}

function getDevServerHtml(lastSelectedSpecUrl: string | null) {
    return /* html */ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Callsign (Dev)</title>
            </head>
            <body>
            <div id="app"></div>
            ${getInitialDataScript(lastSelectedSpecUrl)}
            ${getNavigationScript()}
            <script type="module" src="http://localhost:5173/src/main.ts"></script>
            </body>
            </html>
            `;
}

function getNavigationScript(): string {
    return /* html */ `
        <script>
            // Store router instance globally so we can navigate from extension messages
            window.vscodeRouter = null;

            // Listen for messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;

                console.log('Webview received message:', message);

                switch (message.command) {
                    case 'navigate':
                        console.log('Navigation message received:', message.url);
                        // Navigate to specific route
                        if (window.vscodeRouter) {
                            console.log('Router available, navigating to:', message.url);
                            window.vscodeRouter.push(message.url);
                        } else {
                            console.log('Router not ready, storing navigation for later:', message.url);
                            // Store navigation command for later if router isn't ready yet
                            window.pendingNavigation = message.url;
                        }
                        break;
                    default:
                        console.log('Unhandled message command:', message.command);
                        break;
                }
            });

            console.log('Navigation script loaded');
        </script>
    `;
}

function getInitialDataScript(lastSelectedSpecUrl: string | null): string {
    return /* html */ `
        <script>
            // Inject initial data from VS Code extension
            window.callsignInitialData = {
                lastSelectedSpecUrl: ${JSON.stringify(lastSelectedSpecUrl)},
                timestamp: new Date().toISOString()
            };
            console.log('Initial data injected:', window.callsignInitialData);
        </script>
    `;
}
