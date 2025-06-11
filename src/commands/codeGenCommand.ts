import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { CodeGenConfig, CodeGenResult } from '../types';

export async function generateCode(config: CodeGenConfig): Promise<CodeGenResult> {
    if (config.generator === '@openapitools/openapi-generator-cli') {
        // Check Docker before proceeding
        const dockerAvailable = await checkDocker();
        if (!dockerAvailable) {
            const installDocker = await vscode.window.showErrorMessage(
                'Docker is required for OpenAPI Generator but not found. Please install Docker and try again.',
                'Learn More',
                'Cancel',
            );

            if (installDocker === 'Learn More') {
                vscode.env.openExternal(vscode.Uri.parse('https://docs.docker.com/get-docker/'));
            }

            throw new Error('Docker is required but not available');
        }

        return generateWithOpenApiGeneratorCli(config);
    }
    return generateWithTypescriptCodegen(config);
}

async function generateWithTypescriptCodegen(config: CodeGenConfig): Promise<CodeGenResult> {
    console.log('generating  w/ typescript');
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        throw new Error('No workspace folder found');
    }

    await ensureCodeGenInstalled(workspaceRoot, config.generator);

    const args = buildCodeGenArgs(config);

    return executeCodeGen(workspaceRoot, args, config);
}

async function generateWithOpenApiGeneratorCli(config: CodeGenConfig): Promise<CodeGenResult> {
    console.log('generating with OpenAPI Generator CLI (Docker mode)');
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        throw new Error('No workspace folder found');
    }

    // Check if Docker is installed
    const dockerAvailable = await checkDocker();
    if (!dockerAvailable) {
        throw new Error('Docker is required but not available. Please install Docker and try again.');
    }

    await ensureCodeGenInstalled(workspaceRoot, config.generator);

    // Setup OpenAPI generator config with Docker mode
    setupOpenApiGeneratorConfig(workspaceRoot);

    const isUrl = config.input.startsWith('http://') || config.input.startsWith('https://');

    const inputSpec = isUrl
        ? config.input
        : path.isAbsolute(config.input)
        ? config.input
        : path.resolve(workspaceRoot, config.input);

    const absoluteOutputPath = path.isAbsolute(config.output)
        ? config.output
        : path.resolve(workspaceRoot, config.output);

    // Make sure output directory exists
    if (!fs.existsSync(absoluteOutputPath)) {
        fs.mkdirSync(absoluteOutputPath, { recursive: true });
    }

    const generatorName = config.language === 'ts' ? 'typescript-fetch' : 'javascript';
    // We need to skip the Docker volume mapping for URLs
    if (isUrl) {
        // Use direct Docker approach for URLs
        return generateWithDockerDirectly(config, workspaceRoot, inputSpec, absoluteOutputPath, generatorName);
    } else {
        // For local files, use the npx approach
        const args = [
            '@openapitools/openapi-generator-cli',
            'generate',
            '-g',
            generatorName,
            '-i',
            inputSpec,
            '-o',
            absoluteOutputPath,
        ];

        return executeCodeGen(workspaceRoot, args, config);
    }
}

async function generateWithDockerDirectly(
    config: CodeGenConfig,
    workspaceRoot: string,
    inputSpec: string,
    outputPath: string,
    generatorName: string,
): Promise<CodeGenResult> {
    const startTime = Date.now();

    console.log('Using direct Docker command for URL input');

    // For URLs, we don't need to map the input as a volume
    const dockerArgs = [
        'run',
        '--rm',
        '-v',
        `${outputPath}:/output`,
        'openapitools/openapi-generator-cli:latest',
        'generate',
        '-i',
        inputSpec, // Use URL directly
        '-o',
        '/output',
        '-g',
        generatorName,
    ];

    console.log('Docker command:', 'docker', dockerArgs.join(' '));

    return new Promise(resolve => {
        const child = spawn('docker', dockerArgs, {
            cwd: workspaceRoot,
            shell: true,
        });

        let output = '';
        let error = '';

        child.stdout?.on('data', data => {
            const dataStr = data.toString();
            output += dataStr;
            console.log('DOCKER STDOUT:', dataStr);
        });

        child.stderr?.on('data', data => {
            const dataStr = data.toString();
            error += dataStr;
            console.error('DOCKER STDERR:', dataStr);
        });

        child.on('close', code => {
            const duration = Date.now() - startTime;
            const success = code === 0;

            console.log('Docker command completed with code:', code);

            // Check if files were generated
            let files: string[] = [];
            if (success) {
                files = getGeneratedFiles(workspaceRoot, config.output);
                console.log('Generated files:', files.length > 0 ? 'Yes' : 'No');
            }

            resolve({
                success,
                output: output || undefined,
                error: error || undefined,
                files,
                duration,
            });
        });

        child.on('error', err => {
            console.error('DOCKER SPAWN ERROR:', err);
            resolve({
                success: false,
                error: `Docker command execution error: ${err.message}`,
                duration: Date.now() - startTime,
            });
        });
    });
}

function setupOpenApiGeneratorConfig(workspaceRoot: string): string {
    const configPath = path.join(workspaceRoot, 'openapitools.json');

    const config = {
        $schema: './node_modules/@openapitools/openapi-generator-cli/config.schema.json',
        spaces: 2,
        'generator-cli': {
            version: '7.0.1',
            useDocker: true, // Enable Docker mode
            dockerImageName: 'openapitools/openapi-generator-cli',
        },
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return configPath;
}

async function checkDocker(): Promise<boolean> {
    return new Promise(resolve => {
        const child = spawn('docker', ['--version'], {
            shell: true,
        });

        child.on('close', code => {
            resolve(code === 0);
        });
    });
}

async function ensureCodeGenInstalled(workspaceRoot: string, generator: string): Promise<void> {
    const packageJsonPath = path.join(workspaceRoot, 'package.json');

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        const pkgName =
            generator === '@openapitools/openapi-generator-cli'
                ? '@openapitools/openapi-generator-cli'
                : 'openapi-typescript-codegen';

        console.log('ensuring installed', generator);
        const hasCodeGen = packageJson.devDependencies?.[pkgName] || packageJson.dependencies?.[pkgName];
        console.log('has code  gen', hasCodeGen);

        if (!hasCodeGen) {
            const install = await vscode.window.showInformationMessage(
                `${pkgName} is not installed. Install it?`,
                'Install',
                'Cancel',
            );

            if (install === 'Install') {
                await installCodeGen(workspaceRoot, generator);
            } else {
                throw new Error(`${pkgName} is required`);
            }
        }
    } catch (error) {
        throw new Error('Could not check package.json. Make sure you have a Node.js project');
    }
}

function buildCodeGenArgs(config: CodeGenConfig): string[] {
    const args = ['openapi-typescript-codegen'];

    // Input
    if (config.input) {
        args.push('--input', config.input);
    }

    // Output
    args.push('--output', config.output);

    // Client
    args.push('--client', config.client);

    // Boolean flags
    if (config.useOptions) {
        args.push('--useOptions');
    }
    if (config.useUnionTypes) {
        args.push('--useUnionTypes');
    }
    if (config.exportCore) {
        args.push('--exportCore');
    }
    if (config.exportSchemas) {
        args.push('--exportSchemas');
    }
    if (config.exportModels) {
        args.push('--exportModels');
    }
    if (config.exportServices) {
        args.push('--exportServices');
    }

    // Postfix options
    if (config.postfixServices) {
        args.push('--postfixServices', config.postfixServices);
    }
    if (config.postfixModels) {
        args.push('--postfixModels', config.postfixModels);
    }

    // Indent
    if (config.indent) {
        args.push('--indent', config.indent);
    }

    return args;
}

async function executeCodeGen(workspaceRoot: string, args: string[], config: CodeGenConfig): Promise<CodeGenResult> {
    return new Promise(resolve => {
        const startTime = Date.now();

        console.log(args, 'cmd args');

        // Use npx to run the command
        const child = spawn('npx', args, {
            cwd: workspaceRoot,
            shell: true,
        });

        let output = '';
        let error = '';

        child.stdout?.on('data', data => {
            output += data.toString();
        });

        child.stderr?.on('data', data => {
            error += data.toString();
        });

        child.on('close', code => {
            const duration = Date.now() - startTime;
            const success = code === 0;

            let files: string[] = [];
            if (success) {
                files = getGeneratedFiles(workspaceRoot, config.output);
            }

            resolve({
                success,
                output: output || undefined,
                error: error || undefined,
                files,
                duration,
            });
        });

        child.on('error', err => {
            resolve({
                success: false,
                error: err.message,
                duration: Date.now() - startTime,
            });
        });
    });
}

function getGeneratedFiles(workspaceRoot: string, outputDir: string): string[] {
    const fullOutputPath = path.resolve(workspaceRoot, outputDir);
    const files: string[] = [];

    try {
        function scanDir(dir: string, prefix = '') {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const relativePath = path.join(prefix, item);

                if (fs.statSync(fullPath).isDirectory()) {
                    scanDir(fullPath, relativePath);
                } else {
                    files.push(relativePath);
                }
            }
        }

        scanDir(fullOutputPath);
    } catch (error) {
        console.error('failed to scan generated files: ', error);
    }

    return files;
}

async function installCodeGen(workspaceRoot: string, generator: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const pkg = resolvePackageName(generator);

        const command = 'npm install --save-dev ' + pkg + ' -D';
        console.log('INSTALLING  CODEGEN: ', command);
        const child = spawn('npm', ['install', '--save-dev', pkg], {
            cwd: workspaceRoot,
            shell: true,
        });

        child.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Failed to install ${pkg}`));
            }
        });
    });
}

function resolvePackageName(generator: string): string {
    return generator.includes('@openapitools/openapi-generator-cli')
        ? '@openapitools/openapi-generator-cli'
        : 'openapi-typescript-codegen';
}

export async function selectFile(options?: { filters?: Record<string, string[]> }): Promise<string | null> {
    const result = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: options?.filters,
    });

    return result?.[0]?.fsPath || null;
}

export async function selectDirectory(): Promise<string | null> {
    const result = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
    });

    return result?.[0]?.fsPath || null;
}

export async function openInFileManager(pathToOpen: string): Promise<void> {
    const uri = vscode.Uri.file(pathToOpen);
    await vscode.commands.executeCommand('revealFileInOS', uri);
}
