<template>
    <Teleport to="body">
        <transition name="fade">
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                @keydown.esc="$emit('update:modelValue')"
                @click.self="emit('update:modelValue', false)"
            >
                <!-- <div
                    class="bg-vs-ibg border border-vs-border rounded shadow-lg w-full max-w-md p-4 relative"
                    @click.stop
                >
                    <button
                        @click="$emit('close')"
                        class="absolute top-2 right-2 text-gray-400 hover:text-white text-sm"
                    >
                        ×
                    </button>
                    <h2 v-if="title" class="text-lg font-bold mb-4 text-vs-fg">{{ title }}</h2>
                    <slot />
                </div> -->
                <slot></slot>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
    modelValue: boolean;
    title?: string;
}>();

const emit = defineEmits(['update:modelValue']);

function handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        emit('update:modelValue', false);
    }
}

watch(
    () => props.modelValue,
    v => {
        if (v) window.addEventListener('keydown', handleEscape);
        else window.removeEventListener('keydown', handleEscape);
    },
);

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
