import * as vscode from 'vscode';
import { OpenApiRoute, OpenApiSpec } from '../types';
import { RouteTreeItem } from './RouteTreeItem';
import { groupRoutesByTag } from '../utils/fetchJson';
import { updateStatusBar } from '../core/statusBar';
import { getPinnedRoutes } from '../state/workspace';

export class RouteTreeProvider implements vscode.TreeDataProvider<RouteTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<RouteTreeItem | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<RouteTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private groupedRoutes: Record<string, OpenApiRoute[]> = {};
    private currentSpec: OpenApiSpec | null = null;
    private _routes: OpenApiRoute[] = [];
    private _pinnedRoutes: OpenApiRoute[] = [];
    private _extensionContext: vscode.ExtensionContext | undefined;

    constructor(spec?: OpenApiSpec, context?: vscode.ExtensionContext) {
        this._extensionContext = context;

        if (spec) {
            this.groupedRoutes = groupRoutesByTag(spec);
            this.currentSpec = spec;
            this._routes = Object.values(this.groupedRoutes).flat();
            if (context) {
                this._pinnedRoutes = getPinnedRoutes<OpenApiRoute>(context);
            }

            if (!this._routes.length) {
                updateStatusBar('no-spec');
            } else {
                updateStatusBar('idle', this._routes.length, 0);
            }
        }
    }

    getCurrentSpec(): OpenApiSpec | null {
        return this.currentSpec;
    }

    async setRoutes(spec: OpenApiSpec, context: vscode.ExtensionContext): Promise<void> {
        this.groupedRoutes = groupRoutesByTag(spec);
        this._onDidChangeTreeData.fire(undefined);
        this._routes = Object.values(this.groupedRoutes).flat();
        if (this._extensionContext) {
            this._pinnedRoutes = getPinnedRoutes<OpenApiRoute>(this._extensionContext);
        }

        if (!this._routes.length) {
            updateStatusBar('no-spec');
        } else {
            updateStatusBar('idle', this._routes.length, 0);
        }
    }

    refresh(): void {
        if (this._extensionContext) {
            this._pinnedRoutes = getPinnedRoutes<OpenApiRoute>(this._extensionContext);
        }
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: RouteTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: RouteTreeItem): Thenable<RouteTreeItem[]> {
        if (!element) {
            const topLevelGroups: RouteTreeItem[] = [];

            if (this._extensionContext) {
                // Add pinned/favorites group if any exist
                const pinned = getPinnedRoutes(this._extensionContext);
                if (pinned.length > 0) {
                    topLevelGroups.push(new RouteTreeItem('Pinned', vscode.TreeItemCollapsibleState.Expanded));
                }
            }

            // Add tag groups
            const tags = Object.keys(this.groupedRoutes);
            for (const tag of tags) {
                topLevelGroups.push(new RouteTreeItem(tag, vscode.TreeItemCollapsibleState.Collapsed));
            }

            return Promise.resolve(topLevelGroups);
        }

        // If expanding Favorites
        if (element.label === 'Pinned') {
            if (this._extensionContext) {
                return Promise.resolve(
                    this._pinnedRoutes.map(route => {
                        const item = new RouteTreeItem(
                            `${route.method.toUpperCase()} ${route.path}`,
                            vscode.TreeItemCollapsibleState.None,
                            route,
                            this._extensionContext,
                            false,
                        );

                        item.command = {
                            command: 'callsign.openRoute',
                            title: 'Open Route',
                            arguments: [route],
                        };

                        return item;
                    }),
                );
            }
        }

        // Regular group
        const routes = this.groupedRoutes[element.label] || [];

        return Promise.resolve(
            routes.map((r: OpenApiRoute) => {
                const item = new RouteTreeItem(
                    `${r.method.toUpperCase()} ${extractRemainingPath(r.path, element.label)}`,
                    vscode.TreeItemCollapsibleState.None,
                    r,
                    this._extensionContext,
                    false,
                );

                item.command = {
                    command: 'callsign.openRoute',
                    title: 'Open Route',
                    arguments: [r],
                };

                return item;
            }),
        );
    }

    public getAllRoutes(): OpenApiRoute[] {
        return this._routes;
    }
}

function extractRemainingPath(path: string, group: string): string {
    const parts = path.split('/').filter(Boolean); // ["api", "billing", "invoices", "edit"]

    const normalize = (str: string) => str.toLowerCase().replace(/[\s_-]/g, '');

    const groupIndex = parts.findIndex(p => normalize(p) === normalize(group));

    if (groupIndex === -1 || groupIndex === parts.length - 1) {
        return '../'; // No remainder or nothing after group
    }

    const remaining = parts.slice(groupIndex + 1).join('/');
    return `../${remaining}`;
}

const isSameRoute = (r1: OpenApiRoute, r2?: OpenApiRoute) => r1.path === r2?.path && r1.method === r2?.method;
