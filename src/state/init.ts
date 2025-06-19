import * as vscode from 'vscode';
import { KEYS } from './keys';

export async function initializeCallsignStorage(ctx: vscode.ExtensionContext) {
    const onboarded = ctx.globalState.get<boolean>('callsign.onboarded');

    if (onboarded) {
        return; // Already initialized
    }

    // Set default workspace state (only if not present)
    await Promise.all([
        ctx.workspaceState.update('callsign.selectedRoute', undefined),
        ctx.workspaceState.update('callsign.lastOutputDir', undefined),
        ctx.workspaceState.update('callsign.cachedSpec', undefined),
        ctx.workspaceState.update('callsign.pinnedRoutes', []),
        ctx.workspaceState.update('callsign.lastSelectedSpecUrl', undefined),
        ctx.workspaceState.update('callsign.selectedAuthId', undefined),
        ctx.workspaceState.update('callsign.historyLimit', 20),
    ]);

    // Set default global state (only if not present)
    await Promise.all([
        ctx.globalState.update('callsign.specUrls', []),
        ctx.globalState.update('callsign.requestHistory', []),
        ctx.globalState.update('callsign.onboarded', true),
    ]);
}

// --- Clear / Reset Configs ---
export function resetCallsignStorage(ctx: vscode.ExtensionContext) {
    ctx.workspaceState.update(KEYS.selectedRoute, undefined);
    ctx.workspaceState.update(KEYS.lastOutputDir, undefined);
    ctx.workspaceState.update(KEYS.cachedSpec, undefined);
    ctx.workspaceState.update(KEYS.pinnedRoutes, undefined);
    ctx.workspaceState.update(KEYS.lastSelectedSpecUrl, undefined);
    ctx.workspaceState.update(KEYS.selectedAuthId, undefined);
    ctx.workspaceState.update(KEYS.historyLimit, 20);

    ctx.globalState.update(KEYS.specUrls, []);
    ctx.globalState.update(KEYS.requestHistory, []);
}

export async function simFreshInstall(ctx: vscode.ExtensionContext) {
    await ctx.workspaceState.keys().forEach(key => ctx.workspaceState.update(key, undefined));
    await ctx.globalState.keys().forEach(key => ctx.globalState.update(key, undefined));
}
