import * as vscode from 'vscode';
import { KEYS } from './keys';

// --- GlobalState Helpers ---
export function getSpecUrls(ctx: vscode.ExtensionContext): string[] {
    return ctx.globalState.get<string[]>(KEYS.specUrls, []);
}

export function setSpecUrls(ctx: vscode.ExtensionContext, urls: string[]) {
    return ctx.globalState.update(KEYS.specUrls, urls);
}

export function getRequestHistory<T>(ctx: vscode.ExtensionContext): T[] {
    return ctx.globalState.get<T[]>(KEYS.requestHistory, []);
}

export function setRequestHistory<T>(ctx: vscode.ExtensionContext, history: T[]) {
    return ctx.globalState.update(KEYS.requestHistory, history);
}
export function getHistoryLimit(ctx: vscode.ExtensionContext): number | undefined {
    return ctx.globalState.get<number | undefined>(KEYS.historyLimit, undefined);
}

export function setHistoryLimit(ctx: vscode.ExtensionContext, history: number) {
    return ctx.globalState.update(KEYS.requestHistory, history);
}
