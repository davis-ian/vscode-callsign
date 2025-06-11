<template>
    <div class="h-full flex flex-col p-6 overflow-y-auto">
        <div class="max-w-4xl mx-auto w-full space-y-6">
            <!-- Header -->
            <div class="border-b border-vs-border pb-4">
                <h1 class="text-2xl font-bold text-vs-fg">Code Generation</h1>
                <p class="text-sm text-gray-400 mt-2">
                    Generate TypeScript client code from your OpenAPI specification
                </p>
            </div>

            <!-- Settings Form -->
            <CodeGenSettings v-model="codeGenConfig" :loading="generating" @generate="handleGenerate" />

            <!-- Output Preview -->
            <CodeGenOutput v-if="generationResult" :result="generationResult" :config="codeGenConfig" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CodeGenSettings from '@/components/CodeGen/CodeGenSettings.vue';
import CodeGenOutput from '@/components/CodeGen/CodeGenOutput.vue';
import { extensionBridge } from '@/services/ExtensionBridge';
import type { CodeGenConfig, CodeGenResult } from '@/types';

const generating = ref(false);
const codeGenConfig = ref<CodeGenConfig>({
    generator: '@openapitools/openapi-generator-cli',
    language: 'js',
    input: '',
    output: './src/api',
    client: 'fetch',
    useOptions: true,
    useUnionTypes: false,
    exportCore: true,
    exportSchemas: true,
    exportModels: true,
    exportServices: true,
    indent: '2',
    postfixServices: 'Service',
    postfixModels: '',
    request: './core/request',
    write: true,
});

const generationResult = ref<CodeGenResult | null>(null);

async function handleGenerate(config: CodeGenConfig) {
    generating.value = true;
    generationResult.value = null;

    try {
        const result = await extensionBridge.generateCode(config);
        generationResult.value = result;
    } catch (error) {
        console.error('Code generation failed:', error);
        // Handle error - could show notification
    } finally {
        generating.value = false;
    }
}
</script>
