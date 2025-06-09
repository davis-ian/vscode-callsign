<template>
    <div class="flex h-screen gap-4 w-full flex-grow">
        <RouteSidebar v-if="!selectedRoute" class="w-sm max-h-full max-w-full h-full flex flex-col" />
        <main class="flex-grow overflow-y-auto p-2">
            <AppBar />
            <RouteEditor v-if="selectedRoute" />
        </main>
    </div>
</template>

<script setup lang="ts">
import RouteSidebar from '@/components/layout/RouteSidebar.vue';
import AppBar from '@/components/layout/AppBar.vue';
import RouteEditor from '@/components/layout/RouteEditor.vue';

import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
const selectedRoute = useSelectedRoute();
</script>

<style scoped></style>
