import { generateCode } from '../commands/codeGenCommand';
import { makeAuthenticatedRequest, sendRequest } from '../commands/makeAuthenticatedRequest';
import { AuthService } from '../services/AuthService';
import * as vscode from 'vscode';
import { LogLevel, OpenApiRoute, OpenApiSpec } from '../types';
import { buildCurl, getApiBaseUrlFromSpec } from '../utils/curlBuilder';
import { logDebug, logError, logInfo } from '../core/logger';
import { clearHistory, loadHistory } from '../services/HistoryService';
import { getSpecUrls, setSpecUrls } from '../state/global';
import { getCachedSpec, getLastSelectedSpecUrl, getSelectedAuthId, getSelectedRoute } from '../state/workspace';

export async function handleMessage(
    message: any,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    initialVueRoute?: string,
) {
    const authService = new AuthService(context);
    const { command, requestId, payload } = message;

    if (command != 'writeLog') {
        logInfo('handleMessage', message);
    }

    try {
        let data;

        switch (command) {
            case 'generateCode': {
                data = await generateCode(payload);
                break;
            }

            case 'storeAuth': {
                const authPayload = payload || message.payload;
                const { name, key, value, description } = authPayload;

                if (!key || !value) {
                    throw new Error('Both key and value are required to store authentication.');
                }

                const authId = await authService.storeCredential(
                    {
                        name: name || key,
                        key,
                        description,
                    },
                    value,
                );

                data = { success: true, authId };
                break;
            }

            case 'getAllCredentials': {
                data = await authService.getAllCredentials();
                break;
            }

            case 'clearAllCreds': {
                await authService.clearAllCredentials();
                data = { success: true };

                break;
            }
            case 'getCredentialById': {
                const id = payload?.id || message.id;
                data = await authService.getCredential(id);

                break;
            }

            case 'getAuthHeader': {
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
            }

            case 'getAllSpecUrls': {
                data = getSpecUrls(context);
                break;
            }

            case 'saveSpecUrl': {
                // Explicitly type the destructured values and scope them in a block
                const specPayload = payload as { name: string; url: string };
                const { name: specName, url: specUrl } = specPayload;

                const specUrls = getSpecUrls(context);

                // const newSpec = {
                //     id: `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                //     name: specName,
                //     url: specUrl,
                //     createdAt: new Date().toISOString(),
                // };

                specUrls.push(specUrl);
                await setSpecUrls(context, specUrls);
                data = specUrl;
                break;
            }

            case 'deleteSpecUrl': {
                const deletePayload = payload as { url: string };

                const allSpecs = getSpecUrls(context);
                const filteredSpecs = allSpecs.filter(spec => spec !== deletePayload.url);
                setSpecUrls(context, filteredSpecs);
                data = filteredSpecs.length !== allSpecs.length; // true if deleted
                break;
            }

            case 'getLastSelectedSpecUrl': {
                getLastSelectedSpecUrl(context);
                break;
            }

            case 'saveLastSelectedSpecUrl': {
                const urlPayload = payload as { urlId: string };
                const { urlId } = urlPayload;
                await context.workspaceState.update('callsign.lastSelectedSpecUrl', urlId);
                data = { success: true };
                break;
            }

            // case 'makeRequest': {
            //     data = await makeAuthenticatedRequest(payload, authService);
            //     break;
            // }

            case 'sendRequest': {
                logInfo('SEND REQUEST BEING HANDLED');
                // logInfo('send request payload in handler', payload);
                // const { route, headers, body, params } = payload;
                const { route, headers, body, params } = payload;
                logInfo('handler route: ', route);
                logInfo('handler route: ', headers);
                logInfo('handler route: ', body);
                logInfo('handler route: ', params);

                var response = await sendRequest(context, route, params, headers, body);

                logInfo('request response in handler', response);
                data = response;

                break;
            }

            case 'vueAppReady': {
                logInfo('vue app ready', initialVueRoute);
                const lastSelectedSpecUrl = getLastSelectedSpecUrl(context);
                const cachedSpec = getCachedSpec(context);
                const selectedRoute = getSelectedRoute(context);
                const authIdDown = getSelectedAuthId(context);

                data = {
                    selectedSpecUrl: lastSelectedSpecUrl || null,
                    openApiSpec: cachedSpec,
                    selectedRoute: selectedRoute,
                    selectedAuthId: authIdDown,
                    initialVueRoute: initialVueRoute,
                };

                break;
            }

            case 'buildCurl': {
                const cachedSpec = getCachedSpec<OpenApiSpec>(context);

                const { route, inputData } = payload;

                if (!route) return;

                const specUrl = cachedSpec?.path;
                const serverUrl = cachedSpec?.servers?.[0]?.url ?? '/';
                if (!specUrl || !serverUrl) {
                    throw new Error('Invalid  spec or server url');
                }

                const resolvedBaseUrl = getApiBaseUrlFromSpec(cachedSpec, specUrl);
                const curl = buildCurl(route, inputData, resolvedBaseUrl);

                data = { curl };
                break;
            }

            case 'getApiBaseUrlFromSpec': {
                const { spec, url } = payload;

                const resolvedBaseUrl = getApiBaseUrlFromSpec(spec, url);

                data = { url: resolvedBaseUrl };

                break;
            }

            case 'loadRequestHistory': {
                const history = loadHistory();

                data = history;
                break;
            }
            case 'clearRequestHistory': {
                await clearHistory();

                data = { success: true };
                break;
            }

            case 'toast': {
                const { message } = payload;
                logInfo('handling toast: ', message);
                vscode.window.showInformationMessage(message);
                break;
            }

            case 'writeLog': {
                const { level, args } = payload as { level: LogLevel; args: any[] };

                args.unshift('[UI]');

                switch (level) {
                    case 'error':
                        logError(...args);
                        break;
                    case 'info':
                        logInfo(...args);
                        break;
                    case 'debug':
                        logDebug(...args);
                        break;
                    default:
                        logInfo(...args);
                }
                break;
            }

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
        logError('Extention error: ', error);

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
