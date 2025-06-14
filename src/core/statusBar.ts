import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export type StatusState = 'idle' | 'generating' | 'error' | 'no-spec';

export function initStatusBar(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'callsign.showCommands'; // Optional: command palette or quick actions
    statusBarItem.tooltip = 'Callsign – OpenAPI tools for your workspace';
    statusBarItem.text = '$(plug) Callsign: No spec';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);
}

export function updateStatusBar(state: StatusState, routeCount = 0, pinnedCount = 0) {
    switch (state) {
        case 'generating':
            statusBarItem.text = '$(sync~spin) Callsign: Generating...';
            statusBarItem.tooltip = 'Generating API client code...';
            break;
        case 'error':
            statusBarItem.text = '$(error) Callsign: Error';
            statusBarItem.tooltip = 'An error occurred';
            break;
        case 'no-spec':
            statusBarItem.text = '$(plug) Callsign: No spec';
            statusBarItem.tooltip = 'No OpenAPI spec loaded';
            break;
        case 'idle':
        default:
            statusBarItem.text = `$(list-selection) Callsign: ${routeCount} routes${
                pinnedCount ? `, ${pinnedCount} pinned` : ''
            }`;
            statusBarItem.tooltip = `OpenAPI spec loaded with ${routeCount} routes`;
            break;
    }
}
