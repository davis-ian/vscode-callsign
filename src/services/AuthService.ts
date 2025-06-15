import * as vscode from 'vscode';
import { logInfo } from '../core/logger';

export interface AuthCredential {
    id: string;
    name: string;
    key: string;
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

    async storeCredential(credential: Omit<AuthCredential, 'id' | 'createdAt'>, value: string): Promise<string> {
        const credentials = await this.getCredentialMetadata();
        const now = new Date();

        // Always create a new ID, allow duplicates
        const id = this.generateId();
        const fullCredential: AuthCredential = {
            ...credential,
            id,
            createdAt: now,
            lastUsed: now,
        };

        // Store the secret and add metadata
        await this.context.secrets.store(`auth.${id}`, value);
        await this.context.globalState.update(AuthService.CREDENTIALS_KEY, [...credentials, fullCredential]);

        vscode.window.showInformationMessage(`Auth header "${credential.name}" saved`);

        this.setActiveCredential(id);
        return id;
    }

    async setActiveCredential(id: string): Promise<boolean> {
        const existing = await this.getCredential(id);

        if (!existing) {
            vscode.window.showErrorMessage('Invalid header id');
            return false;
        }

        await this.context.workspaceState.update('callsign.selectedAuthId', id);
        vscode.window.showInformationMessage(`Auth header "${existing.credential.name}" saved`);
        logInfo('updated selected auth id: ', id);
        return true;
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

            await this.context.workspaceState.update('callsign.selectedAuthId', undefined);
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

            const selectedId = await this.context.workspaceState.get<string>('callsign.selectedAuthId');
            if (selectedId === id) {
                await this.context.workspaceState.update('callsign.selectedAuthId', undefined);
            }
            vscode.window.showInformationMessage(`Authentication "${credential.name}" deleted`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete authentication: ${error}`);
            return false;
        }
    }

    formatForHeader(storedAuth: StoredAuth): { [key: string]: string } {
        const { credential, value } = storedAuth;
        return { [credential.key]: value };
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
