<template>
    <div class="container">
        <h1 class="text-5xl mb-6">Callsign 🛰️</h1>

        <!-- <Btn class="my-4" @click="loadJsonFromUrl">Load OpenAPI JSON</Btn> -->

        <input
            v-model="search"
            type="text"
            ref="searchInput"
            autofocus
            placeholder="Search routes..."
            class="w-full p-2 mb-4 rounded border border-vs-border bg-vs-ibg text-vs-fg"
        />
        <p class="text-sm italic mb-2">Showing {{ filteredRouteCount }} of {{ totalRouteCount }} routes</p>
        <div class="my-4" id="output">
            <pre v-if="!paths">{"waiting": true}</pre>
            <div v-else>
                <div class="flex items-center gap-2 mb-2">
                    <button @click="prevMatch" class="px-2 py-1 border rounded">↑ Prev</button>
                    <button @click="nextMatch" class="px-2 py-1 border rounded">↓ Next</button>
                    <span class="text-sm text-gray-400">
                        {{ currentMatchIndex + 1 }} / {{ matchedRoutes.length }}
                    </span>
                </div>
                <RouteList :groups="groups" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue';
import Btn from '@/components/Btn.vue';
import RouteList from './components/RouteList.vue';
import { type GroupedRoutes } from '@/types.ts';

const fullSpec = ref<Record<string, any> | null>(null);
const paths = ref<Record<string, Record<string, { summary?: string }>> | null>(null);
const search = ref('');

const totalRouteCount = computed(() => Object.keys(paths.value || {}).length);
const filteredRouteCount = computed(() => Object.keys(groups.value.flatMap(g => Object.keys(g.routes))).length);

const currentMatchIndex = ref(0);
const matchedRoutes = computed(() => {
    if (!search.value) return [];

    const term = search.value.toLowerCase();
    const matches: string[] = [];

    for (const [route] of Object.entries(paths.value || {})) {
        if (route.toLowerCase().includes(term)) {
            matches.push(route);
        }
    }

    return matches;
});

function nextMatch() {
    if (matchedRoutes.value.length === 0) return;
    currentMatchIndex.value = (currentMatchIndex.value + 1) % matchedRoutes.value.length;
}

function prevMatch() {
    if (matchedRoutes.value.length === 0) return;
    currentMatchIndex.value = (currentMatchIndex.value - 1 + matchedRoutes.value.length) % matchedRoutes.value.length;
}

const groups = computed(() => {
    if (!paths.value) return [];

    const searchTerm = search.value.toLowerCase();

    if (searchTerm) {
        // Filtered subset of paths
        const filteredPaths = Object.fromEntries(
            Object.entries(paths.value).filter(([route, methods]) => {
                if (route.toLowerCase().includes(searchTerm)) return true;

                // Also search method summaries
                return Object.values(methods).some(op => op.summary?.toLowerCase().includes(searchTerm));
            }),
        );

        return organizePathsByTag(filteredPaths);
    }
    return organizePathsByTag(paths.value);
});
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

const searchInput = ref<HTMLInputElement | null>(null);
onMounted(() => {
    if (!vscode) {
        vscode = (window as any).acquireVsCodeApi();
    }

    searchInput?.value?.focus();

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'showJson') {
            paths.value = message.json.paths || {};
            console.log(paths.value, 'paths @ mount');
            fullSpec.value = message.json;
        }
    });

    loadJsonFromUrl();
});
</script>

<style scoped>
.container {
    padding: 1rem;
}
</style>
