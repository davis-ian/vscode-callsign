<template>
    <label class="flex flex-col gap-1 text-sm font-medium text-white/90">
        <span v-if="label">{{ label }}</span>
        <input
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            class="bg-vs-pbg border text-vs-efg rounded px-3 py-2 text-sm placeholder:text-vs-tfg/40 focus:outline-none focus:ring-2 focus:ring-vs-bbg"
        />
    </label>
</template>

<script setup lang="ts">
defineProps<{
    label?: string;
    modelValue: string;
    placeholder?: string;
    type?: string;
}>();

defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script>
