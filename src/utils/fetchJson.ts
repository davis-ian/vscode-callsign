import { OpenApiRoute, OpenApiSpec } from '../types';

export async function loadJsonFromUrl(url: string) {
    console.log('fetching from url: ', url);
    const response = await fetch(url);
    console.log('Response status: ', response.status);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonData = await response.json();
    console.log(jsonData, 'json data');
    let result = jsonData as OpenApiSpec;
    result.path = url;

    return result;
}

export function groupRoutesByTag(spec: OpenApiSpec): Record<string, OpenApiRoute[]> {
    const grouped: Record<string, OpenApiRoute[]> = {};

    for (const path in spec.paths) {
        const methods = spec.paths[path];
        for (const method in methods) {
            const op = methods[method];
            const route: OpenApiRoute = {
                method: method as OpenApiRoute['method'],
                path,
                details: {
                    summary: op.summary,
                    description: op.description,
                    parameters: op.parameters,
                    requestBody: op.requestBody,
                    responses: op.responses,
                },
            };

            const tags = op.tags || ['_untagged'];
            for (const tag of tags) {
                if (!grouped[tag]) grouped[tag] = [];
                grouped[tag].push(route);
            }
        }
    }

    return grouped;
}

export function flattenOpenApiPaths(spec: OpenApiSpec): OpenApiRoute[] {
    const routes: OpenApiRoute[] = [];

    for (const path in spec.paths) {
        const methods = spec.paths[path];
        for (const method in methods) {
            routes.push({
                method: method as OpenApiRoute['method'],
                path,
                details: {
                    summary: methods[method].summary,
                    description: methods[method].description,
                    parameters: methods[method].parameters,
                    requestBody: methods[method].requestBody,
                    responses: methods[method].responses,
                },
            });
        }
    }

    return routes;
}
