<template>
    <div class="flex flex-col">
        <AppBar class="mb-2" />
        <div class="flex-grow flex flex-col">
            <RouteSidebar v-if="!selectedRoute" />
            <RouteEditor v-if="selectedRoute" />
        </div>
    </div>
</template>

<script setup lang="ts">
import RouteSidebar from '@/components/Layout/RouteSidebar.vue';
import AppBar from '@/components/Layout/AppBar.vue';
import RouteEditor from '@/components/Layout/RouteEditor.vue';

import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
const selectedRoute = useSelectedRoute();
</script>

<style scoped></style>
