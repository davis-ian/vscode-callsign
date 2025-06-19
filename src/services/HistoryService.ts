// src/services/requestHistoryService.ts
import type { ExtensionContext } from 'vscode';
import type { RequestSnapshot } from '../types';
import { getHistoryLimit, getRequestHistory, setRequestHistory } from '../state/global';

let context: ExtensionContext;

const DEFAULT_MAX_HISTORY = 10;
let historyLimit: number | undefined;

// Set during activate()
export function initRequestHistoryService(extContext: ExtensionContext) {
    context = extContext;
    historyLimit = getHistoryLimit(context);
}

export async function addSnapshot(snapshot: RequestSnapshot) {
    let max = getHistoryLimit(context);
    if (!max) {
        max = DEFAULT_MAX_HISTORY;
    }

    const current = loadHistory();
    current.unshift(snapshot);

    if (current.length > max) {
        current.length = max;
    }
    await setRequestHistory(context, current);
}

export function loadHistory(): RequestSnapshot[] {
    return getRequestHistory(context);
}

export async function clearHistory() {
    await setRequestHistory(context, []);
}
