import * as vscode from 'vscode';

export function getConfiguredSpecUrls(): Array<{ name: string; url: string }> {
    const config = vscode.workspace.getConfiguration('callsign');
    return config.get<Array<{ name: string; url: string }>>('specUrls') ?? [];
}
