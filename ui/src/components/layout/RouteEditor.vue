<template>
    <div>
        <div v-if="selectedRoute">
            <Btn @click="toggleEditing" class="mb-6">{{ editing ? 'Cancel' : 'Try it out' }}</Btn>
            <p class="mb-4 font-bold text-xl" v-if="selectedRoute.details?.description">{{ selectedRoute.path }}</p>
            <p class="mb-4" v-if="selectedRoute.details?.description">{{ selectedRoute.details.description }}</p>

            <div v-if="editing" class="my-4 p-4 border border-vs-border rounded">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Authentication:</label>
                    <select
                        v-model="selectedAuthId"
                        @change="updateAuthPreview"
                        class="w-full p-2 border rounded bg-vs-ibg border-vs-border text-vs-fg"
                    >
                        <option value="">No Authentication</option>
                        <option v-for="auth in availableAuth" :key="auth.id" :value="auth.id">
                            {{ auth.displayName }}
                        </option>
                    </select>

                    <div v-if="authPreview" class="mt-2 p-2 bg-vs-pbg rounded text-xs">
                        <code>{{ authPreview.key }}: {{ authPreview.value.substring(0, 30) }}...</code>
                    </div>
                </div>
            </div>

            <div class="my-6">
                <div class="my-4">
                    <p class="text-xl">Params</p>
                    <div class="border-t"></div>
                </div>
                <div class="my-2 flex" v-for="param in selectedRoute.details?.parameters">
                    <div class="mr-4">
                        <p class="text-xs">
                            <span
                                class="bg-gray-800 text-gray-200 rounded px-1 py-0.5 text-[10px] uppercase tracking-wider"
                            >
                                {{ param?.schema?.type }}
                            </span>
                            <span v-if="param?.schema?.format">({{ param.schema.format }})</span>
                        </p>
                        <p class="font-bold">
                            <span v-if="param.required" class="text-red-500">*</span>{{ param.name }}
                        </p>
                    </div>

                    <TextInput v-model="paramInputs[param.name]" />
                </div>
                <div v-if="editing && responseCode">
                    <p class="text-xl">Status: {{ responseCode }}</p>
                    <p>Response Body</p>
                    <pre
                        class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs max-h-100 border my-4"
                    ><code>{{ response }}</code></pre>
                </div>
                <Btn v-if="editing" @click="initSendRequest">Send</Btn>
            </div>

            <div v-if="selectedRoute.details.requestBody">
                <div class="my-4">
                    <p class="text-xl">Request Body</p>
                    <div class="border-t"></div>
                </div>
                <pre
                    class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs"
                ><code>{{ JSON.stringify(requestBodyExample, null, 2) }}</code></pre>
                <textarea
                    v-model="bodyInput"
                    class="w-full p-2 border rounded bg-vs-ibg border-vs-border font-mono text-sm"
                    rows="6"
                ></textarea>
                <p class="text-xs italic mt-2 text-gray-400" v-if="schemaRef">Schema: {{ schemaRef }}</p>
            </div>

            <div class="my-6">
                <div class="my-4">
                    <p class="text-xl">Responses</p>
                    <div class="border-t"></div>
                </div>
                <div class="my-2" v-for="(resp, code) in selectedRoute.details?.responses">
                    <p>{{ code }} - {{ resp?.description }}</p>
                </div>
            </div>

            <div v-if="editing" class="mt-4">
                <h3 class="text-sm font-bold mb-2">Recent Requests</h3>
                <ul class="text-xs text-gray-400 space-y-1">
                    <li v-for="snap in requestHistory" :key="snap.id">
                        {{ snap.method.toUpperCase() }} {{ snap.path }} — {{ snap.status }}
                        <span class="opacity-60">({{ new Date(snap.timestamp).toLocaleTimeString() }})</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue';
import TextInput from '@/components/TextInput.vue';
import Btn from '@/components/Btn.vue';
import { extensionBridge } from '@/services/ExtensionBridge';

import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
import type { AuthHeader, AuthMethod } from '@/types';
const selectedRoute = useSelectedRoute();

import { sendRequest } from '@/services/RequestService';
import { useRequestHistory } from '@/composables/useRequestHistory';

onMounted(async () => {
    try {
        availableAuth.value = await extensionBridge.getAvailableAuthMethods();
        console.log('available auth mounted', availableAuth);
    } catch (err) {
        console.error('Failed to load auth methods:', err);
    }
});

const updateAuthPreview = async () => {
    if (!selectedAuthId.value) {
        authPreview.value = null;
        return;
    }

    try {
        authPreview.value = await extensionBridge.getAuthHeader(selectedAuthId.value);
    } catch (err) {
        console.error('Failed to get auth header:', err);
        authPreview.value = null;
    }
};

const editing = ref(false);
function toggleEditing() {
    editing.value = !editing.value;
}

watch(editing, (newVal: boolean, _oldVal: boolean) => {
    console.log(newVal, 'editing watcher');
    console.log(availableAuth, 'available auth');
});

const paramInputs = ref<Record<string, string>>({});
const openApiSpec = inject<Record<string, any> | null>('openApiSpec');
const components = computed(() => openApiSpec?.value?.components?.schemas || {});

const selectedAuthId = ref<string>('');
const availableAuth = ref<AuthMethod[]>([]);
const authPreview = ref<AuthHeader | null>(null);

const bodyInput = ref('');

const response = ref<string>('');
const responseCode = ref<number | null>(null);

const { addSnapshot, requestHistory } = useRequestHistory();

async function initSendRequest() {
    if (!selectedRoute.value) return;

    console.log(selectedRoute.value, 'initing request');
    try {
        const result = await sendRequest(selectedRoute.value, paramInputs.value, selectedAuthId.value, bodyInput.value);

        console.log(result, 'request result');
        responseCode.value = result.status;
        response.value = typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body;

        addSnapshot({
            id: crypto.randomUUID?.() || Date.now().toString(),
            timestamp: new Date().toISOString(),
            method: selectedRoute.value.method,
            path: selectedRoute.value.path,
            status: result.status,
            requestBody: bodyInput.value,
            responseBody: result.body,
        });
    } catch (err: any) {
        console.log(err, 'request error');
        response.value = err.message;
        responseCode.value = null;
    }
}

const requestBodyExample = computed(() => {
    const schema = selectedRoute.value?.details?.requestBody?.content?.['application/json']?.schema;
    return generateExample(schema, components);
});

const schemaRef = computed(() => {
    return selectedRoute.value?.details?.requestBody?.content?.['application/json']?.schema?.items?.$ref;
});

function generateExample(schema: any, components: any): any {
    if (!schema) return {};

    if (schema.$ref) {
        const resolved = resolveRef(schema.$ref, components);
        return generateExample(resolved, components);
    }

    if (schema.type === 'array') {
        return [generateExample(schema.items, components)];
    }

    if (schema.type === 'object' && schema.properties) {
        const obj: Record<string, any> = {};
        for (const [key, value] of Object.entries(schema.properties)) {
            obj[key] = generateExample(value, components);
        }
        return obj;
    }

    // Fallback for common types
    switch (schema.type) {
        case 'string':
            return 'string';
        case 'integer':
            return 0;
        case 'number':
            return 0.0;
        case 'boolean':
            return false;
        default:
            return null;
    }
}

function resolveRef(ref: string, components: any): any {
    const parts = ref.split('/');
    const name = parts.pop();

    if (name) {
        return components?.value[name];
    }

    return null;
}
</script>

<style scoped></style>
