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

        console.log('updating last selected: ', spec.path);
        await context.globalState.update('callsign.lastSelectedSpecUrl', spec.path);
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
            routes.map(
                r =>
                    new RouteTreeItem(
                        `${r.method.toUpperCase()} ${r.path}`,
                        vscode.TreeItemCollapsibleState.None,
                        r.method,
                        r.details.summary,
                    ),
            ),
        );
    }

    public getAllRoutes(): OpenApiRoute[] {
        return this._routes;
    }
}
