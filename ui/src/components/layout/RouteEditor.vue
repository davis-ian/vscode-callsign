<template>
    <div>
        <p v-if="selectedRoute">{{ selectedRoute }}</p>

        <div v-if="selectedRoute" class="border-t border-vs-border p-3">
            <p class="mb-4" v-if="selectedRoute.details?.description">{{ selectedRoute.details.description }}</p>

            <Btn @click="toggleEditing">{{ editing ? 'Cancel' : 'Try it out' }}</Btn>

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
                <div v-if="editing && response">
                    <p class="text-xl">Status: {{ responseCode }}</p>
                    <p>Response Body</p>
                    <pre
                        class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs max-h-100 border my-4"
                    ><code>{{ response }}</code></pre>
                </div>
                <Btn v-if="editing" @click="sendRequest">Send</Btn>
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
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import TextInput from '@/components/TextInput.vue';
import Btn from '@/components/Btn.vue';

import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
const selectedRoute = useSelectedRoute();

const editing = ref(false);
function toggleEditing() {
    editing.value = !editing.value;
}

const paramInputs = ref<Record<string, string>>({});
const openApiSpec = inject<Record<string, any> | null>('openApiSpec');
const components = computed(() => openApiSpec?.value?.components?.schemas || {});

const hasBody = computed(() => selectedRoute?.value?.details?.requestBody?.content?.['application/json']);
const bodyInput = ref('');

const response = ref('');
const responseCode = ref<Number | null>(null);
async function sendRequest() {
    const path = selectedRoute.value.replace(
        /{(.*?)}/g,
        (_: any, name: string | number) => paramInputs.value[name] || `{${name}}`,
    );
    const url = `https://api-develop.memoryshare.com${path}`;

    const init: RequestInit = {
        method: selectedRoute.value?.method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
    };

    if (hasBody.value && bodyInput.value.trim()) {
        try {
            init.body = JSON.stringify(JSON.parse(bodyInput.value));
        } catch {
            response.value = '❌ Invalid JSON body';
            return;
        }
    }

    try {
        const res = await fetch(url, init);
        let data;
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            data = await res.json();
            response.value = JSON.stringify(data, null, 2);
            responseCode.value = res.status;
        } else {
            data = await res.text();
            response.value = data;
        }

        console.log(data, 'parsed response');
    } catch (err: any) {
        response.value = `❌ Error: ${err.message}`;
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
