<template>
    <div>
        <div class="my-4">
            <p class="text-xl">Params</p>
            <div class="border-t"></div>
        </div>
        <div class="my-2 flex" v-for="param in route?.details?.parameters">
            <div class="mr-4">
                <p class="text-xs">
                    <span class="bg-gray-800 text-gray-200 rounded px-1 py-0.5 text-[10px] uppercase tracking-wider">
                        {{ param?.schema?.type }}
                    </span>
                    <span v-if="param?.schema?.format">({{ param.schema.format }})</span>
                </p>
                <p class="font-bold"><span v-if="param.required" class="text-red-500">*</span>{{ param.name }}</p>
            </div>

            <TextInput
                :model-value="modelValue[param.name] || ''"
                @update:model-value="updateParam(param.name, $event)"
                :placeholder="getParamPlaceholder(param)"
                :disabled="!editing"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { OpenApiRoute } from '@/types';
import { computed } from 'vue';
import TextInput from '../TextInput.vue';
const props = defineProps<{
    route: OpenApiRoute | null;
    editing: boolean;
    modelValue: Record<string, string>;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: Record<string, string>];
}>();

const parameters = computed(() => {
    props.route?.details?.parameters || [];
});

function updateParam(name: string, value: string) {
    console.log('update param', name, value);
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
