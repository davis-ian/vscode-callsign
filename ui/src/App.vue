<template>
    <div class="container">
        <h1 class="text-5xl">Callsign 🛰️</h1>

        <Btn class="my-4" @click="loadJsonFromUrl">Load OpenAPI JSON</Btn>

        <div class="my-4" id="output">
            <pre v-if="!paths">{"waiting": true}</pre>
            <div v-else>
                <RouteList :groups="groups" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import Btn from '@/components/Btn.vue';
import RouteList from './components/RouteList.vue';
import { type GroupedRoutes } from '@/types.ts';

const fullSpec = ref<Record<string, any> | null>(null);
const paths = ref<Record<string, Record<string, { summary?: string }>> | null>(null);
const groups = ref<GroupedRoutes[]>([]);

provide('openApiSpec', fullSpec);

function organizePathsByTag(rawPaths: Record<string, any>): GroupedRoutes[] {
    const groupsMap: Record<string, GroupedRoutes> = {};

    for (const [route, operations] of Object.entries(rawPaths)) {
        for (const method in operations) {
            const operation = operations[method];
            const tag = operation.tags?.[0] || 'Uncategorized';

            if (!groupsMap[tag]) {
                groupsMap[tag] = { tag, routes: {} };
            }

            const groupRoutes = groupsMap[tag].routes;

            if (!groupRoutes[route]) {
                groupRoutes[route] = {};
            }

            groupRoutes[route][method] = operation;
        }
    }
    return Object.values(groupsMap);
}

let vscode: any;

function loadJsonFromUrl() {
    console.log('Loading JSON from remote URL...');
    if (!vscode) {
        vscode = (window as any).acquireVsCodeApi();
    }

    vscode.postMessage({
        command: 'loadJson',
        type: 'url',
        url: 'https://api-develop.memoryshare.com/internal/swagger.json',
    });
}

onMounted(() => {
    if (!vscode) {
        vscode = (window as any).acquireVsCodeApi();
    }

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'showJson') {
            paths.value = message.json.paths || {};
            fullSpec.value = message.json;

            if (paths.value) {
                groups.value = organizePathsByTag(paths.value);
                console.log(groups.value, 'groups');
            }
        }
    });
});
</script>

<style scoped>
.container {
    padding: 1rem;
}
</style>
