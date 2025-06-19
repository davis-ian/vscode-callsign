<template>
    <div class="rounded border p-4 bg-vs-ibg text-vs-fg">
        <div class="mb-4">
            <p class="font-bold text-xl">{{ method.toUpperCase() }} {{ route }}</p>
            <p class="italic text-vs-tfg">{{ operation.summary }}</p>
        </div>

        <!-- Params -->
        <div v-if="operation.parameters?.length">
            <p class="text-lg font-semibold mb-2">Parameters</p>
            <div v-for="param in operation.parameters" :key="param.name" class="mb-2">
                <label class="block text-sm font-bold mb-1">
                    {{ param.name }} <span v-if="param.required" class="text-red-500">*</span>
                </label>
                <input
                    v-model="paramInputs[param.name]"
                    class="w-full p-2 border rounded bg-vs-ibg border-vs-border"
                    :placeholder="param.description"
                />
            </div>
        </div>

        <!-- Body -->
        <div v-if="hasBody" class="mt-4">
            <p class="text-lg font-semibold mb-2">Request Body (JSON)</p>
            <textarea
                v-model="bodyInput"
                class="w-full p-2 border rounded bg-vs-ibg border-vs-border font-mono text-sm"
                rows="6"
            ></textarea>
        </div>

        <!-- Send -->
        <div class="mt-4">
            <button @click="sendRequest" class="px-4 py-2 rounded bg-vs-bfg text-white">Send Request</button>
        </div>

        <!-- Response -->
        <div v-if="response" class="mt-4">
            <p class="text-lg font-semibold">Response</p>

            <CodeBlock :content="response" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { vsLog } from '@/utilities/extensionLogger';

import { ref, computed } from 'vue';
import CodeBlock from '../CodeBlock.vue';

const props = defineProps<{
    route: string;
    method: string;
    operation: any;
}>();

const paramInputs = ref<Record<string, string>>({});
const bodyInput = ref('');
const response = ref('');

const hasBody = computed(() => props.operation.requestBody?.content?.['application/json']);

async function sendRequest() {
    vsLog('Invalid request method used');
    // const path = props.route.replace(/{(.*?)}/g, (_, name) => paramInputs.value[name] || `{${name}}`);
    // const url = `https://api-develop.memoryshare.com${path}`;

    // const init: RequestInit = {
    //     method: props.method.toUpperCase(),
    //     headers: { 'Content-Type': 'application/json' },
    // };

    // if (hasBody.value && bodyInput.value.trim()) {
    //     try {
    //         init.body = JSON.stringify(JSON.parse(bodyInput.value));
    //     } catch {
    //         response.value = '❌ Invalid JSON body';
    //         return;
    //     }
    // }

    // try {
    //     const res = await fetch(url, init);
    //     const data = await res.json();
    //     response.value = JSON.stringify(data, null, 2);
    // } catch (err: any) {
    //     response.value = `❌ Error: ${err.message}`;
    // }
}
</script>

<style scoped></style>
