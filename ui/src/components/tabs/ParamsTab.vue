<template>
    <div>
        <div class="my-2 flex" v-for="param in route?.details?.parameters">
            <div class="mr-4">
                <p class="text-xs">
                    <span class="bg-vs-bbg text-vs-bfg rounded px-1 py-0.5 text-[10px] uppercase tracking-wider">
                        {{ param?.schema?.type }}
                    </span>
                    <span class="ml-2" v-if="param?.schema?.format">({{ param.schema.format }})</span>
                </p>
                <p><span v-if="param.required" class="text-red-500">*</span>{{ param.name }}</p>
            </div>

            <TextInput
                class="flex-grow"
                :model-value="modelValue[param.name] || ''"
                @update:model-value="updateParam(param.name, $event)"
                :placeholder="getParamPlaceholder(param)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { OpenApiRoute } from '@/types';
import TextInput from '../Common/TextInput.vue';
const props = defineProps<{
    route: OpenApiRoute | null;
    modelValue: Record<string, string>;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: Record<string, string>];
}>();

function updateParam(name: string, value: string) {
    const newParams = {
        ...props.modelValue,
        [name]: value,
    };
    emit('update:modelValue', newParams);
}

function getParamPlaceholder(param: any) {
    if (param.example) return param.example;
    if (param.schema?.example) return param.schema.example;
    return `Enter ${param.name}`;
}
</script>

<style scoped></style>
