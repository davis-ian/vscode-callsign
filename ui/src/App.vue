<template>
    <div class="container">
        <h1 class="text-5xl">Callsign 🛰️</h1>
        <!-- <button class="bg-vs-bbg" @click="loadJson">Load OpenAPI JSON</button> -->

        <Btn class="my-4" @click="loadJsonFromUrl">Load OpenAPI JSON</Btn>

        <div class="my-4" id="output">
            <pre v-if="!paths">{"waiting": true}</pre>
            <div v-else>
                <div v-for="group in groups" :key="group.tag" class="mb-6">
                    <h2 class="text-2xl font-bold mb-2">{{ group.tag }}</h2>

                    <div v-for="(methods, route) in group.routes" :key="route" class="ml-4">
                        <div v-for="(details, method) in methods" :key="method" class="mb-2">
                            <RouteRow :method="method" :route="route" :details="details" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Btn from '@/components/Btn.vue';
import RouteRow from '@/components/RouteRow.vue';

const paths = ref<Record<string, Record<string, { summary?: string }>> | null>(null);
const groups = ref<GroupedRoutes[]>(null);

type GroupedRoutes = {
    tag: string;
    routes: Record<string, Record<string, any>>;
};

function organizePathsByTag(rawPaths: Record<string, any>): GroupedRoutes[] {
    const groupsMap: Record<string, GroupsRoutes> = {};

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

            groups.value = organizePathsByTag(paths.value);
            console.log(groups.value, 'groups');
        }
    });
});
</script>

<style scoped>
.container {
    padding: 1rem;
}
</style>
