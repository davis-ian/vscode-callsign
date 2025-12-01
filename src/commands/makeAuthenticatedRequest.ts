import { logInfo } from '../core/logger';
import { addSnapshot } from '../services/HistoryService';
import { ApiEndpoint, ApiResponse, OpenApiRoute, OpenApiSpec, RequestSnapshot } from '../types';
import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { getApiBaseUrlFromSpec } from '../utils/curlBuilder';
import { getCachedSpec } from '../state/workspace';
import https from 'https';
import axios from 'axios';

export async function makeAuthenticatedRequest(
    context: vscode.ExtensionContext,
    route: OpenApiRoute,
    headers: Record<string, string>,
    body?: any,
    params: Record<string, string> = {},
): Promise<ApiResponse> {
    logInfo('MAKE AUTH REQUEST INIT');

    const currentSpec = getCachedSpec<OpenApiSpec>(context);

    if (!currentSpec?.path) {
        throw new Error('Invalid  spec or server url');
    }

    const path = route.path.replace(/{(.+?)}/g, (_match, name) => params[name] || `{${name}}`);

    const queryString = buildQueryString(route, params);
    const resolvedBaseUrl = getApiBaseUrlFromSpec(currentSpec, currentSpec.path);
    const finalPath = queryString ? `${path}?${queryString}` : path;

    const finalUrl = `${resolvedBaseUrl}${finalPath}`;
    const method = route.method.toUpperCase();
    const finalBody = body && method !== 'GET' ? JSON.stringify(body) : undefined;

    logInfo('📤 Sending Request:', {
        method,
        finalUrl,
        headers,
        params,
        body: finalBody,
    });

    const isLocalhost = finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1');

    const response = await axios({
        method,
        url: finalUrl,
        headers,
        data: body && method !== 'GET' ? body : undefined,
        httpsAgent: isLocalhost ? new https.Agent({ rejectUnauthorized: false }) : undefined,
        validateStatus: () => true,
        transformResponse: [(data) => data]
    });

    const responseHeaders: Record<string, string> = {};
    Object.entries(response.headers).forEach(([key, value]) => {
        responseHeaders[key] = String(value);
    });

    let responseBody;

    try {
        const text = response.data;
        // logInfo('Raw response text:', text);

        if (!text || text.trim() === '') {
            // Empty response - create a meaningful error message
            if (response.status >= 400) {
                responseBody = {
                    error: `HTTP ${response.status}`,
                    message: response.statusText || 'Request failed',
                    status: response.status,
                };
            } else {
                responseBody = null;
            }
        } else {
            // Try to parse as JSON first
            const contentType = response.headers['content-type'];
            if (contentType?.includes('application/json')) {
                try {
                    responseBody = JSON.parse(text);
                } catch (parseError) {
                    responseBody = text; // Fallback to raw text
                }
            } else {
                responseBody = text;
            }
        }
    } catch (error) {
        console.error('Error reading response:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        responseBody = {
            error: 'Failed to read response',
            message: errorMessage,
            status: response.status,
        };
    }

    // logInfo('Final response body:', responseBody);
    const snapshot: RequestSnapshot = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        method: route.method,
        path: route.path,
        status: response.status,
        requestBody: body,
        responseBody,
        queryParams: params,
        fullUrl: finalUrl,
        route: route,
    };

    await addSnapshot(snapshot);
    await vscode.commands.executeCommand('callsign.refreshHistoryTree');

    var responseData: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        timestamp: new Date().toISOString(),
    };
    return responseData;
}

export async function sendRequest(
    context: vscode.ExtensionContext,
    route: OpenApiRoute,
    paramInputs: Record<string, string>,
    authHeader?: { key: string; value: string },
    bodyInput?: string,
): Promise<ApiResponse> {
    logInfo('SENDING REQUEST', paramInputs);
    const hasBody = route.details?.requestBody?.content?.['application/json'];

    // Build query parameters
    const queryParams: Record<string, string> = {};
    if (route.details?.parameters) {
        for (const param of route.details.parameters) {
            if (paramInputs[param.name]) {
                queryParams[param.name] = paramInputs[param.name];
            }
        }
    }

    // Parse JSON body (if applicable)
    let body: any = null;
    if (hasBody && bodyInput?.trim()) {
        try {
            body = JSON.parse(bodyInput);
        } catch (err) {
            throw new Error('Invalid JSON body');
        }
    }

    // Replace path params
    // const path = route.path.replace(/{(.+?)}/g, (_match, name) => paramInputs[name] || `{${name}}`);

    // const specUrl = specStore.currentSpec?.path;

    // const resolvedBaseUrl = getApiBaseUrlFromSpec(currentSpec, currentSpec.path);

    // const endpoint = {
    //     url: `${resolvedBaseUrl}${path}`,
    //     method: route.method,
    // };

    const rawParams = { ...paramInputs };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (authHeader && authHeader.key && authHeader.value) {
        headers[authHeader.key] = authHeader.value;
    }

    // const curl = buildCurlCommand(route.method, endpoint.url, headers, body);

    const result = await makeAuthenticatedRequest(context, route, headers, body, rawParams);

    return result;
}

function buildQueryString(route: OpenApiRoute, params: Record<string, string>): string {
    const queryParams = new URLSearchParams();

    if (route.details?.parameters) {
        for (const param of route.details.parameters) {
            if (param.in === 'query' && params[param.name]) {
                const value = params[param.name];

                const isArray = param.schema?.type === 'array' || param.schema?.items;

                if (isArray) {
                    let arrayValues: string[] = [];

                    try {
                        const parsed = JSON.parse(value);
                        if (Array.isArray(parsed)) {
                            arrayValues = parsed.map(v => String(v));
                        } else {
                            arrayValues = [String(parsed)];
                        }
                    } catch {
                        arrayValues = value.includes(',') ? value.split(',').map(v => v.trim()) : [value];
                    }

                    arrayValues.forEach(val => queryParams.append(param.name, val));
                } else {
                    queryParams.append(param.name, value);
                }
            }
        }
    }

    return queryParams.toString();
}
