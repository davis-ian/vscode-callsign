<template>
    <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-vs-ebg bg-opacity-50 backdrop-blur-sm"
    >
        <div class="flex flex-col items-center space-y-4">
            <!-- Circular Loader -->
            <div class="relative">
                <div class="w-16 h-16 border-4 border-vs-bfg border-t-vs-bbg rounded-full animate-spin"></div>
            </div>

            <!-- Optional Loading Text -->
            <div v-if="message" class="text-white text-lg font-medium">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isVisible?: boolean;
    message?: string;
}

withDefaults(defineProps<Props>(), {
    isVisible: true,
    message: '',
});
</script>

<style scoped>
/* Additional custom animation if needed */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
