import * as vscode from 'vscode';
import { OpenApiRoute, OpenApiSpec } from '../types';
import { RouteTreeItem } from './RouteTreeItem';
import { groupRoutesByTag } from '../utils/fetchJson';

export class RouteTreeProvider implements vscode.TreeDataProvider<RouteTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RouteTreeItem | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<RouteTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private groupedRoutes: Record<string, OpenApiRoute[]> = {};
    private currentSpec: OpenApiSpec | null = null;
    private _routes: OpenApiRoute[] = [];

    constructor(spec?: OpenApiSpec) {
        if (spec) {
            this.groupedRoutes = groupRoutesByTag(spec);
            this.currentSpec = spec;
            this._routes = Object.values(this.groupedRoutes).flat();
        }
    }

    getCurrentSpec(): OpenApiSpec | null {
        return this.currentSpec;
    }

    async setRoutes(spec: OpenApiSpec, context: vscode.ExtensionContext): Promise<void> {
        this.groupedRoutes = groupRoutesByTag(spec);
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: RouteTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: RouteTreeItem): Thenable<RouteTreeItem[]> {
        if (!element) {
            // top-level: tag group labels
            return Promise.resolve(
                Object.keys(this.groupedRoutes).map(
                    tag => new RouteTreeItem(tag, vscode.TreeItemCollapsibleState.Collapsed),
                ),
            );
        }

        // child level: routes within that tag
        const routes = this.groupedRoutes[element.label] || [];
        return Promise.resolve(
            routes.map((r: OpenApiRoute) => {
                const item = new RouteTreeItem(
                    `${r.method.toUpperCase()} ${r.path}`,
                    vscode.TreeItemCollapsibleState.None,
                    r.method,
                    r.details.summary,
                );

                // Attach the command to this TreeItem
                item.command = {
                    command: 'callsign.openRoute',
                    title: 'Open Route',
                    arguments: [r], // Pass the route to the command
                };

                return item;
            }),
        );
    }

    public getAllRoutes(): OpenApiRoute[] {
        return this._routes;
    }
}

// function extractRemainingPath(path: string, group: string): string {
//     const parts = path.split('/').filter(Boolean); // ["api", "billing", "invoices", "edit"]

//     const groupIndex = parts.findIndex(p => p.toLowerCase() === group.toLowerCase());

//     if (groupIndex === -1 || groupIndex === parts.length - 1) {
//         return '/'; // No remainder or nothing after group
//     }

//     const remaining = parts.slice(groupIndex + 1).join('/');
//     return `/${remaining}`;
// }
