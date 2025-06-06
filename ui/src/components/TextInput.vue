<template>
    <label class="flex flex-col gap-1 text-sm font-medium text-white/90">
        <span v-if="label">{{ label }}</span>
        <input
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            class="bg-[#1e1e1e] border border-white/10 rounded px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
