import type { Component } from 'vue';

export type GroupedRoutes = {
    tag: string;
    routes: Record<
        string, // the route path
        Record<
            OpenApiRoute['method'], // the HTTP method
            Omit<OpenApiRoute, 'route' | 'method'>['details'] // the route details
        >
    >;
};

export interface AuthCredential {
    id: string;
    name: string;
    type: 'bearer' | 'api-key' | 'basic';
    headerName?: string;
    description?: string;
    createdAt: Date;
    lastUsed?: Date;
}

export interface StoredAuth {
    credential: AuthCredential;
    value: string;
}

export interface AuthHeader {
    key: string;
    value: string;
}

export interface AuthMethod {
    id: string;
    name: string;
    type: string;
    displayName: string;
}

export interface ApiResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    timestamp: string;
}

export interface ApiEndpoint {
    url: string;
    method: string;
}

export interface OpenApiSpec {
    openapi: string;
    info: any;
    paths: Record<string, any>;
    components?: any;
}

export interface LoadJsonOptions {
    type: 'file' | 'url' | 'default';
    content?: string;
    url?: string;
}

// --- Common Types ---
export interface ParameterObject {
    name: string;
    in?: 'query' | 'header' | 'path' | 'cookie';
    required?: boolean;
    schema?: SchemaObject;
}

export interface SchemaObject {
    type?: string;
    format?: string;
    properties?: Record<string, SchemaObject>;
    items?: SchemaObject;
    $ref?: string;
}

export interface RequestBodyObject {
    content: {
        'application/json': {
            schema: SchemaObject;
        };
    };
}

export interface ResponseObject {
    description: string;
}

// --- Route Type ---
export interface OpenApiRoute {
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace';
    path: string;
    details: {
        description?: string;
        parameters?: ParameterObject[];
        requestBody?: RequestBodyObject;
        responses: Record<string, ResponseObject>;
        summary: string;
    };
}

export interface RequestSnapshot {
    id: string;
    timestamp: string;
    method: string;
    path: string;
    status: number;
    requestBody?: any;
    responseBody?: any;
    queryParams?: Record<string, string>;
    fullUrl: string;
    route: OpenApiRoute;
}

export interface NavEntry {
    label: string;
    icon: Component;
    to: string;
}

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
