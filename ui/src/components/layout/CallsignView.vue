<template>
    <div class="container flex h-screen min-w-full max-w-full gap-4">
        <RouteSidebar class="w-sm max-h-full max-w-full h-full flex flex-col" />
        <main class="flex-grow overflow-y-auto p-2">
            <AppBar />
            <RouteEditor />
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RouteSidebar from './RouteSidebar.vue';
import RouteEditor from './RouteEditor.vue';
import AppBar from './AppBar.vue';
import { provideSelectedRoute } from '@/composables/SelectedRouteSymbol';

const selectedRoute = ref(null);
provideSelectedRoute(selectedRoute);
</script>

<style scoped>
.container {
    padding: 1rem;
}
</style>
