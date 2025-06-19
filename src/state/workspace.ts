import * as vscode from 'vscode';
import { KEYS } from './keys';
import { OpenApiRoute, OpenApiSpec } from '../types';
import { RouteTreeProvider } from '../tree/RouteTreeProvider';
import { logInfo } from '../core/logger';

// --- WorkspaceState Helpers ---
export function getLastOutputDir(ctx: vscode.ExtensionContext): string | undefined {
    return ctx.workspaceState.get<string>(KEYS.lastOutputDir);
}

export function setLastOutputDir(ctx: vscode.ExtensionContext, dir: string) {
    return ctx.workspaceState.update(KEYS.lastOutputDir, dir);
}

export function getCachedSpec<OpenApiSpec>(ctx: vscode.ExtensionContext): OpenApiSpec | undefined {
    return ctx.workspaceState.get<OpenApiSpec>(KEYS.cachedSpec);
}

export function setCachedSpec(ctx: vscode.ExtensionContext, spec: OpenApiSpec | undefined) {
    return ctx.workspaceState.update(KEYS.cachedSpec, spec);
}

export function getLastSelectedSpecUrl(ctx: vscode.ExtensionContext): string | undefined {
    return ctx.workspaceState.get<string>(KEYS.lastSelectedSpecUrl);
}

export function setLastSelectedSpecUrl(ctx: vscode.ExtensionContext, url: string) {
    return ctx.workspaceState.update(KEYS.lastSelectedSpecUrl, url);
}

export function getSelectedAuthId(ctx: vscode.ExtensionContext): string | undefined {
    return ctx.workspaceState.get<string>(KEYS.selectedAuthId);
}

export function setSelectedAuthId(ctx: vscode.ExtensionContext, id: string) {
    return ctx.workspaceState.update(KEYS.selectedAuthId, id);
}

export function getSelectedRoute<OpenApiRoute>(ctx: vscode.ExtensionContext): OpenApiRoute | undefined {
    return ctx.workspaceState.get<OpenApiRoute>(KEYS.selectedRoute);
}

export function setSelectedRoute(ctx: vscode.ExtensionContext, route: OpenApiRoute | undefined) {
    return ctx.workspaceState.update(KEYS.selectedRoute, route);
}

export function isPinned(route: OpenApiRoute, context: vscode.ExtensionContext): boolean {
    const pins = getPinnedRoutes<OpenApiRoute>(context);
    return pins.some(p => p.method === route.method && p.path === route.path);
}

export async function togglePin(
    route: OpenApiRoute,
    context: vscode.ExtensionContext,
    provider: RouteTreeProvider,
): Promise<void> {
    logInfo('toggling pins');
    const pins = getPinnedRoutes<OpenApiRoute>(context);
    const exists = pins.find(p => p.method === route.method && p.path === route.path);

    logInfo('pins: ', pins.length);
    let updated: typeof pins;
    if (exists) {
        logInfo('removing pin');
        updated = pins.filter(p => !(p.method === route.method && p.path === route.path));
    } else {
        updated = [...pins, route];
    }
    logInfo('updated: ', updated.length);

    await setPinnedRoutes(context, updated);
    logInfo('refreshing tree');
    provider.refresh();
}

export function getPinnedRoutes<OpenApiRoute>(ctx: vscode.ExtensionContext): OpenApiRoute[] {
    return ctx.workspaceState.get<OpenApiRoute[]>(KEYS.pinnedRoutes, []);
}

export function setPinnedRoutes<OpenApiRoute>(ctx: vscode.ExtensionContext, routes: OpenApiRoute[]) {
    return ctx.workspaceState.update(KEYS.pinnedRoutes, routes);
}
