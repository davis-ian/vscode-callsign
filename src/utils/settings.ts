import * as vscode from 'vscode';

export function getConfiguredSpecUrls(): Array<string> {
    const config = vscode.workspace.getConfiguration('callsign');
    return config.get<Array<string>>('specUrls') ?? [];
}
