// import type { ApiResponse, OpenApiRoute } from '@/types';
// import { extensionBridge } from './ExtensionBridge';

// export async function sendRequest(
//     route: OpenApiRoute,
//     paramInputs: Record<string, string>,
//     authHeader?: { key: string; value: string },
//     bodyInput?: string,
// ): Promise<ApiResponse> {
//     // const hasBody = route.details?.requestBody?.content?.['application/json'];

//     // // Build query parameters
//     // const queryParams: Record<string, string> = {};
//     // if (route.details?.parameters) {
//     //     for (const param of route.details.parameters) {
//     //         if (paramInputs[param.name]) {
//     //             queryParams[param.name] = paramInputs[param.name];
//     //         }
//     //     }
//     // }

//     // // Parse JSON body (if applicable)
//     // let body: any = null;
//     // if (hasBody && bodyInput?.trim()) {
//     //     try {
//     //         body = JSON.parse(bodyInput);
//     //     } catch (err) {
//     //         throw new Error('Invalid JSON body');
//     //     }
//     // }

//     // const specStore = useSpecStore();
//     // // Replace path params
//     // const path = route.path.replace(/{(.+?)}/g, (_match, name) => paramInputs[name] || `{${name}}`);

//     // const specUrl = specStore.currentSpec?.path;
//     // const serverUrl = specStore.currentSpec?.servers?.[0]?.url ?? '/';
//     // if (!specUrl || !serverUrl) {
//     //     throw new Error('Invalid  spec or server url');
//     // }
//     // // const resolvedBaseUrl = resolveServerUrl(specUrl, serverUrl);\

//     // const resolvedBaseUrl = extensionBridge.getApiBaseUrlFromSpec(specStore.currentSpec, specUrl);

//     // const endpoint = {
//     //     url: `${resolvedBaseUrl}${path}`,
//     //     method: route.method,
//     // };

//     // // Make authenticated request through extension bridge
//     // const rawParams = { ...paramInputs };

//     // const headers: Record<string, string> = {
//     //     'Content-Type': 'application/json',
//     // };

//     // if (authHeader && authHeader.key && authHeader.value) {
//     //     headers[authHeader.key] = authHeader.value;
//     // }

//     // const curl = buildCurlCommand(route.method, endpoint.url, headers, body);

//     // const result = await extensionBridge.makeAuthenticatedRequest(endpoint, headers, body, rawParams);

//     // // addSnapshot({
//     // //     id: crypto.randomUUID?.() || Date.now().toString(),
//     // //     timestamp: new Date().toISOString(),
//     // //     method: route.method,
//     // //     path: route.path,
//     // //     status: result.status,
//     // //     requestBody: bodyInput,
//     // //     responseBody: result.body,
//     // //     queryParams: rawParams,
//     // //     fullUrl: endpoint.url,
//     // //     route: route,
//     // //     curl: curl,
//     // // });

//     // result.curl = curl;
//     // return result;
// }
