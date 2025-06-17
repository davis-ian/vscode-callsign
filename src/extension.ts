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
import { initRequestHistoryService, loadHistory } from './services/HistoryService';
import { RequestHistoryProvider } from './tree/RequestHistoryProvider';
import { initializeCallsignStorage, simFreshInstall } from './state/init';
import { getCachedSpec, getLastSelectedSpecUrl, setSelectedRoute } from './state/workspace';

let currentSpec: OpenApiSpec | undefined;
let routeTreeProvider: RouteTreeProvider;
export let historyTreeProvider: RequestHistoryProvider;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // await simFreshInstall(context);

    initLogger();
    initializeCallsignStorage(context);
    logInfo('Callsign extension activated');

    initStatusBar(context);
    updateStatusBar('no-spec');

    initRequestHistoryService(context);
    historyTreeProvider = new RequestHistoryProvider(context);
    vscode.window.registerTreeDataProvider('callsign.history', historyTreeProvider);

    let rawSpec: OpenApiSpec | undefined = await loadDefaultJson(context);

    routeTreeProvider = new RouteTreeProvider(rawSpec, context);

    vscode.window.registerTreeDataProvider('callsign.routes', routeTreeProvider);

    registerCommands(context, routeTreeProvider, historyTreeProvider);
}

// This method is called when your extension is deactivated
export async function deactivate(context: vscode.ExtensionContext) {
    setSelectedRoute(context, undefined);
    routeTreeProvider?.refresh();
    historyTreeProvider?.refresh();
}

async function loadDefaultJson(context: vscode.ExtensionContext): Promise<OpenApiSpec | undefined> {
    // const defaultSpecDataUrl = 'https://petstore3.swagger.io/api/v3/openapi.json';
    const lastSelectedSpecUrl = getLastSelectedSpecUrl(context);
    const cachedSpec = getCachedSpec<OpenApiSpec>(context);

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
