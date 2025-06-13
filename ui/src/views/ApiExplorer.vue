<template>
    <div class="flex flex-col">
        <AppBar class="mb-2" />
        <div class="flex-grow flex flex-col">
            <!-- <RouteSidebar v-if="!selectedRoute" /> -->
            <RouteEditor v-if="selectedRoute" />
        </div>
    </div>
</template>

<script setup lang="ts">
// import RouteSidebar from '@/components/Layout/RouteSidebar.vue';
import AppBar from '@/components/Layout/AppBar.vue';
import RouteEditor from '@/components/Layout/RouteEditor.vue';
import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
// import { onMounted, onUnmounted, ref } from 'vue';
// import type { ApiResponse, OpenApiRoute } from '@/types';
const selectedRoute = useSelectedRoute();

// const loading = ref(false);
// const response = ref<ApiResponse | null>(null);

// let routeSelectionHandler: EventListener | null = null;

// onMounted(() => {
//     // Listen for route selection events from VS Code
//     routeSelectionHandler = (event: Event) => {
//         console.log('route sselected HEARD', event);
//         const customEvent = event as CustomEvent<OpenApiRoute>;
//         selectedRoute.value = customEvent.detail;
//         // Clear previous response when switching routes
//         response.value = null;
//     };

//     window.addEventListener('routeSelected', routeSelectionHandler);
// });

// onUnmounted(() => {
//     if (routeSelectionHandler) {
//         window.removeEventListener('routeSelected', routeSelectionHandler);
//     }
// });
</script>

<style scoped></style>
