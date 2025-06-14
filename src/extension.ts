// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { OpenApiSpec } from './types';
import { RouteTreeProvider } from './tree/RouteTreeProvider';
import { registerCommands } from './commands/registerCommands';
import { loadJsonFromUrl } from './utils/fetchJson';

import { initStatusBar, updateStatusBar } from './core/statusBar';
import { initLogger, logInfo } from './core/logger';

let currentSpec: OpenApiSpec | undefined;
let routeTreeProvider: RouteTreeProvider;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated

    initLogger();
    logInfo('Callsign extension activated');

    initStatusBar(context);
    updateStatusBar('no-spec');
    let rawSpec: OpenApiSpec | undefined = await loadDefaultJson(context);

    // if (rawSpec) {
    //     dumpSpecToDisk(rawSpec, context);
    //     updateStatusBar('idle', rawSpec.paths.length, 0);
    // }

    routeTreeProvider = new RouteTreeProvider(rawSpec, context);

    vscode.window.registerTreeDataProvider('callsign.routes', routeTreeProvider);

    registerCommands(context, routeTreeProvider);
}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
    context.workspaceState.update('callsign.selectedRoute', undefined);
    routeTreeProvider.refresh();
}

async function loadDefaultJson(context: vscode.ExtensionContext): Promise<OpenApiSpec | undefined> {
    // const defaultSpecDataUrl = 'https://petstore3.swagger.io/api/v3/openapi.json';
    const lastSelectedSpecUrl = context.workspaceState.get<string>('callsign.lastSelectedSpecUrl');
    const cachedSpec = context.workspaceState.get<OpenApiSpec | null>('callsign.cachedSpec', null);

    if (cachedSpec) {
        logInfo('returning cached spec for: ', lastSelectedSpecUrl);
        return cachedSpec;
    }

    if (lastSelectedSpecUrl) {
        try {
            return await loadJsonFromUrl(lastSelectedSpecUrl);
        } catch (err) {
            vscode.window.showWarningMessage(`Failed to load last used spec: ${(err as Error).message}`);
        }
    }
}
