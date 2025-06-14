import * as vscode from 'vscode';
import type { OpenApiRoute } from '../types';

const STORAGE_KEY = 'callsign.pinnedRoutes';

export function getPinnedRoutes(context: vscode.ExtensionContext): { method: string; path: string }[] {
    return context.workspaceState.get(STORAGE_KEY, []);
}

export function isPinned(route: OpenApiRoute, context: vscode.ExtensionContext): boolean {
    const pins = getPinnedRoutes(context);
    return pins.some(p => p.method === route.method && p.path === route.path);
}

export async function togglePin(route: OpenApiRoute, context: vscode.ExtensionContext): Promise<void> {
    const pins = getPinnedRoutes(context);
    const exists = pins.find(p => p.method === route.method && p.path === route.path);

    let updated: typeof pins;
    if (exists) {
        updated = pins.filter(p => !(p.method === route.method && p.path === route.path));
    } else {
        updated = [...pins, { method: route.method, path: route.path }];
    }

    await context.workspaceState.update(STORAGE_KEY, updated);
}
