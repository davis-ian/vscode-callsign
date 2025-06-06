<template>
    <div class="rounded bg-vs-ibg border border-vs-border">
        <div @click="toggleExpand" class="p-3 cursor-pointer">
            <span class="font-bold text-vs-bfg mr-2">{{ props.method.toUpperCase() }}</span>
            <span class="text-vs-ifg">{{ props.route }}</span>
            —
            <span class="text-vs-tfg italic">{{ props.details?.summary }}</span>
        </div>

        <div v-if="expanded" class="border-t border-vs-border p-3">
            <p class="mb-4" v-if="details?.description">{{ props.details.description }}</p>

            <div class="my-6">
                <div class="my-4">
                    <p class="text-xl">Params</p>
                    <div class="border-t"></div>
                </div>
                <div class="my-2 flex" v-for="param in props.details?.parameters">
                    <div class="mr-4">
                        <p class="text-xs">{{ param?.schema?.type }}({{ param?.schema?.format }})</p>
                        <p class="font-bold">{{ param.required ? '*' : '' }}{{ param.name }}</p>
                    </div>

                    <TextInput v-model="paramsInput[param.name]" />
                </div>
            </div>
            <div class="my-4">
                <p class="text-xl">Request Body</p>
                <div class="border-t"></div>
            </div>
            <div v-if="details.requestBody">
                <pre
                    class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs"
                ><code>{{ JSON.stringify(requestBodyExample, null, 2) }}</code></pre>

                <p class="text-xs italic mt-2 text-gray-400" v-if="schemaRef">Schema: {{ schemaRef }}</p>
            </div>

            <div class="my-6">
                <div class="my-4">
                    <p class="text-xl">Responses</p>
                    <div class="border-t"></div>
                </div>
                <div class="my-2" v-for="(resp, code) in details?.responses">
                    <p>{{ code }} - {{ resp?.description }}</p>
                </div>
            </div>
            <!--
            <div class="mt-4">
                {{ details }}
            </div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject, computed, ref } from 'vue';
import TextInput from './TextInput.vue';

const paramsInput = ref<Record<string, string>>({});
const openApiSpec = inject<Record<string, any> | null>('openApiSpec');
const components = computed(() => openApiSpec?.value?.components?.schemas || {});

const props = defineProps({
    method: {
        type: String,
        default: '',
    },
    route: {
        type: String,
        default: '',
    },
    details: {
        type: Object,
        default: () => {},
    },
});

const expanded = ref(false);
function toggleExpand() {
    expanded.value = !expanded.value;

    if (expanded.value && props.details?.parameters) {
        for (const param of props.details.parameters) {
            if (!(param.name in paramsInput.value)) {
                paramsInput.value[param.name] = '';
            }
        }
    }
}

const requestBodyExample = computed(() => {
    const schema = props.details?.requestBody?.content?.['application/json']?.schema;
    return generateExample(schema, components);
});

const schemaRef = computed(() => {
    return props.details?.requestBody?.content?.['application/json']?.schema?.items?.$ref;
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

<style scoped>
pre code {
    background-color: transparent !important;
}
</style>
