import type { SpecUrl } from '@/stores/spec';
import type {
    ApiResponse,
    AuthCredential,
    AuthHeader,
    AuthMethod,
    CodeGenResult,
    CodeGenConfig,
    LoadJsonOptions,
    OpenApiSpec,
    StoredAuth,
    OpenApiRoute,
    CurlBuildResult,
    LogLevel,
    RequestSnapshot,
} from '@/types';
import { vsLog } from '@/utilities/extensionLogger';

class ExtensionBridge {
    private vscode: any;
    private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();

    constructor() {
        // @ts-ignore
        this.vscode = acquireVsCodeApi();

        (window as any).addEventListener('message', (event: MessageEvent) => {
            const { requestId, data, error } = event.data;

            // Handle new request/resp
            if (requestId && this.pendingRequests.has(requestId)) {
                const { resolve, reject } = this.pendingRequests.get(requestId)!;
                this.pendingRequests.delete(requestId);

                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(data);
                }
                return;
            }
        });
    }

    private async callExtension<T>(command: string, payload?: any, timeoutMs: number = 10000): Promise<T> {
        return new Promise((resolve, reject) => {
            const requestId = this.generateRequestId();

            this.pendingRequests.set(requestId, { resolve, reject });

            this.vscode.postMessage({
                command,
                requestId,
                payload,
            });

            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Request timeout'));
                }
            }, timeoutMs);
        });
    }

    async generateCode(config: CodeGenConfig): Promise<CodeGenResult> {
        return this.callExtension<CodeGenResult>('generateCode', config, 120000);
    }

    async selectFile(options?: { filters?: Record<string, string[]> }): Promise<string | null> {
        return this.callExtension<string | null>('selectFile', options);
    }

    async selectDirectory(): Promise<string | null> {
        return this.callExtension<string | null>('selectDirectory');
    }

    async openInFileManager(path: string): Promise<void> {
        return this.callExtension('openInFileManager', path);
    }

    async toast(message: string): Promise<void> {
        vsLog('extension bridge toast: ', message);
        return this.callExtension('toast', { message });
    }

    async vueAppReady(): Promise<any> {
        return this.callExtension('vueAppReady');
    }

    async writeLog(level: LogLevel, ...args: any[]): Promise<void> {
        return this.callExtension('writeLog', { level, args });
    }

    async getAuthHeader(credentialId: string): Promise<AuthHeader | null> {
        return this.callExtension<AuthHeader | null>('getAuthHeader', { credentialId });
    }

    async getAvailableAuthMethods(): Promise<AuthMethod[]> {
        const credentials = await this.getAllCredentials();
        return credentials.map(cred => ({
            id: cred.id,
            name: cred.name,
            key: cred.key,
            displayName: `${cred.name} (${cred.key.toUpperCase()})`,
        }));
    }

    async clearRequestHistory(): Promise<boolean> {
        return this.callExtension<boolean>('clearRequestHistory');
    }

    // async addRequestSnapshot(snapshot: RequestSnapshot): Promise<boolean> {
    //     vsLog('extension bride add snap', snapshot);
    //     return this.callExtension<boolean>('addRequestSnapshot', snapshot);
    // }

    async loadRequestHistory(): Promise<RequestSnapshot[]> {
        return this.callExtension<RequestSnapshot[]>('loadRequestHistory');
    }

    // async makeAuthenticatedRequest(
    //     endpoint: ApiEndpoint,
    //     headers: Record<string, string>,
    //     body?: any,
    //     params?: Record<string, string>,
    // ): Promise<ApiResponse> {
    //     return this.callExtension<ApiResponse>('makeRequest', { endpoint, headers, body, params });
    // }

    async sendRequest(
        route: OpenApiRoute,
        headers: Record<string, string>,
        body?: any,
        params?: Record<string, string>,
    ): Promise<ApiResponse> {
        vsLog('extesnionBridge send req route: ', route);
        vsLog('extesnionBridge send req headers: ', headers);
        vsLog('extesnionBridge send req body: ', body);
        vsLog('extesnionBridge send req params: ', params);

        const routeClone = JSON.parse(JSON.stringify(route));
        const headersClone = JSON.parse(JSON.stringify(headers));
        // const bodyClone = JSON.parse(JSON.stringify(body));
        // const paramsClone = JSON.parse(JSON.stringify(params));

        return this.callExtension('sendRequest', {
            route: routeClone,
            headers: headersClone,
            // body: bodyClone,
            // params: paramsClone,
        });
    }

    postMessage(message: any): void {
        this.vscode.postMessage(message);
    }

    async storeCredential(credential: {
        name: string;
        type: 'bearer' | 'api-key' | 'basic';
        value: string;
    }): Promise<{ success: boolean }> {
        return this.callExtension('storeAuth', credential);
    }

    async updateCredential(credential: { authId: string; key: string; value: string }): Promise<{ success: boolean }> {
        return this.callExtension('updateAuth', credential);
    }

    async getAllCredentials(): Promise<AuthCredential[]> {
        return this.callExtension<AuthCredential[]>('getAllCredentials');
    }

    async getCredentialById(id: string): Promise<StoredAuth | null> {
        return this.callExtension<StoredAuth | null>('getCredentialById', { id });
    }

    async clearAllCredentials(): Promise<{ success: boolean }> {
        return this.callExtension<{ success: boolean }>('clearAllCreds');
    }

    async loadJsonFromUrl(url: string): Promise<OpenApiSpec> {
        return this.callExtension<OpenApiSpec>('loadJson', {
            type: 'url',
            url,
        });
    }

    async loadJsonFromFile(content: string): Promise<OpenApiSpec> {
        return this.callExtension<OpenApiSpec>('loadJson', {
            type: 'file',
            content,
        });
    }

    async loadDefaultJson(): Promise<OpenApiSpec> {
        return this.callExtension<OpenApiSpec>('loadJson', {
            type: 'default',
        });
    }

    async loadJson(options: LoadJsonOptions): Promise<OpenApiSpec> {
        return this.callExtension<OpenApiSpec>('loadJson', options);
    }

    async getAllSpecUrls(): Promise<SpecUrl[]> {
        return this.callExtension<SpecUrl[]>('getAllSpecUrls');
    }

    async saveSpecUrl(spec: { name: string; url: string }): Promise<SpecUrl> {
        return this.callExtension<SpecUrl>('saveSpecUrl', spec);
    }

    async deleteSpecUrl(id: string): Promise<boolean> {
        return this.callExtension<boolean>('deleteSpecUrl', { id });
    }

    async getLastSelectedSpecUrl(): Promise<string | null> {
        return this.callExtension<string | null>('getLastSelectedSpecUrl');
    }

    async saveLastSelectedSpecUrl(urlId: string): Promise<void> {
        return this.callExtension<void>('saveLastSelectedSpecUrl', { urlId });
    }

    async buildCurl(route: OpenApiRoute, inputData: any = {}): Promise<CurlBuildResult> {
        const safeRoute = sanitizeRoute(route);
        console.log('sanitized', safeRoute);
        return this.callExtension<CurlBuildResult>('buildCurl', { route: safeRoute, inputData });
    }

    async getApiBaseUrlFromSpec(spec: OpenApiSpec, url: string): Promise<string> {
        return this.callExtension<string>('getApiBaseUrlFromSpec', { spec, url });
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}

export const extensionBridge = new ExtensionBridge();
export type { ExtensionBridge };

function sanitizeRoute(route: OpenApiRoute): Pick<OpenApiRoute, 'method' | 'path' | 'details'> {
    return {
        method: route.method,
        path: route.path,
        details: {
            summary: route.details?.summary ?? '',
            description: route.details?.description ?? '',
            parameters: route.details?.parameters ?? [],
            requestBody: route.details?.requestBody ?? undefined,
            responses: route.details?.responses ?? {},
        },
    };
}
