import type { ApiResponse, OpenApiRoute } from '@/types';
import { extensionBridge } from './ExtensionBridge';

export async function sendRequest(
    route: OpenApiRoute,
    paramInputs: Record<string, string>,
    authId?: string,
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

    // Replace path params
    const path = route.path.replace(/{(.+?)}/g, (_match, name) => paramInputs[name] || `{${name}}`);

    console.log(path, 'path @ req service');
    const endpoint = {
        url: `https://api-develop.memoryshare.com${path}`,
        method: route.method,
    };

    // Make authenticated request through extension bridge
    const rawParams = { ...paramInputs };
    const result = await extensionBridge.makeAuthenticatedRequest(endpoint, authId || undefined, body, rawParams);

    return result;
}
