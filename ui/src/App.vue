<template>
    <CallsignView />
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import CallsignView from './components/layout/CallsignView.vue';
import { useVscode } from './composables/useVscode';

const vscode = useVscode();

function loadJsonFromUrl() {
    console.log('Loading JSON from remote URL...');

    vscode.postMessage({
        command: 'loadJson',
        type: 'url',
        url: 'https://api-develop.memoryshare.com/internal/swagger.json',
    });
}

const fullSpec = ref<Record<string, any> | null>(null);
provide('openApiSpec', fullSpec);

onMounted(() => {
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'showJson') {
            fullSpec.value = message.json;
        }
    });

    loadJsonFromUrl();
});
</script>

<style scoped></style>
