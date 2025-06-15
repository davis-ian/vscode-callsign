import type { OpenApiRoute } from '../types';

export function buildCurl(
    route: OpenApiRoute,
    inputData: {
        params?: Record<string, string>;
        body?: any;
        authHeader?: { key: string; value: string };
    } = {},
    baseUrl: string,
): string {
    const method = route.method.toUpperCase();
    let url = `${baseUrl.replace(/\/+$/, '')}/${route.path.replace(/^\/+/, '')}`;

    // Replace path params like /users/{id}
    if (inputData.params) {
        for (const [key, value] of Object.entries(inputData.params)) {
            url = url.replace(new RegExp(`{${key}}`, 'g'), encodeURIComponent(value));
        }
    }

    // Collect query params (anything left over in params not in path)
    const queryParams = Object.entries(inputData.params || {}).filter(([key]) => !route.path.includes(`{${key}}`));
    if (queryParams.length) {
        const queryString = queryParams
            .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
            .join('&');
        url += `?${queryString}`;
    }

    let curl = `curl -X ${method} "${url}"`;

    // Auth header
    if (inputData.authHeader) {
        curl += ` \\\n  -H "${inputData.authHeader.key}: ${inputData.authHeader.value}"`;
    }

    // Content-Type + body for applicable methods
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        curl += ` \\\n  -H "Content-Type: application/json" \\\n  --data '${JSON.stringify(
            inputData.body ?? {},
            null,
            2,
        )}'`;
    }

    return curl;
}

export function resolveServerUrl(specUrl: string, serverUrl: string): string {
    try {
        // Absolute: return as-is
        if (serverUrl.startsWith('http')) {
            return serverUrl;
        }

        // Relative: resolve against the spec origin
        const base = new URL(specUrl);
        return new URL(serverUrl, base).toString();
    } catch {
        return serverUrl; // Fallback to raw string
    }
}
