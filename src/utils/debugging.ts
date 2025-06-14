import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { OpenApiSpec } from '../types';
import { logInfo } from '../core/logger';

export function dumpSpecToDisk(spec: OpenApiSpec, context: vscode.ExtensionContext) {
    const outPath = path.join(context.extensionPath, 'callsign-debug.json');
    fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
    logInfo('Full spec written to:', outPath);
}
