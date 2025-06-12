import * as vscode from 'vscode';
import { OpenApiRoute, OpenApiSpec } from '../types';
import { RouteTreeProvider } from '../tree/RouteTreeProvider';

import { loadJsonFromUrl } from '../utils/fetchJson';
import { handleMessage } from '../handlers/handleMessage';
import { getWebviewContent } from '../utils/getWebviewContent';
import { getConfiguredSpecUrls } from '../utils/settings';

export function registerCommands(context: vscode.ExtensionContext, routeTreeProvider: RouteTreeProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand('callsign.refreshRoutes', () => {
            const rawSpec = routeTreeProvider.getCurrentSpec();
            if (rawSpec) routeTreeProvider.setRoutes(rawSpec, context);
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('callsign.openRoute', (route: OpenApiRoute) => {
            vscode.window.showInformationMessage(`Route: ${route.method.toUpperCase()} ${route.path}`);
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('callsign.showRoutesView', () => {
            vscode.commands.executeCommand('workbench.views.explorer.callsign.routes');
        }),
    );

    context.subscriptions.push(
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
    );

    context.subscriptions.push(
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
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('callsign.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:yourPublisher.callsign');
        }),
    );

    context.subscriptions.push(
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
                vscode.window.showInformationMessage(`Loaded routes from ${selected}`);
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to load spec: ${(err as Error).message}`);
            }
        }),
    );

    context.subscriptions.push(
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
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('callsign.openPanel', () => {
            const panel = vscode.window.createWebviewPanel('callsignDocs', 'Callsign', vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });

            panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

            panel.webview.onDidReceiveMessage(
                message => handleMessage(message, panel, context),
                undefined,
                context.subscriptions,
            );
        }),
    );
}
