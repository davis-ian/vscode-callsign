<template>
    <div>
        <div class="text-2xl">body</div>

        <div v-if="route?.details.requestBody">
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
    </div>
</template>

<script setup lang="ts">
import type { OpenApiRoute } from '@/types';
import { computed, inject, ref } from 'vue';

const openApiSpec = inject<Record<string, any> | null>('openApiSpec');
const components = computed(() => openApiSpec?.value?.components?.schemas || {});

const props = defineProps<{
    route: OpenApiRoute | null;
    editing: boolean;
    modelValue: string;
}>();

const emits = defineEmits<{
    'update:modelValue': string;
}>();

const bodyInput = ref('');

const requestBodyExample = computed(() => {
    const schema = props.route?.details?.requestBody?.content?.['application/json']?.schema;
    return generateExample(schema, components);
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

const schemaRef = computed(() => {
    return props.route?.details?.requestBody?.content?.['application/json']?.schema?.items?.$ref;
});
</script>

<style scoped></style>
