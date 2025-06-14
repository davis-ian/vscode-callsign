import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;

export function initLogger(): void {
    outputChannel = vscode.window.createOutputChannel('Callsign Logs');
}

function writeLog(level: string, ...args: any[]): void {
    if (!outputChannel) return;

    const timestamp = new Date().toISOString();
    const prefix = `[Callsign] [${timestamp}] [${level.toUpperCase()}]`;
    const message = args.map(a => stringify(a)).join(' ');

    outputChannel.appendLine(`${prefix} ${message}`);
}

export function logInfo(...args: any[]) {
    writeLog('info', ...args);
}

export function logWarn(...args: any[]) {
    writeLog('warn', ...args);
}

export function logError(...args: any[]) {
    writeLog('error', ...args);
}

export function logDebug(...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
        writeLog('debug', ...args);
    }
}

export function showLogs(): void {
    outputChannel?.show(true);
}

function stringify(value: any): string {
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}
