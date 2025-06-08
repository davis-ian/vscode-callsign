import type {
    ApiEndpoint,
    ApiResponse,
    AuthCredential,
    AuthHeader,
    AuthMethod,
    LoadJsonOptions,
    OpenApiSpec,
    StoredAuth,
} from '@/types';

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

    private async callExtension<T>(command: string, payload?: any): Promise<T> {
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
            }, 10000);
        });
    }

    async getAuthHeader(credentialId: string): Promise<AuthHeader | null> {
        return this.callExtension<AuthHeader | null>('getAuthHeader', { credentialId });
    }

    async getAvailableAuthMethods(): Promise<AuthMethod[]> {
        const credentials = await this.getAllCredentials();
        return credentials.map(cred => ({
            id: cred.id,
            name: cred.name,
            type: cred.type,
            displayName: `${cred.name} (${cred.type.toUpperCase()})`,
        }));
    }

    async makeAuthenticatedRequest(
        endpoint: ApiEndpoint,
        authId?: string,
        body?: any,
        params?: Record<string, string>,
    ): Promise<ApiResponse> {
        return this.callExtension<ApiResponse>('makeRequest', { endpoint, authId, body, params });
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

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}

export const extensionBridge = new ExtensionBridge();
export type { ExtensionBridge };
