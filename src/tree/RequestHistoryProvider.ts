import * as vscode from 'vscode';
import type { RequestSnapshot } from '../types';
import { loadHistory } from '../services/HistoryService';

export class RequestHistoryProvider implements vscode.TreeDataProvider<RequestHistoryItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private _snapshots: RequestSnapshot[] = [];
    private _extensionContext: vscode.ExtensionContext | undefined;

    constructor(context: vscode.ExtensionContext) {
        // this._snapshots = initialSnapshots;
        this._extensionContext = context;
        this._snapshots = loadHistory();
    }

    setSnapshots(snapshots: RequestSnapshot[]) {
        this._snapshots = snapshots;
        this.refresh();
    }

    refresh(): void {
        this._snapshots = loadHistory();
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: RequestHistoryItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<RequestHistoryItem[]> {
        return Promise.resolve(this._snapshots.map(snapshot => new RequestHistoryItem(snapshot)));
    }

    getAllSnapshots(): RequestSnapshot[] {
        return this._snapshots;
    }
}

class RequestHistoryItem extends vscode.TreeItem {
    constructor(public readonly snapshot: RequestSnapshot) {
        super(`${snapshot.method.toUpperCase()} ${snapshot.status}`, vscode.TreeItemCollapsibleState.None);

        const color = getStatusColor(snapshot.status);
        this.description = new Date(snapshot.timestamp).toLocaleTimeString();
        this.tooltip = JSON.stringify(snapshot, null, 2);
        this.iconPath = new vscode.ThemeIcon('history', color);

        this.contextValue = 'requestHistoryItem';
        // this.command = {
        //     command: 'callsign.openRoute',
        //     title: 'Open Route',
        //     arguments: [snapshot],
        // };
    }
}

export function getStatusColor(status: number) {
    if (status >= 200 && status < 300) {
        return new vscode.ThemeColor('charts.green'); // Success
    } else if (status >= 300 && status < 400) {
        return new vscode.ThemeColor('charts.blue'); // Redirect
    } else if (status >= 400 && status < 500) {
        return new vscode.ThemeColor('charts.orange'); // Client Error
    } else if (status >= 500) {
        return new vscode.ThemeColor('errorForeground'); // Server Error
    } else {
        return new vscode.ThemeColor('charts.blue'); // Unknown or custom default
    }
}
