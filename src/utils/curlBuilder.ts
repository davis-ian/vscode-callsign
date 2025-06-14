import type { OpenApiRoute } from '../types';

export function buildCurl(route: OpenApiRoute, inputData: any = {}): string {
    const method = route.method.toUpperCase();
    const baseUrl = 'https://api.example.com'; // TODO: make configurable
    const path = route.path;

    let curl = `curl -X ${method} "${baseUrl}${path}"`;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        curl += ` \\\n  -H "Content-Type: application/json" \\\n  --data '${JSON.stringify(inputData, null, 2)}'`;
    }

    return curl;
}
