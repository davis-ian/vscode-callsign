<template>
    <div class="h-full flex flex-col p-6">
        <div class="max-w-2xl mx-auto w-full space-y-6">
            <!-- Header -->
            <div class="border-b border-vs-border pb-4">
                <h1 class="text-2xl font-bold text-vs-fg">Code Generation Test</h1>
                <p class="text-sm text-gray-400 mt-2">Test openapi-codegen CLI commands</p>
            </div>

            <!-- Simple Form -->
            <div class="bg-vs-ibg border border-vs-border rounded-lg p-6">
                <form @submit.prevent="handleGenerate" class="space-y-4">
                    <!-- JSON URL Input -->
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            OpenAPI JSON URL
                            <span class="text-red-500">*</span>
                        </label>
                        <TextInput
                            v-model="jsonUrl"
                            placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
                            class="w-full"
                            :disabled="loading"
                        />
                        <p class="text-xs text-gray-400 mt-1">Try: https://petstore3.swagger.io/api/v3/openapi.json</p>
                    </div>

                    <!-- Output Directory -->
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            Output Directory
                            <span class="text-red-500">*</span>
                        </label>
                        <TextInput
                            v-model="outputDir"
                            placeholder="./src/generated-api"
                            class="w-full"
                            :disabled="loading"
                        />
                        <p class="text-xs text-gray-400 mt-1">Relative to your workspace root</p>
                    </div>

                    <!-- Client Type -->
                    <div>
                        <label class="block text-sm font-medium mb-2">HTTP Client</label>
                        <select
                            v-model="clientType"
                            class="w-full p-2 border rounded bg-vs-ibg border-vs-border text-vs-fg"
                            :disabled="loading"
                        >
                            <option value="fetch">Fetch API</option>
                            <option value="axios">Axios</option>
                            <option value="xhr">XMLHttpRequest</option>
                            <option value="node">Node.js</option>
                        </select>
                    </div>

                    <!-- Generator Type -->
                    <div>
                        <label class="block text-sm font-medium mb-2">Generator</label>
                        <select
                            v-model="generatorType"
                            class="w-full p-2 border rounded bg-vs-ibg border-vs-border text-vs-fg"
                            :disabled="loading"
                        >
                            <option value="openapi-typescript-codegen">openapi-typescript-codegen</option>
                        </select>
                    </div>

                    <!-- Generate Button -->
                    <Btn type="submit" :disabled="!canGenerate || loading" :block="true">
                        <span v-if="loading">Generating Code...</span>
                        <span v-else>Generate TypeScript Client</span>
                    </Btn>
                </form>
            </div>

            <!-- Command Preview -->
            <div v-if="commandPreview" class="bg-vs-pbg border border-vs-border rounded-lg p-4">
                <h3 class="text-sm font-medium mb-2">Command that will be executed:</h3>
                <code class="text-xs font-mono text-gray-300 break-all">
                    {{ commandPreview }}
                </code>
            </div>

            <!-- Results -->
            <div v-if="result" class="space-y-4">
                <!-- Success/Error Status -->
                <div class="flex items-center space-x-2">
                    <CheckCircle v-if="result.success" class="text-green-400" :size="20" />
                    <XCircle v-else class="text-red-400" :size="20" />
                    <span class="font-medium">
                        {{ result.success ? 'Generation completed!' : 'Generation failed' }}
                    </span>
                    <span v-if="result.duration" class="text-sm text-gray-400"> ({{ result.duration }}ms) </span>
                </div>

                <!-- Generated Files -->
                <div
                    v-if="result.success && result.files?.length"
                    class="bg-vs-ibg border border-vs-border rounded p-4"
                >
                    <h4 class="font-medium mb-2">Generated Files ({{ result.files.length }}):</h4>
                    <div class="max-h-40 overflow-y-auto space-y-1">
                        <div
                            v-for="file in result.files"
                            :key="file"
                            class="text-sm font-mono text-gray-300 bg-vs-pbg px-2 py-1 rounded"
                        >
                            {{ file }}
                        </div>
                    </div>
                    <div class="mt-3 flex gap-2">
                        <Btn @click="openOutputFolder" variant="outlined" size="sm">
                            <FolderOpen :size="16" class="mr-1" />
                            Open Folder
                        </Btn>
                    </div>
                </div>

                <!-- Command Output -->
                <div v-if="result.output || result.error" class="bg-vs-pbg border border-vs-border rounded p-4">
                    <h4 class="font-medium mb-2">
                        {{ result.error ? 'Error Output:' : 'Command Output:' }}
                    </h4>
                    <pre class="text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">{{
                        result.output || result.error
                    }}</pre>
                </div>
            </div>

            <!-- Debug Info -->
            <details v-if="debugInfo" class="bg-vs-pbg border border-vs-border rounded">
                <summary class="p-3 cursor-pointer hover:bg-vs-hover">
                    <span class="font-medium">Debug Information</span>
                </summary>
                <div class="p-4 border-t border-vs-border">
                    <pre class="text-xs font-mono text-gray-300 whitespace-pre-wrap">{{ debugInfo }}</pre>
                </div>
            </details>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TextInput from '../Common/TextInput.vue';
import Btn from '../Common/Btn.vue';
import { extensionBridge } from '@/services/ExtensionBridge';

const jsonUrl = ref('https://petstore3.swagger.io/api/v3/openapi.json');
const outputDir = ref('./src/generated-api');
const clientType = ref<'fetch' | 'xhr' | 'node' | 'axios'>('fetch');
const generatorType = ref<'openapi-typescript-codegen' | '@openapitools/openapi-generator-cli'>(
    'openapi-typescript-codegen',
);
const loading = ref(false);

import { CheckCircle, FolderOpen, XCircle } from 'lucide-vue-next';
import { vsLog } from '@/utilities/extensionLogger';

const result = ref<any>(null);
const debugInfo = ref('');

const canGenerate = computed(() => {
    return jsonUrl.value.trim() && outputDir.value.trim();
});

const commandPreview = computed(() => {
    if (!canGenerate.value) return '';

    if (generatorType.value === 'openapi-typescript-codegen') {
        return `npx ${generatorType.value} --input "${jsonUrl.value}" --output "${outputDir.value}" --client ${clientType.value}`;
    }

    return `npx ${generatorType.value} generate -g javascript -i ${jsonUrl.value} -o ${outputDir.value}`;
});

// Watch for changes to show command preview
watch([jsonUrl, outputDir, clientType], () => {
    result.value = null; // Clear previous results when inputs change
});

async function handleGenerate() {
    if (!canGenerate.value) return;

    loading.value = true;
    result.value = null;
    debugInfo.value = '';

    try {
        vsLog('Starting code generation...');
        debugInfo.value = `Starting generation at ${new Date().toISOString()}\n`;
        debugInfo.value += `URL: ${jsonUrl.value}\n`;
        debugInfo.value += `Output: ${outputDir.value}\n`;
        debugInfo.value += `Client: ${clientType.value}\n\n`;

        // Call the extension
        const response = await extensionBridge.generateCode({
            generator: generatorType.value,
            language: generatorType.value === 'openapi-typescript-codegen' ? 'ts' : 'js',
            input: jsonUrl.value,
            output: outputDir.value,
            client: clientType.value,
        });

        // result.value = response;
        debugInfo.value += `Response received:\n${JSON.stringify(response, null, 2)}`;
    } catch (error) {
        console.error('Generation failed:', error);
        result.value = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
        debugInfo.value += `Error: ${error}\n`;
    } finally {
        loading.value = false;
    }
}

async function openOutputFolder() {
    try {
        await extensionBridge.openInFileManager(outputDir.value);
    } catch (error) {
        console.error('Failed to open folder:', error);
    }
}
</script>

<style scoped></style>
