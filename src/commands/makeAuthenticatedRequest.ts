import { logInfo } from '../core/logger';
import { AuthService } from '../services/AuthService';

export async function makeAuthenticatedRequest(payload: any, authService: AuthService) {
    const { endpoint, authId, body, params } = payload;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (authId) {
        const credential = await authService.getCredential(authId);
        if (credential) {
            const authHeaders = authService.formatForHeader(credential);
            Object.assign(headers, authHeaders);
        }
    }

    let url = endpoint.url;
    if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const response = await fetch(url, {
        method: endpoint.method.toUpperCase(),
        headers,
        body: body && endpoint.method.toUppperCase() !== 'GET' ? JSON.stringify(body) : undefined,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    let responseBody;

    try {
        const text = await response.text();
        // logInfo('Raw response text:', text);

        if (!text || text.trim() === '') {
            // Empty response - create a meaningful error message
            if (!response.ok) {
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
            const contentType = response.headers.get('content-type');
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

    return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        timestamp: new Date().toISOString(),
    };
}
