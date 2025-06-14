import * as vscode from 'vscode';
import type { OpenApiRoute } from '../types';

export class RouteTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        method?: string,
        description?: string,
    ) {
        super(label, collapsibleState);
        this.description = description;
        this.tooltip = `${method?.toUpperCase()} ${label}`;
        this.iconPath = method ? methodIcons[method.toLowerCase()] : '';
    }
}

const methodIcons: Record<string, vscode.ThemeIcon | string> = {
    get: new vscode.ThemeIcon('arrow-right', new vscode.ThemeColor('charts.blue')),
    post: new vscode.ThemeIcon('add', new vscode.ThemeColor('charts.green')),
    put: new vscode.ThemeIcon('edit', new vscode.ThemeColor('charts.orange')),
    delete: new vscode.ThemeIcon('trash', new vscode.ThemeColor('errorForeground')),
};
