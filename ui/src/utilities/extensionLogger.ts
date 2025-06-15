import { extensionBridge } from '@/services/ExtensionBridge';
import type { LogLevel } from '@/types';

const logLevels = ['info', 'error', 'debug', 'warn'] as const;

export function vsLog(...args: any[]) {
    let level: LogLevel = 'info';
    let values: any[] = args;

    if (logLevels.includes(args[0])) {
        level = args[0];
        values = args.slice(1);
    }

    const sanitized = values.map(sanitizeForBridge);

    extensionBridge.writeLog(level, ...sanitized);
}

export function vsLogError(...args: any[]) {
    let level: LogLevel = 'error';
    let values: any[] = args;

    const sanitized = values.map(sanitizeForBridge);

    extensionBridge.writeLog(level, ...sanitized);
}

function sanitizeForBridge(value: any): string {
    if (typeof value === 'string') {
        return value;
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return '[Unserializable]';
    }
}
