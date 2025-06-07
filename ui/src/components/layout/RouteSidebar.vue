<template>
    <div>
        <!-- Fixed Top Section -->
        <div class="p-2">
            <input
                v-model="search"
                type="text"
                ref="searchInput"
                autofocus
                placeholder="Search routes..."
                class="w-full p-2 mb-2 rounded border border-vs-border bg-vs-ibg text-vs-fg"
            />

            <div class="flex items-center gap-2 mb-2">
                <button @click="prevMatch" class="px-2 py-1 border rounded">↑ Prev</button>
                <button @click="nextMatch" class="px-2 py-1 border rounded">↓ Next</button>
                <span class="text-sm text-gray-400"> {{ currentMatchIndex + 1 }} / {{ matchedRoutes.length }} </span>
            </div>

            <p class="text-sm italic mb-2">Showing {{ filteredRouteCount }} of {{ totalRouteCount }} routes</p>
        </div>

        <!-- Scrollable Route List -->
        <div class="flex-grow overflow-y-auto min-h-0 border-t border-vs-border">
            <RouteList :groups="groups" class="px-2" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, inject, ref, computed, type Ref } from 'vue';
import { type GroupedRoutes } from '@/types.ts';
import RouteList from '@/components/RouteList.vue';

const searchInput = ref<HTMLInputElement | null>(null);

const search = ref('');
const totalRouteCount = computed(() => Object.keys(paths.value || {}).length);
const filteredRouteCount = computed(() => Object.keys(groups.value.flatMap(g => Object.keys(g.routes))).length);

const fullSpec = inject<Ref<Record<string, any> | null>>('openApiSpec');
const paths = computed(() => {
    return (fullSpec?.value?.paths || {}) as Record<string, Record<string, { summary?: string }>>;
});

const groups = computed(() => {
    const spec = fullSpec?.value;
    if (!spec?.paths) return [];

    const searchTerm = search.value.toLowerCase();

    if (searchTerm) {
        // Filtered subset of paths
        const filteredPaths = Object.fromEntries(
            Object.entries(spec.paths as Record<string, Record<string, any>>).filter(([route, methods]) => {
                if (route.toLowerCase().includes(searchTerm)) return true;

                // Also search method summaries
                return Object.values(methods).some(op => op.summary?.toLowerCase().includes(searchTerm));
            }),
        );

        return organizePathsByTag(filteredPaths);
    }
    return organizePathsByTag(spec.paths);
});

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

function nextMatch() {
    if (matchedRoutes.value.length === 0) return;
    currentMatchIndex.value = (currentMatchIndex.value + 1) % matchedRoutes.value.length;
}

function prevMatch() {
    if (matchedRoutes.value.length === 0) return;
    currentMatchIndex.value = (currentMatchIndex.value - 1 + matchedRoutes.value.length) % matchedRoutes.value.length;
}

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

onMounted(() => {
    searchInput?.value?.focus();
});
</script>

<style scoped></style>
