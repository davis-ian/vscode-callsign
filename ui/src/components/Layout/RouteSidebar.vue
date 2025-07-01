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

            <p class="text-sm italic mb-2">Showing {{ routes.length }} of {{ total }} routes</p>
        </div>

        <!-- Scrollable Route List -->
        <div class="flex-grow overflow-y-auto min-h-0 border-t border-vs-border">
            <RouteList :routes="routes" class="px-2" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, inject, ref, type Ref } from 'vue';
import type { OpenApiSpec } from '@/types';
import RouteList from '@/components/Route/RouteList.vue';

import { useRoutesFlat } from '@/composables/useRoutesFlat';

const fullSpec = inject<Ref<OpenApiSpec | null>>('openApiSpec') || ref(null);
const searchInput = ref<HTMLInputElement | null>(null);
const search = ref('');

const { routes, total } = useRoutesFlat(fullSpec, search);

onMounted(() => {
    searchInput?.value?.focus();
});
</script>

<style scoped></style>
