// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "callsign" is now active!');

    // // The command has been defined in the package.json file
    // // Now provide the implementation of the command with registerCommand
    // // The commandId parameter must match the command field in package.json
    // const disposable = vscode.commands.registerCommand('callsign.helloWorld', () => {
    // 	// The code you place here will be executed every time your command is executed
    // 	// Display a message box to the user
    // 	vscode.window.showInformationMessage('Hello World from callsign!');
    // });

    let disposable = vscode.commands.registerCommand('callsign.openPanel', () => {
        const panel = vscode.window.createWebviewPanel('callsignDocs', 'Callsign', vscode.ViewColumn.One, {
            enableScripts: true,
        });
        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
        // listen for button clicks from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                if (message.command === 'loadJson') {
                    console.log('load json HEARD');
                    const jsonPath = path.join(context.extensionPath, 'src', 'swagger-test.json');
                    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    panel.webview.postMessage({ command: 'showJson', json: jsonData });
                }
            },
            undefined,
            context.subscriptions,
        );
    });

    context.subscriptions.push(disposable);
}

// function getWebViewContent(context: vscode.ExtensionContext): string {
//     // const filePath = path.join(context.extensionPath, 'media', 'webview.html');
//     // return fs.readFileSync(filePath, 'utf8');
//     const filePath = path.join(context.extensionPath, 'ui-dist', 'index.html');
//     return fs.readFileSync(filePath, 'utf8');
// }
export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
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
