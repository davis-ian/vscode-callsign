// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AuthService } from './services/AuthService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Callsign extension activated');

    let disposable = vscode.commands.registerCommand('callsign.openPanel', () => {
        const panel = vscode.window.createWebviewPanel('callsignDocs', 'Callsign', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
        // listen for button clicks from the webview
        panel.webview.onDidReceiveMessage(
            message => handleMessage(message, panel, context),
            undefined,
            context.subscriptions,
        );
    });

    context.subscriptions.push(disposable);
}

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

// This method is called when your extension is deactivated
export function deactivate() {}

async function handleMessage(message: any, panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    const authService = new AuthService(context);
    const { command, requestId, payload } = message;

    try {
        let data;

        switch (command) {
            case 'loadJson':
                await handleLoadJson(message, panel, context);
                break;
            case 'storeAuth':
                const { type, name, value } = payload || message.payload;

                console.log('storing auth @ extension.ts', type, name);
                await authService.storeCredential({ name, type }, value);
                data = { success: true };
                break;

            case 'getAllCredentials':
                data = await authService.getAllCredentials();
                break;

            case 'clearAllCreds':
                await authService.clearAllCredentials();
                data = { success: true };

                break;
            case 'getCredentialById':
                const id = payload?.id || message.id;
                data = await authService.getCredential(id);
                break;

            case 'getAuthHeader':
                const credId = payload.credentialId;
                const credential = await authService.getCredential(credId);
                if (credential) {
                    const headers = authService.formatForHeader(credential);

                    const headerEntry = Object.entries(headers)[0];
                    data = headerEntry ? { key: headerEntry[0], value: headerEntry[1] } : null;
                } else {
                    data = null;
                }
                break;

            case 'makeRequest':
                data = await makeAuthenticatedRequest(payload, authService);
                break;

            default:
                panel.webview.postMessage({ command: 'error', error: 'Unknown command' });
        }

        if (requestId) {
            panel.webview.postMessage({
                command: 'response',
                requestId,
                data,
                error: null,
            });
        } else {
            panel.webview.postMessage({ command: `${command}Response`, data });
        }
    } catch (error) {
        console.error('Extention error: ', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        if (requestId) {
            panel.webview.postMessage({
                command: 'response',
                requestId,
                data: null,
                error: errorMessage,
            });
        } else {
            panel.webview.postMessage({ command: `${command}Response`, errorMessage });
        }
    }
}

async function makeAuthenticatedRequest(payload: any, authService: AuthService) {
    const { endpoint, authId, body, params } = payload;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (authId) {
        const credential = await authService.getCredential(authId);
        if (credential) {
            const authHeaders = authService.formatForHeader(credential);
            Object.assign(headers, authHeaders);
        }
    }

    let url = endpoint.url;
    if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const response = await fetch(url, {
        method: endpoint.method.toUpperCase(),
        headers,
        body: body && endpoint.method.toUppperCase() !== 'GET' ? JSON.stringify(body) : undefined,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    let responseBody;

    try {
        const text = await response.text();
        console.log('Raw response text:', text);

        if (!text || text.trim() === '') {
            // Empty response - create a meaningful error message
            if (!response.ok) {
                responseBody = {
                    error: `HTTP ${response.status}`,
                    message: response.statusText || 'Request failed',
                    status: response.status,
                };
            } else {
                responseBody = null;
            }
        } else {
            // Try to parse as JSON first
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                try {
                    responseBody = JSON.parse(text);
                } catch (parseError) {
                    responseBody = text; // Fallback to raw text
                }
            } else {
                responseBody = text;
            }
        }
    } catch (error) {
        console.error('Error reading response:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        responseBody = {
            error: 'Failed to read response',
            message: errorMessage,
            status: response.status,
        };
    }

    console.log('Final response body:', responseBody);

    return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        timestamp: new Date().toISOString(),
    };
}

async function handleLoadJson(message: any, panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    console.log('HANDLING LOAD JSON', message);
    const { requestId, payload } = message;
    const { type, content, url } = payload || message;

    const sendResponse = (data: any, error?: string) => {
        if (requestId) {
            // New pattern response
            panel.webview.postMessage({
                command: 'response',
                requestId,
                data: error ? null : data,
                error: error || null,
            });
        } else {
            // Legacy pattern response
            if (error) {
                panel.webview.postMessage({ command: 'error', error });
            } else {
                panel.webview.postMessage({ command: 'showJson', json: data });
            }
        }
    };

    if (type === 'file' && content) {
        try {
            const jsonData = JSON.parse(content);
            sendResponse(jsonData);
        } catch (err) {
            sendResponse(null, 'Invalid JSON file content');
        }
    } else if (type === 'url' && url) {
        try {
            console.log('fetching from url: ', url);
            const response = await fetch(url);
            console.log('Response status: ', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const jsonData = await response.json();

            console.log('JSON DATA fetched ', jsonData);

            sendResponse(jsonData);
        } catch (error) {
            console.error('Fetch error: ', error);
            const errorMessage = error instanceof Error ? error.message : String(error);

            sendResponse(null, `Failed to fetch JSON from URL: ${errorMessage}`);
        }
        // fetch(url)
        //     .then(res => {
        //         console.log(res, 'url json res');
        //         res.json();
        //     })
        //     .then(jsonData => {
        //         console.log('JSON DATA fetched: ', jsonData);
        //         sendResponse(jsonData);
        //     })
        //     .catch(() => {
        //         sendResponse(null, 'Failed to fetch JSON from URL');
        //     });
    } else {
        const defaultPath = path.join(context.extensionPath, 'src', 'swagger-test.json');
        try {
            const jsonData = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
            sendResponse(jsonData);
        } catch (err) {
            sendResponse(null, 'Failed to read default JSON file');
        }
    }
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
