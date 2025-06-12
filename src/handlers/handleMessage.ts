export async function handleMessage(message: any, panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    const authService = new AuthService(context);
    const { command, requestId, payload } = message;

    try {
        let data;

        switch (command) {
            case 'generateCode':
                console.log('Generating code with payload: ', payload);
                data = await generateCode(payload);
                break;
            case 'selectFile':
                console.log('TODO:');
                break;
            case 'selectDirectory':
                console.log('TODO:');
                break;
            case 'openInFileManager':
                console.log('TODO:');
                break;

            case 'loadJson':
                await handleLoadJson(message, panel, context);
                break;
            case 'storeAuth':
                const authPayload = payload || message.payload;
                const { type, name: authName, value } = authPayload;
                console.log('storing auth @ extension.ts', type, authName);
                await authService.storeCredential({ name: authName, type }, value);
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

                console.log('=== SAVE SPEC URL DEBUG ===');
                console.log('Raw message:', JSON.stringify(message, null, 2));
                console.log('Command:', command);
                console.log('Payload:', payload);
                console.log('Payload type:', typeof payload);

                const specUrls = context.globalState.get<
                    Array<{ id: string; name: string; url: string; createdAt: string }>
                >('callsign.specUrls', []);

                console.log(specUrls, 'spec urls');

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
                data = context.globalState.get('callsign.lastSelectedSpecUrl', null);
                break;

            case 'saveLastSelectedSpecUrl': {
                const urlPayload = payload as { urlId: string };
                const { urlId } = urlPayload;
                await context.globalState.update('callsign.lastSelectedSpecUrl', urlId);
                data = { success: true };
                break;
            }

            case 'makeRequest':
                data = await makeAuthenticatedRequest(payload, authService);
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
