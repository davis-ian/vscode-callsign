<template>
    <div class="container">
        <h1>Callsign 🛰️</h1>
        <button @click="loadJson">Load OpenAPI JSON</button>
        <div id="output">
            <pre v-if="!paths">{"waiting": true}</pre>
            <div v-else>
                <div v-for="(methods, route) in paths" :key="route" class="route-block">
                    <div v-for="(details, method) in methods" :key="method" class="route-line">
                        <code
                            ><strong>{{ method.toUpperCase() }}</strong> <span>{{ route }}</span> —
                            {{ details.summary || '' }}</code
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const paths = ref<Record<string, Record<string, { summary?: string }>> | null>(null);

const vscode = (window as any).acquireVsCodeApi();

function loadJson() {
    console.log('Load Json CLICKED');
    vscode.postMessage({ command: 'loadJson' });
}

onMounted(() => {
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'showJson') {
            paths.value = message.json.paths || {};
        }
    });
});
</script>

<style scoped>
.container {
    font-family: sans-serif;
    padding: 1rem;
    background: #1e1e1e;
    color: white;
}

button {
    background: #007acc;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    margin-bottom: 1rem;
    cursor: pointer;
}

pre {
    background: #2d2d2d;
    padding: 1rem;
    overflow: auto;
}

.route-line {
    margin-bottom: 0.5rem;
}
</style>
