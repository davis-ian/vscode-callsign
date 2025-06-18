import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { OpenApiRoute, OpenApiSpec } from '../types';
import { RouteTreeProvider } from '../tree/RouteTreeProvider';

import { loadJsonFromUrl } from '../utils/fetchJson';
import { handleMessage } from '../handlers/handleMessage';
import { getWebviewContent } from '../utils/getWebviewContent';

import { generateCode } from './codeGenCommand';
import { updateStatusBar } from '../core/statusBar';
import { RouteTreeItem } from '../tree/RouteTreeItem';
import { logInfo, showLogs } from '../core/logger';
import { buildCurl, getApiBaseUrlFromSpec } from '../utils/curlBuilder';
import { AuthService } from '../services/AuthService';

import { RequestHistoryProvider } from '../tree/RequestHistoryProvider';
import {
    getCachedSpec,
    getLastOutputDir,
    getLastSelectedSpecUrl,
    getPinnedRoutes,
    isPinned,
    setCachedSpec,
    setLastOutputDir,
    setLastSelectedSpecUrl,
    setSelectedRoute,
    togglePin,
} from '../state/workspace';
import { getSpecUrls, setSpecUrls } from '../state/global';

let panel: vscode.WebviewPanel | undefined;

export function registerCommands(
    context: vscode.ExtensionContext,
    routeTreeProvider: RouteTreeProvider,
    historyTreeProvider: RequestHistoryProvider,
) {
    const authService = new AuthService(context);

    context.subscriptions.push(
        vscode.commands.registerCommand('callsign.refreshRoutes', () => {
            const rawSpec = routeTreeProvider.getCurrentSpec();
            if (rawSpec) routeTreeProvider.setRoutes(rawSpec, context);
        }),

        vscode.commands.registerCommand('callsign.openHistoryPage', () => {
            vscode.commands.executeCommand('callsign.openWebviewPanel', '/history');
        }),

        vscode.commands.registerCommand('callsign.openRoute', async (route: OpenApiRoute) => {
            await setSelectedRoute(context, route);
            routeTreeProvider.refresh();

            panel?.webview.postMessage({
                command: 'syncState',
                selectedRoute: route,
            });

            vscode.commands.executeCommand('callsign.openWebviewPanel', '/route');
        }),

        vscode.commands.registerCommand('callsign.openWebviewPanel', async (initialRoute?: string) => {
            if (panel) {
                panel.reveal(vscode.ViewColumn.One); // bring existing panel to front

                if (initialRoute) {
                    panel.webview.postMessage({
                        command: 'navigateTo',
                        path: initialRoute,
                    });
                }

                return;
            }

            panel = vscode.window.createWebviewPanel('callsignDocs', 'Callsign', vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });

            panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, context);

            panel.webview.onDidReceiveMessage(
                message => handleMessage(message, panel!, context, initialRoute),
                undefined,
                context.subscriptions,
            );

            panel.onDidDispose(() => {
                panel = undefined;
                setSelectedRoute(context, undefined);
                routeTreeProvider.refresh();
            });
        }),

        vscode.commands.registerCommand('callsign.showLogs', () => {
            showLogs();
        }),

        vscode.commands.registerCommand('callsign.refreshHistoryTree', () => {
            historyTreeProvider.refresh();
        }),

        vscode.commands.registerCommand('callsign.quickSearchRoutes', async () => {
            const allRoutes = routeTreeProvider.getAllRoutes();
            const items: vscode.QuickPickItem[] = [
                { label: '$(arrow-left) Back', description: '', alwaysShow: true },
                ...allRoutes.map(route => ({
                    label: `${route.method.toUpperCase()} ${route.path}`,
                    description: route.details?.summary || '',
                    route,
                })),
            ];

            const picked = await vscode.window.showQuickPick(items, {
                placeHolder: 'Search API route...',
                matchOnDescription: true,
                matchOnDetail: true,
            });

            if (!picked) return;

            if (picked.label === '$(arrow-left) Back') {
                vscode.commands.executeCommand('callsign.showCommands');
                return;
            }

            if ('route' in picked) {
                vscode.commands.executeCommand('callsign.openRoute', picked.route);
            }
        }),

        vscode.commands.registerCommand('callsign.generateCode', async () => {
            const lastOutputKey = 'callsign.lastOutputDir';
            try {
                updateStatusBar('generating');
                const savedSpecs = getSpecUrls(context);

                if (!savedSpecs || savedSpecs.length === 0) {
                    vscode.window.showWarningMessage('No saved spec URLs found.');
                    return;
                }

                const jsonUrlPick = await vscode.window.showQuickPick(
                    [
                        { label: '$(arrow-left) Back', description: '', alwaysShow: true },
                        ...savedSpecs.map(url => ({ label: url })),
                    ],
                    {
                        placeHolder: 'Select a saved OpenAPI spec URL',
                    },
                );

                if (!jsonUrlPick) return;

                if (jsonUrlPick.label === '$(arrow-left) Back') {
                    vscode.commands.executeCommand('callsign.showCommands');
                    return;
                }

                const jsonUrl = jsonUrlPick.label;
                if (!jsonUrl) return;

                // Step 1: Show recent or common folders
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                const commonOptions = ['src', 'src/generated-api', 'generated', 'api'].map(p =>
                    path.join(workspaceFolder!, p),
                );
                const lastUsed = getLastOutputDir(context);

                const folderOptions = [
                    { label: '$(arrow-left) Back', description: '', alwaysShow: true },
                    ...(lastUsed ? [{ label: lastUsed }] : []),
                    ...commonOptions.map(folder => ({ label: folder })),
                    { label: 'Other (Enter custom path...)' },
                ];

                const pickedFolder = await vscode.window.showQuickPick(folderOptions, {
                    placeHolder: 'Select or enter an output folder',
                });

                if (!pickedFolder) return;

                if (pickedFolder.label === '$(arrow-left) Back') {
                    vscode.commands.executeCommand('callsign.generateCode');
                    return;
                }

                let outputPath: string | undefined;

                if (pickedFolder.label === 'Other (Enter custom path...)') {
                    outputPath = await vscode.window.showInputBox({
                        prompt: 'Enter output folder path',
                        value: path.join(workspaceFolder!, 'src', 'generated-api'),
                        ignoreFocusOut: true,
                        validateInput: input => (input.trim() === '' ? 'Path cannot be empty' : undefined),
                    });

                    if (!outputPath) return;
                } else {
                    outputPath = pickedFolder.label;
                }

                // Ensure folder exists
                if (!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath, { recursive: true });
                }

                await setLastOutputDir(context, outputPath);

                const outputUri = await vscode.window.showOpenDialog({
                    canSelectFolders: true,
                    openLabel: 'Select output folder',
                });
                if (!outputUri || !outputUri[0]) return;

                const clientType = (await vscode.window.showQuickPick(['fetch', 'axios', 'node', 'xhr'], {
                    placeHolder: 'Select client type',
                })) as 'fetch' | 'axios' | 'node' | 'xhr';
                if (!clientType) return;

                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'Generating client code...',
                        cancellable: false,
                    },
                    async () => {
                        const response = await generateCode({
                            generator: 'openapi-typescript-codegen',
                            language: 'ts',
                            input: jsonUrl,
                            output: outputUri[0].fsPath,
                            client: clientType,
                        });

                        if (response.success) {
                            const cachedSpec = getCachedSpec<OpenApiSpec>(context);
                            if (cachedSpec) {
                                updateStatusBar('idle', cachedSpec.paths.length, 0);
                            }

                            vscode.window.showInformationMessage('Code generation completed successfully!');
                        } else {
                            vscode.window.showErrorMessage(`Generation failed: ${response.error}`);
                            updateStatusBar('error');
                        }
                    },
                );
            } catch (err: any) {
                vscode.window.showErrorMessage(`Unexpected error: ${err.message || err}`);
                updateStatusBar('error');
            }
        }),

        vscode.commands.registerCommand('callsign.addSpecUrl', async () => {
            const url = await vscode.window.showInputBox({
                prompt: 'Enter the OpenAPI Spec URL',
                placeHolder: 'https://example.com/openapi.json',
            });

            if (url) {
                const configuredUrls = getSpecUrls(context);
                if (!configuredUrls.includes(url)) {
                    configuredUrls.push(url);

                    await setSpecUrls(context, configuredUrls);
                    vscode.window.showInformationMessage(`Added ${url} to Callsign spec URLs`);
                } else {
                    vscode.window.showWarningMessage('That URL is already added');
                }

                vscode.commands.executeCommand('callsign.loadRoutesFromSavedSpec', url);
            }
        }),

        vscode.commands.registerCommand('callsign.deleteSpecUrlFromSettings', async () => {
            const configuredUrls = getSpecUrls(context);
            logInfo(configuredUrls, 'fonigured urls');

            if (configuredUrls.length === 0) {
                vscode.window.showInformationMessage('No configured spec URLs found.');
                return;
            }

            const picked = await vscode.window.showQuickPick(
                configuredUrls.map(spec => ({
                    label: spec,
                    // description: spec.url,
                    spec,
                })),
                { placeHolder: 'Select a spec URL to delete' },
            );

            if (!picked) return;

            const updated = configuredUrls.filter(u => u !== picked.spec);

            await setSpecUrls(context, updated);

            const lastSelectedSpecUrl = getLastSelectedSpecUrl(context);

            if (lastSelectedSpecUrl === picked.label) {
                routeTreeProvider.clearRoutes();
            }

            vscode.window.showInformationMessage(`Deleted ${picked.spec} from Callsign spec URLs.`);
        }),

        vscode.commands.registerCommand('callsign.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:ian-davis.callsign');
        }),

        // Non command pallet commands
        vscode.commands.registerCommand('callsign.pinRoute', async (item: RouteTreeItem) => {
            const route = item?.route || (await pickRouteQuickly(routeTreeProvider, 'Select a route to pin'));
            if (!route) return;

            await togglePin(route, context, routeTreeProvider);
        }),

        vscode.commands.registerCommand('callsign.unpinRoute', async (item: RouteTreeItem) => {
            const route =
                item?.route ||
                (await pickRouteQuickly(routeTreeProvider, 'Select a pinned route to unpin', context, r =>
                    isPinned(r, context),
                ));

            if (!route) return;

            await togglePin(route, context, routeTreeProvider);
        }),

        vscode.commands.registerCommand('callsign.listStoredAuth', async () => {
            showAuthQuickPick(authService, context);
        }),

        vscode.commands.registerCommand('callsign.clearStoredAuth', async () => {
            await authService.clearAllCredentials();
        }),

        vscode.commands.registerCommand('callsign.copyAsCurl', async (item: RouteTreeItem) => {
            const route = item?.route || (await pickRouteQuickly(routeTreeProvider, 'Select a route to pin'));
            logInfo('route selected for curl');
            logInfo(route);
            if (!route) return;

            const rawSpec = getCachedSpec<OpenApiSpec>(context);

            const specUrl = rawSpec?.path;

            logInfo('rawSpec ', rawSpec);
            logInfo(rawSpec?.servers);
            const serverUrl = rawSpec?.servers?.[0]?.url ?? '/';
            if (!specUrl || !serverUrl) {
                throw new Error('Invalid  spec or server url');
            }
            // const resolvedBaseUrl = resolveServerUrl(specUrl, serverUrl);
            const resolvedBaseUrl = getApiBaseUrlFromSpec(rawSpec, specUrl);
            logInfo(resolvedBaseUrl, 'baseUrl');

            const curl = buildCurl(route, {}, resolvedBaseUrl);
            logInfo(curl);
            logInfo('built curl command');
            await vscode.env.clipboard.writeText(curl);
            vscode.window.showInformationMessage('cURL copied to clipboard');
        }),

        vscode.commands.registerCommand(
            'callsign.loadRoutesFromSavedSpec',
            async (url: string | undefined = undefined) => {
                let selected = url;

                if (!selected) {
                    const savedSpecs = getSpecUrls(context);

                    if (!savedSpecs || savedSpecs.length === 0) {
                        vscode.window.showWarningMessage('No saved spec URLs found.');
                        return;
                    }

                    selected = await vscode.window.showQuickPick(savedSpecs, {
                        placeHolder: 'Select a saved spec to load routes from',
                    });
                }

                if (!selected) {
                    vscode.window.showWarningMessage('spec url not found');
                    return;
                }

                await loadSpecFromUrl(selected, routeTreeProvider, context);

                try {
                    vscode.window.showInformationMessage(`Loaded routes from ${selected}`);
                } catch (err) {
                    vscode.window.showErrorMessage(`Failed to load spec: ${(err as Error).message}`);
                }
            },
        ),

        vscode.commands.registerCommand('callsign.showRoutesView', () => {
            vscode.commands.executeCommand('workbench.views.explorer.callsign.routes');
        }),

        vscode.commands.registerCommand('callsign.showCommands', async () => {
            const pinnedRoutes = getPinnedRoutes(context);
            const allRoutes = routeTreeProvider.getAllRoutes();
            const specUrls = getSpecUrls(context);

            logInfo('alll routes', allRoutes.length);
            logInfo('pinned routes', pinnedRoutes.length);

            const items: CallsignCommandItem[] = [];

            if (allRoutes.length) {
                items.push(
                    {
                        label: '$(search)  Search Routes',
                        description: 'Search routes in your OpenAPI spec',
                        command: 'callsign.quickSearchRoutes',
                    },
                    {
                        label: '$(copy)  Copy as cURL',
                        description: 'Copy cURL command for route to clipboard',
                        command: 'callsign.copyAsCurl',
                    },
                    {
                        label: '$(rocket)  Generate API Client Code',
                        description: 'Run code generation for current spec',
                        command: 'callsign.generateCode',
                    },
                );
            }

            items.push({
                label: '$(add)  Add New Spec URL',
                description: 'Save a new OpenAPI spec URL',
                command: 'callsign.addSpecUrl',
            });

            if (specUrls.length) {
                items.push(
                    {
                        label: '$(file-code)  Set Active OpenAPI Spec',
                        description: 'Load or refresh your OpenAPI spec',
                        command: 'callsign.loadRoutesFromSavedSpec',
                    },
                    {
                        label: '$(trash)  Remove Spec URL',
                        description: 'Remove a saved OpenAPI spec URL',
                        command: 'callsign.deleteSpecUrlFromSettings',
                    },
                );
            }

            if (allRoutes.length) {
                items.push({
                    label: '$(file-code)  Pin Route',
                    description: 'Save a pinned routed',
                    command: 'callsign.pinRoute',
                });
            }

            if (pinnedRoutes.length) {
                items.push({
                    label: '$(file-code)  Un-Pin Route',
                    description: 'Remove a pinned routed',
                    command: 'callsign.unpinRoute',
                });
            }

            items.push(
                {
                    label: '$(clock)  View Request History',
                    description: 'View previous requests you’ve made',
                    command: 'callsign.openHistoryPage',
                },
                {
                    label: '$(key)  Manage Auth',
                    description: 'Manages stored  auth headers',
                    command: 'callsign.listStoredAuth',
                },
                {
                    label: '$(gear)  Settings',
                    description: 'Open Callsign extension settings',
                    command: 'callsign.openSettings',
                },
                {
                    label: '$(output)  Show Logs',
                    description: 'Open Callsign output channel logs',
                    command: 'callsign.showLogs',
                },
            );

            const selection = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a Callsign command',
            });

            if (selection?.command) {
                vscode.commands.executeCommand(selection.command);
            }
        }),
    );
}

interface RouteQuickPickItem extends vscode.QuickPickItem {
    route?: OpenApiRoute;
}

export async function pickRouteQuickly(
    provider: RouteTreeProvider,
    placeholder = 'Select a route...',
    context?: vscode.ExtensionContext,
    filterFn?: (route: OpenApiRoute) => boolean,
): Promise<OpenApiRoute | undefined> {
    let allRoutes = provider.getAllRoutes();
    if (filterFn) {
        allRoutes = allRoutes.filter(filterFn);
    }

    const items: RouteQuickPickItem[] = [
        { label: '$(arrow-left) Back', description: '', alwaysShow: true },
        ...allRoutes.map(route => ({
            label: `${route.method.toUpperCase()} ${route.path}`,
            description: route.details?.summary || '',
            route,
        })),
    ];

    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: placeholder,
        matchOnDescription: true,
        matchOnDetail: true,
    });

    if (!picked) return;

    if (picked.label === '$(arrow-left) Back') {
        vscode.commands.executeCommand('callsign.showCommands');
        return;
    }

    return picked.route;
}

async function showAuthQuickPick(authService: AuthService, context: vscode.ExtensionContext) {
    const creds = await authService.getAllCredentials();

    const items: vscode.QuickPickItem[] = creds.map(cred => ({
        label: cred.key,
        description: cred.id,
        detail: `Last used: ${cred.lastUsed?.toLocaleString() ?? 'Never'}`,
        alwaysShow: true,
    }));

    items.push(
        { label: '$(arrow-left)  Back', description: '', alwaysShow: true },
        { label: '$(add)  Add New Auth Header', description: '', alwaysShow: true },
        { label: '$(edit)  Edit Existing', description: 'Select a header to edit', alwaysShow: true },
        { label: '$(trash)  Delete Existing', description: 'Select a header to remove', alwaysShow: true },
        { label: '$(flame)  Delete All', description: 'Remove all headers', alwaysShow: true },
    );

    const selection = await vscode.window.showQuickPick(items, {
        title: 'Manage Auth Headers',
        placeHolder: 'Select an auth header or an action...',
    });

    if (!selection) return;

    // Handle action choices
    switch (selection.label) {
        case '$(arrow-left)  Back': {
            vscode.commands.executeCommand('callsign.showCommands');
            break;
        }

        case '$(add)  Add New Auth Header': {
            const key = await vscode.window.showInputBox({ prompt: 'Enter header key', value: 'Authorization' });
            const value = await vscode.window.showInputBox({ prompt: 'Enter header value', password: false });

            if (key && value) {
                await authService.storeCredential({ name: key, key }, value);

                vscode.window.showInformationMessage(`Saved ${key}`);
            }
            break;
        }

        case '$(edit)  Edit Existing': {
            const editTarget = await vscode.window.showQuickPick(
                creds.map(c => ({
                    label: c.key,
                    description: c.name,
                })),
                { title: 'Select a credential to edit' },
            );

            if (!editTarget) return;

            const existing = creds.find(c => c.key === editTarget.label);
            const newValue = await vscode.window.showInputBox({
                prompt: `Update value for ${editTarget.label}`,
                value: existing ? await authService.getCredential(existing.id).then(s => s?.value ?? '') : '',
            });

            if (existing && newValue) {
                await authService.storeCredential({ ...existing }, newValue);
                vscode.window.showInformationMessage(`Updated ${editTarget.label}`);
            }
            break;
        }

        case '$(trash)  Delete Existing': {
            const delTarget = await vscode.window.showQuickPick(
                creds.map(c => ({
                    label: c.key,
                    description: c.name,
                })),
                { title: 'Select a credential to delete' },
            );

            if (!delTarget) return;

            const match = creds.find(c => c.key === delTarget.label);
            if (match) {
                await authService.deleteCredential(match.id);
                vscode.window.showWarningMessage(`Deleted ${match.key}`);
            }
            break;
        }

        case '$(flame)  Delete All': {
            await authService.clearAllCredentials();
            break;
        }

        default: {
            const match = creds.find(c => c.key === selection.label);
            if (match) {
                const success = await authService.setActiveCredential(match.id);
                if (success && panel) {
                    panel?.webview.postMessage({
                        command: 'syncState',
                        selectedAuthId: match.id,
                    });
                }
            }
        }
    }
}

async function loadSpecFromUrl(url: string, provider: RouteTreeProvider, context: vscode.ExtensionContext) {
    const rawSpec: OpenApiSpec = await loadJsonFromUrl(url);
    provider.setRoutes(rawSpec, context);

    await setLastSelectedSpecUrl(context, rawSpec.path);
    await setCachedSpec(context, rawSpec);

    panel?.webview.postMessage({
        command: 'syncState',
        spec: rawSpec,
    });
}

interface CallsignCommandItem extends vscode.QuickPickItem {
    command: string;
}
