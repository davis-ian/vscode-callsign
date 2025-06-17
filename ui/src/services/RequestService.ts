import type { ApiResponse, OpenApiRoute } from '@/types';
import { extensionBridge } from './ExtensionBridge';

import { useSpecStore } from '@/stores/spec';

export async function sendRequest(
    route: OpenApiRoute,
    paramInputs: Record<string, string>,
    authHeader?: { key: string; value: string },
    bodyInput?: string,
): Promise<ApiResponse> {
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

    const specStore = useSpecStore();
    // Replace path params
    const path = route.path.replace(/{(.+?)}/g, (_match, name) => paramInputs[name] || `{${name}}`);

    const specUrl = specStore.currentSpec?.path;
    const serverUrl = specStore.currentSpec?.servers?.[0]?.url ?? '/';
    if (!specUrl || !serverUrl) {
        throw new Error('Invalid  spec or server url');
    }
    // const resolvedBaseUrl = resolveServerUrl(specUrl, serverUrl);\

    const resolvedBaseUrl = getApiBaseUrlFromSpec(specStore.currentSpec, specUrl);

    const endpoint = {
        url: `${resolvedBaseUrl}${path}`,
        method: route.method,
    };

    // Make authenticated request through extension bridge
    const rawParams = { ...paramInputs };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (authHeader && authHeader.key && authHeader.value) {
        headers[authHeader.key] = authHeader.value;
    }

    const curl = buildCurlCommand(route.method, endpoint.url, headers, body);

    const result = await extensionBridge.makeAuthenticatedRequest(endpoint, headers, body, rawParams);

    // addSnapshot({
    //     id: crypto.randomUUID?.() || Date.now().toString(),
    //     timestamp: new Date().toISOString(),
    //     method: route.method,
    //     path: route.path,
    //     status: result.status,
    //     requestBody: bodyInput,
    //     responseBody: result.body,
    //     queryParams: rawParams,
    //     fullUrl: endpoint.url,
    //     route: route,
    //     curl: curl,
    // });

    result.curl = curl;
    return result;
}

function buildCurlCommand(method: string, url: string, headers: Record<string, string> = {}, body?: any): string {
    const parts: string[] = [`curl -X ${method.toUpperCase()}`];

    parts.push(`'${url}'`);

    for (const [key, value] of Object.entries(headers)) {
        parts.push(`-H '${key}: ${value}'`);
    }

    if (body) {
        const json = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
        parts.push(`--data '${json}'`);
    }

    return parts.join(' \\\n  ');
}

export function getApiBaseUrlFromSpec(spec: any, specUrl: string): string {
    try {
        // --- OpenAPI 3.x ---
        if (spec.openapi && spec.openapi.startsWith('3')) {
            const servers = spec.servers;
            if (Array.isArray(servers) && servers.length > 0 && servers[0].url) {
                const serverUrl = servers[0].url;
                return new URL(serverUrl, specUrl).toString();
            }
        }

        // --- Swagger 2.0 / OpenAPI 2.0 ---
        if (spec.swagger === '2.0' && spec.host) {
            const scheme = spec.schemes?.includes('https') ? 'https' : 'http';
            const host = spec.host;
            const basePath = spec.basePath || '/';
            return `${scheme}://${host}${basePath}`.replace(/\/+$/, ''); // Trim trailing slash
        }

        // Fallback
        return new URL('.', specUrl).toString().replace(/\/+$/, '');
    } catch {
        return specUrl;
    }
}
