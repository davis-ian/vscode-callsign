<template>
    <AppLayout />
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import AppLayout from './components/Layout/AppLayout.vue';
import { extensionBridge } from '@/services/ExtensionBridge';
import type { OpenApiSpec } from './types';

async function loadJsonFromUrl() {
    console.log('Loading JSON from remote URL...');

    try {
        const spec = await extensionBridge.loadJsonFromUrl('https://api-develop.memoryshare.com/internal/swagger.json');
        fullSpec.value = spec;
        console.log('JSON loaded successfully:', spec);
    } catch (error) {
        console.log('Failed to load JSON', error);
    }
}

const fullSpec = ref<OpenApiSpec | null>(null);
provide('openApiSpec', fullSpec);

onMounted(() => {
    loadJsonFromUrl();
});
</script>

<style>
#app {
    height: 100%;
}
</style>
