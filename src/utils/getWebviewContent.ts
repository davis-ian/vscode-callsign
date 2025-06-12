import * as vscode from 'vscode';
import * as fs from 'fs';

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    const isDev = process.env.NODE_ENV === 'development';

    console.log('IS DEV: ', isDev);
    if (isDev) {
        return getDevServerHtml();
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

    return html;
}

function getDevServerHtml() {
    // Just load dev server
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
            <script>

            </script>
            <script type="module" src="http://localhost:5173/src/main.ts"></script>
            </body>
            </html>
            `;
}
