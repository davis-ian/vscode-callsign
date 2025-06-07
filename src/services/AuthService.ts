import * as vscode from 'vscode';

export interface AuthCredential {
    id: string;
    name: string;
    type: 'bearer' | 'api-key' | 'basic';
    headerName?: string;
    description?: string;
    createdAt: Date;
    lastUsed?: Date;
}

export interface StoredAuth {
    credential: AuthCredential;
    value: string;
}

export class AuthService {
    private static readonly CREDENTIALS_KEY = 'auth.credentials';
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Store authentication credential securely using VS Code's built-in secrets API
     */
    async storeCredential(credential: Omit<AuthCredential, 'id' | 'createdAt'>, value: string): Promise<string> {
        const credentials = await this.getCredentialMetadata();
        const now = new Date();

        // Remove any existing credential of the same type
        const filtered = credentials.filter(c => c.type !== credential.type);
        const existing = credentials.find(c => c.type === credential.type);

        let id = existing?.id || this.generateId();

        const fullCredential: AuthCredential = {
            ...credential,
            id,
            createdAt: existing?.createdAt ?? now,
            lastUsed: now,
        };

        // Store the secret and metadata
        await this.context.secrets.store(`auth.${id}`, value);
        await this.context.globalState.update(AuthService.CREDENTIALS_KEY, [...filtered, fullCredential]);

        vscode.window.showInformationMessage(
            `Authentication "${credential.name}" ${existing ? 'updated' : 'saved'} securely`,
        );

        return id;
    }

    /**
     * Retrieve authentication credential
     */

    async getCredential(id: string): Promise<StoredAuth | null> {
        try {
            const credentials = await this.getCredentialMetadata();
            const credential = credentials.find(c => c.id === id);

            if (!credential) {
                return null;
            }

            const value = await this.context.secrets.get(`auth.${id}`);

            if (!value) {
                vscode.window.showWarningMessage(`Authentication "${credential.name}" not found`);
                return null;
            }

            // Update last used timestamp
            credential.lastUsed = new Date();
            await this.saveCredentialMetadata(credential);

            return { credential, value };
        } catch (error) {
            console.error(`Error retreiving credential: `, error);
            return null;
        }
    }

    /**
     * Get all stored credential metadata (without actual values)
     */
    async getAllCredentials(): Promise<AuthCredential[]> {
        return await this.getCredentialMetadata();
    }

    /**
     * Get all stored credential metadata (without actual values)
     */
    async clearAllCredentials(): Promise<boolean> {
        const all = await this.getCredentialMetadata();

        try {
            await Promise.all(all.map(cred => this.deleteCredential(cred.id)));

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Delete authentication credential
     */
    async deleteCredential(id: string): Promise<boolean> {
        try {
            const credentials = await this.getCredentialMetadata();
            const credential = credentials.find(c => c.id === id);

            if (!credential) {
                return false;
            }

            // Remove from secrets storage
            await this.context.secrets.delete(`auth.${id}`);

            // Remove metadata
            const updatedCredentials = credentials.filter(c => c.id !== id);
            await this.context.globalState.update(AuthService.CREDENTIALS_KEY, updatedCredentials);

            vscode.window.showInformationMessage(`Authentication "${credential.name}" deleted`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete authentication: ${error}`);
            return false;
        }
    }

    /**
     * Format credential for HTTP header
     */
    formatForHeader(storedAuth: StoredAuth): { [key: string]: string } {
        const { credential, value } = storedAuth;

        switch (credential.type) {
            case 'bearer':
                return { Authorization: `Bearer ${value}` };

            case 'api-key':
                const headerName = credential.headerName || 'X-API-Key';
                return { [headerName]: value };

            case 'basic':
                // Assuming value is already base64 encoded username:password
                return { Authorization: `Basic ${value}` };

            default:
                throw new Error(`Unsupported credential type: ${credential.type}`);
        }
    }

    /**
     * Helper to create Basic Auth credential
     */
    async storeBasicAuth(name: string, username: string, password: string, description?: string): Promise<string> {
        const encoded = btoa(`${username}:${password}`); // browser-safe Base64
        return this.storeCredential(
            {
                name,
                type: 'basic',
                description,
            },
            encoded,
        );
    }

    /**
     * Test if credential is still valid (optional)
     */
    async testCredential(id: string, testEndpoint?: string): Promise<boolean> {
        const storedAuth = await this.getCredential(id);
        if (!storedAuth) {
            return false;
        }

        if (!testEndpoint) {
            return true; // Can't test without endpoint
        }

        try {
            const headers = this.formatForHeader(storedAuth);
            const response = await fetch(testEndpoint, {
                method: 'GET',
                headers,
            });
            return response.status !== 401 && response.status !== 403;
        } catch {
            return false;
        }
    }

    private async getCredentialMetadata(): Promise<AuthCredential[]> {
        return this.context.globalState.get<AuthCredential[]>(AuthService.CREDENTIALS_KEY, []);
    }

    private async saveCredentialMetadata(credential: AuthCredential): Promise<void> {
        const credentials = await this.getCredentialMetadata();
        const existingIndex = credentials.findIndex(c => c.id === credential.id);

        if (existingIndex >= 0) {
            credentials[existingIndex] = credential;
        } else {
            credentials.push(credential);
        }

        await this.context.globalState.update(AuthService.CREDENTIALS_KEY, credentials);
    }

    private generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
