import { generateCode } from '../commands/codeGenCommand';
import { makeAuthenticatedRequest } from '../commands/makeAuthenticatedRequest';
import { AuthService } from '../services/AuthService';
import * as vscode from 'vscode';
import { OpenApiRoute, OpenApiSpec } from '../types';

export async function handleMessage(message: any, panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    const authService = new AuthService(context);
    const { command, requestId, payload } = message;

    try {
        let data;

        switch (command) {
            case 'generateCode':
                data = await generateCode(payload);
                break;

            case 'storeAuth':
                const authPayload = payload || message.payload;
                const { type, name: authName, value } = authPayload;

                const authIdUp = await authService.storeCredential({ name: authName, type }, value);

                await context.workspaceState.update('callsign.selectedAuthId', authIdUp);
                data = { success: true };
                break;

            case 'getAllCredentials':
                data = await authService.getAllCredentials();
                break;

            case 'clearAllCreds':
                await authService.clearAllCredentials();
                data = { success: true };

                break;
            case 'getCredentialById':
                const id = payload?.id || message.id;
                data = await authService.getCredential(id);
                break;

            case 'getAuthHeader':
                const credId = payload.credentialId;
                const credential = await authService.getCredential(credId);
                if (credential) {
                    const headers = authService.formatForHeader(credential);

                    const headerEntry = Object.entries(headers)[0];
                    data = headerEntry ? { key: headerEntry[0], value: headerEntry[1] } : null;
                } else {
                    data = null;
                }
                break;

            case 'getAllSpecUrls':
                data = context.globalState.get('callsign.specUrls', []);
                break;

            case 'saveSpecUrl': {
                // Explicitly type the destructured values and scope them in a block
                const specPayload = payload as { name: string; url: string };
                const { name: specName, url: specUrl } = specPayload;

                const specUrls = context.globalState.get<
                    Array<{ id: string; name: string; url: string; createdAt: string }>
                >('callsign.specUrls', []);

                const newSpec = {
                    id: `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: specName,
                    url: specUrl,
                    createdAt: new Date().toISOString(),
                };

                specUrls.push(newSpec);
                await context.globalState.update('callsign.specUrls', specUrls);
                data = newSpec;
                break;
            }

            case 'deleteSpecUrl': {
                const deletePayload = payload as { id: string };
                const deleteId = deletePayload.id;
                const allSpecs = context.globalState.get<
                    Array<{ id: string; name: string; url: string; createdAt: string }>
                >('callsign.specUrls', []);
                const filteredSpecs = allSpecs.filter(spec => spec.id !== deleteId);
                await context.globalState.update('callsign.specUrls', filteredSpecs);
                data = filteredSpecs.length !== allSpecs.length; // true if deleted
                break;
            }

            case 'getLastSelectedSpecUrl':
                data = context.workspaceState.get('callsign.lastSelectedSpecUrl', null);
                break;

            case 'saveLastSelectedSpecUrl': {
                const urlPayload = payload as { urlId: string };
                const { urlId } = urlPayload;
                await context.workspaceState.update('callsign.lastSelectedSpecUrl', urlId);
                data = { success: true };
                break;
            }

            case 'makeRequest':
                data = await makeAuthenticatedRequest(payload, authService);
                break;

            case 'vueAppReady':
                const lastSelectedSpecUrl = context.workspaceState.get<string>('callsign.lastSelectedSpecUrl');
                const cachedSpec = context.workspaceState.get<OpenApiSpec | null>('callsign.cachedSpec', null);
                const selectedRoute = context.workspaceState.get<OpenApiRoute | null>('callsign.selectedRoute');
                const authIdDown = context.workspaceState.get<string>('callsign.selectedAuthId');

                data = {
                    selectedSpecUrl: lastSelectedSpecUrl || null,
                    openApiSpec: cachedSpec,
                    selectedRoute: selectedRoute,
                    selectedAuthId: authIdDown,
                };

                break;

            default:
                panel.webview.postMessage({ command: 'error', error: 'Unknown command' });
        }

        if (requestId) {
            panel.webview.postMessage({
                command: 'response',
                requestId,
                data,
                error: null,
            });
        } else {
            panel.webview.postMessage({ command: `${command}Response`, data });
        }
    } catch (error) {
        console.error('Extention error: ', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        if (requestId) {
            panel.webview.postMessage({
                command: 'response',
                requestId,
                data: null,
                error: errorMessage,
            });
        } else {
            panel.webview.postMessage({ command: `${command}Response`, errorMessage });
        }
    }
}
