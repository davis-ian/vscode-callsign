import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { OpenApiRoute, OpenApiSpec } from '../types';
import { RouteTreeProvider } from '../tree/RouteTreeProvider';

import { loadJsonFromUrl } from '../utils/fetchJson';
import { handleMessage } from '../handlers/handleMessage';
import { getWebviewContent } from '../utils/getWebviewContent';
import { getConfiguredSpecUrls } from '../utils/settings';
import { generateCode } from './codeGenCommand';
import { updateStatusBar } from '../core/statusBar';
import { togglePin } from '../core/pinnedRoutes';
import { RouteTreeItem } from '../tree/RouteTreeItem';
import { logInfo, showLogs } from '../core/logger';

let panel: vscode.WebviewPanel | undefined;

export function registerCommands(context: vscode.ExtensionContext, routeTreeProvider: RouteTreeProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand('callsign.refreshRoutes', () => {
            const rawSpec = routeTreeProvider.getCurrentSpec();
            if (rawSpec) routeTreeProvider.setRoutes(rawSpec, context);
        }),

        vscode.commands.registerCommand('callsign.openHistoryPage', () => {
            vscode.commands.executeCommand('callsign.openWebviewPanel', '/history');
        }),

        vscode.commands.registerCommand('callsign.openRoute', async (route: OpenApiRoute) => {
            console.log('open route command', route);
            await context.workspaceState.update('callsign.selectedRoute', route);
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
                message => handleMessage(message, panel!, context),
                undefined,
                context.subscriptions,
            );

            panel.onDidDispose(() => {
                panel = undefined;
                context.workspaceState.update('callsign.selectedRoute', undefined);
                routeTreeProvider.refresh();
            });

            // Delay navigateTo until Vue is mounted
            if (initialRoute) {
                const interval = setInterval(() => {
                    if (!panel) return clearInterval(interval);
                    panel.webview.postMessage({ command: 'navigateTo', path: initialRoute });
                    clearInterval(interval);
                }, 100); // can also use a ready message handshake if needed
            }
        }),

        vscode.commands.registerCommand('callsign.showLogs', () => {
            showLogs();
        }),

        vscode.commands.registerCommand('callsign.quickSearchRoutes', async () => {
            const allRoutes = routeTreeProvider.getAllRoutes(); // You'll expose this getter
            const items = allRoutes.map(route => ({
                label: `${route.method.toUpperCase()} ${route.path}`,
                description: route.details?.summary || '',
                route,
            }));

            const picked = await vscode.window.showQuickPick(items, {
                placeHolder: 'Search API route...',
                matchOnDescription: true,
                matchOnDetail: true,
            });

            if (picked) {
                vscode.commands.executeCommand('callsign.openRoute', picked.route);
            }
        }),

        vscode.commands.registerCommand('callsign.generateCode', async () => {
            const lastOutputKey = 'callsign.lastOutputDir';
            try {
                updateStatusBar('generating');
                const savedSpecs = vscode.workspace.getConfiguration('callsign').get<Array<string>>('specUrls');

                if (!savedSpecs || savedSpecs.length === 0) {
                    vscode.window.showWarningMessage('No saved spec URLs found.');
                    return;
                }

                const jsonUrl = await vscode.window.showQuickPick(savedSpecs, {
                    placeHolder: 'Select a saved OpenAPI spec URL',
                });
                if (!jsonUrl) return;

                // Step 1: Show recent or common folders
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                const commonOptions = ['src', 'src/generated-api', 'generated', 'api'].map(p =>
                    path.join(workspaceFolder!, p),
                );
                const lastUsed = context.workspaceState.get<string>(lastOutputKey);

                const folderOptions = [
                    ...(lastUsed ? [lastUsed] : []),
                    ...commonOptions,
                    'Other (Enter custom path...)',
                ];

                const picked = await vscode.window.showQuickPick(folderOptions, {
                    placeHolder: 'Select or enter an output folder',
                });

                let outputPath: string | undefined;

                if (!picked) return;

                if (picked === 'Other (Enter custom path...)') {
                    outputPath = await vscode.window.showInputBox({
                        prompt: 'Enter output folder path',
                        value: path.join(workspaceFolder!, 'src', 'generated-api'),
                        ignoreFocusOut: true,
                        validateInput: input => (input.trim() === '' ? 'Path cannot be empty' : undefined),
                    });

                    if (!outputPath) return;
                } else {
                    outputPath = picked;
                }

                // Ensure folder exists
                if (!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath, { recursive: true });
                }

                await context.workspaceState.update(lastOutputKey, outputPath);

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
                            const cachedSpec = context.workspaceState.get<OpenApiSpec | null>(
                                'callsign.cachedSpec',
                                null,
                            );
                            if (cachedSpec) {
                                updateStatusBar('idle', cachedSpec.paths.length, 0);
                            }

                            vscode.window.showInformationMessage('Code generation completed successfully!');
                        } else {
                            vscode.window.showErrorMessage(`Generation failed: ${response.error}`);
                            updateStatusBar('error');
                        }
                        // console.log('generator', generatorType);
                        logInfo('input', jsonUrl);
                        logInfo('output', outputUri[0].fsPath);
                        logInfo('client', clientType);
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
                const config = vscode.workspace.getConfiguration();
                const current = config.get<string[]>('callsign.specUrls') || [];
                if (!current.includes(url)) {
                    current.push(url);
                    await config.update('callsign.specUrls', current, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`Added ${url} to Callsign spec URLs`);
                } else {
                    vscode.window.showWarningMessage('That URL is already added');
                }
            }
        }),

        vscode.commands.registerCommand('callsign.deleteSpecUrlFromSettings', async () => {
            const configuredUrls = getConfiguredSpecUrls();

            if (configuredUrls.length === 0) {
                vscode.window.showInformationMessage('No configured spec URLs found.');
                return;
            }

            const picked = await vscode.window.showQuickPick(
                configuredUrls.map(spec => ({
                    label: spec.name,
                    description: spec.url,
                    spec,
                })),
                { placeHolder: 'Select a spec URL to delete' },
            );

            if (!picked) return;

            const updated = configuredUrls.filter(u => u.url !== picked.spec.url);

            await vscode.workspace
                .getConfiguration('callsign')
                .update('specUrls', updated, vscode.ConfigurationTarget.Global);

            vscode.window.showInformationMessage(`Deleted ${picked.spec.name} from Callsign spec URLs.`);
        }),

        vscode.commands.registerCommand('callsign.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:yourPublisher.callsign');
        }),

        // Non command pallet commands
        vscode.commands.registerCommand('callsign.pinRoute', async (item: RouteTreeItem) => {
            if (item.route) {
                await togglePin(item.route, context);
                routeTreeProvider.refresh(); // You'll add this
            }
        }),

        vscode.commands.registerCommand('callsign.unpinRoute', async (item: RouteTreeItem) => {
            if (item.route) {
                await togglePin(item.route, context);
                routeTreeProvider.refresh();
            }
        }),

        vscode.commands.registerCommand('callsign.loadRoutesFromSavedSpec', async () => {
            const savedSpecs = vscode.workspace.getConfiguration('callsign').get<Array<string>>('specUrls');

            if (!savedSpecs || savedSpecs.length === 0) {
                vscode.window.showWarningMessage('No saved spec URLs found.');
                return;
            }

            const selected = await vscode.window.showQuickPick(savedSpecs, {
                placeHolder: 'Select a saved spec to load routes from',
            });

            if (!selected) return;

            try {
                const rawSpec: OpenApiSpec = await loadJsonFromUrl(selected);
                routeTreeProvider.setRoutes(rawSpec, context);

                await context.workspaceState.update('callsign.lastSelectedSpecUrl', rawSpec.path);
                await context.workspaceState.update('callsign.cachedSpec', rawSpec);

                panel?.webview.postMessage({
                    command: 'syncState',
                    spec: rawSpec,
                });
                vscode.window.showInformationMessage(`Loaded routes from ${selected}`);
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to load spec: ${(err as Error).message}`);
            }
        }),

        vscode.commands.registerCommand('callsign.showRoutesView', () => {
            vscode.commands.executeCommand('workbench.views.explorer.callsign.routes');
        }),

        // vscode.commands.registerCommand('callsign.openPanel', () => {
        //     const panel = vscode.window.createWebviewPanel('callsignDocs', 'Callsign', vscode.ViewColumn.One, {
        //         enableScripts: true,
        //         retainContextWhenHidden: true,
        //     });

        //     panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, context);

        //     panel.webview.onDidReceiveMessage(
        //         message => handleMessage(message, panel, context),
        //         undefined,
        //         context.subscriptions,
        //     );
        // }),

        vscode.commands.registerCommand('callsign.showCommands', async () => {
            const selection = await vscode.window.showQuickPick(
                [
                    {
                        label: '$(file-code) Load OpenAPI Spec',
                        description: 'Load or refresh your OpenAPI spec',
                        command: 'callsign.loadRoutesFromSavedSpec',
                    },
                    {
                        label: '$(search) Search Routes',
                        description: 'Search routes in your OpenAPI spec',
                        command: 'callsign.quickSearchRoutes',
                    },
                    {
                        label: '$(rocket) Generate API Client Code',
                        description: 'Run code generation for current spec',
                        command: 'callsign.generateCode',
                    },
                    {
                        label: '$(clock) View Request History',
                        description: 'View previous requests you’ve made',
                        command: 'callsign.openHistoryPage',
                    },
                    {
                        label: '$(cloud-upload) Add Spec URL',
                        description: 'Save new OpenAPI spec URL',
                        command: 'callsign.addSpecUrl',
                    },
                    {
                        label: '$(trash) Remove Spec URL',
                        description: 'Delete saved OpenAPI spec URL',
                        command: 'callsign.deleteSpecUrlFromSettings',
                    },
                    {
                        label: '$(gear) Settings',
                        description: 'Open Callsign extension settings',
                        command: 'callsign.openSettings',
                    },
                    {
                        label: '$(output) Show Logs',
                        description: 'Open Callsign output channel logs',
                        command: 'callsign.showLogs',
                    },
                ],
                {
                    placeHolder: 'Select a Callsign command',
                },
            );

            if (selection?.command) {
                vscode.commands.executeCommand(selection.command);
            }
        }),
    );
}
