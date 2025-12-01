import { stringify } from 'querystring';
import { logDebug, logInfo } from '../core/logger';
import { updateStatusBar } from '../core/statusBar';
import { OpenApiRoute, OpenApiSpec } from '../types';
import axios from 'axios';
import https from 'https';

export async function loadJsonFromUrl(url: string) {
  try {

    logDebug('fetching json from ', url)

    const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

    logDebug('is local host: ', isLocalhost)

    const response = await axios.get(url, {
        httpsAgent: isLocalhost ? new https.Agent({ rejectUnauthorized: false }) : undefined
    });


    let result = response.data as OpenApiSpec;
    result.path = url;

    let pinnedRoutes = [];
    let totalRoutes = result.paths.length;

    updateStatusBar('idle', totalRoutes, pinnedRoutes.length);

    return result;
  } catch (error) {
    logDebug('Error fetching json', errorToString(error))
  }
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



function errorToString(err: any): string {
    if (!err) return 'Unknown error';

    if (err instanceof Error) {
        let msg = `${err.name}: ${err.message}`;

        if (err.cause) {
            msg += `\nCause: ${JSON.stringify(err.cause, null, 2)}`;
        }

        if (err.stack) {
            msg += `\nStack:\n${err.stack}`;
        }

        return msg;
    }

    return stringify(err);
}
