<template>
    <button
        class="btn"
        :class="[variantClass, { 'opacity-50 cursor-not-allowed': disabled }]"
        :disabled="disabled"
        @click="handleClick"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary', // 'primary' | 'secondary' | 'outlined'
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['click']);

function handleClick(e: MouseEvent) {
    if (!props.disabled) emit('click', e);
}

const variantClass =
    {
        primary: 'bg-vs-bbg text-vs-bfg hover:brightness-110',
        secondary: 'bg-vs-ibg text-vs-ifg hover:brightness-110',
        outlined: 'bg-transparent border border-vs-bfg text-vs-bfg hover:bg-vs-bbg hover:text-vs-bfg',
    }[props.variant] || '';
</script>

<style scoped>
.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
}
</style>
