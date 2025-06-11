export interface CodeGenConfig {
    generator: 'openapi-typescript-codegen' | '@openapitools/openapi-generator-cli';
    language: 'ts' | 'js';
    input: string;
    output: string;
    client: 'fetch' | 'xhr' | 'node' | 'axios';
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportSchemas?: boolean;
    exportModels?: boolean;
    exportServices?: boolean;
    indent?: string;
    postfixServices?: string;
    postfixModels?: string;
    request?: string;
    write?: boolean;
}

export interface CodeGenConfigLite {
    input: string;
    output: string;
    client: 'fetch' | 'xhr' | 'node' | 'axios';
}

export interface CodeGenResult {
    success: boolean;
    output?: string;
    error?: string;
    files?: string[];
    duration?: number;
}
