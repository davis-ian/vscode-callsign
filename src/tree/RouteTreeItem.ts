import * as vscode from 'vscode';
import type { OpenApiRoute } from '../types';
import { isPinned } from '../core/pinnedRoutes';
import { logInfo } from '../core/logger';

export class RouteTreeItem extends vscode.TreeItem {
    public readonly route?: OpenApiRoute;

    constructor(
        public readonly label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        route?: OpenApiRoute,
        context?: vscode.ExtensionContext,
        isActive?: boolean,
    ) {
        super(label, collapsibleState);

        if (route?.method) {
            this.description = route?.details.description;
            this.tooltip = new vscode.MarkdownString(
                `**${route?.method.toUpperCase()}** ${route?.path}\n\n${route?.details?.summary ?? ''}`,
            );
        }

        const method = route?.method.toLocaleLowerCase();
        const color = method ? methodColors[method] : undefined;

        this.iconPath = method ? new vscode.ThemeIcon('circle-small-filled', color) : '';
        this.route = route;

        logInfo(route, 'route');

        if (route && context) {
            this.contextValue =
                route && context ? (isPinned(route, context) ? 'routePinned' : 'routeUnpinned') : undefined;
        }

        if (isActive) {
            this.iconPath = new vscode.ThemeIcon('code', color);
        }
    }
}

const methodIcons: Record<string, vscode.ThemeIcon | string> = {
    get: new vscode.ThemeIcon('circle-small-filled', new vscode.ThemeColor('charts.blue')),
    post: new vscode.ThemeIcon('circle-small-filled', new vscode.ThemeColor('charts.green')),
    put: new vscode.ThemeIcon('circle-small-filled', new vscode.ThemeColor('charts.orange')),
    delete: new vscode.ThemeIcon('circle-small-filled', new vscode.ThemeColor('errorForeground')),
    // get: new vscode.ThemeIcon('arrow-right', new vscode.ThemeColor('charts.blue')),
    // post: new vscode.ThemeIcon('add', new vscode.ThemeColor('charts.green')),
    // put: new vscode.ThemeIcon('edit', new vscode.ThemeColor('charts.orange')),
    // delete: new vscode.ThemeIcon('trash', new vscode.ThemeColor('errorForeground')),
};

const methodColors: Record<string, vscode.ThemeColor> = {
    get: new vscode.ThemeColor('charts.blue'),
    post: new vscode.ThemeColor('charts.green'),
    put: new vscode.ThemeColor('charts.orange'),
    delete: new vscode.ThemeColor('errorForeground'),
};
