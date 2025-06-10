<template>
    <div class="app-layout-container p-1">
        <NavSidebar class="mr-2" />
        <RouterView class="router-view" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavSidebar from '@/components/layout/NavSidebar.vue';
import { provideSelectedRoute } from '@/composables/SelectedRouteSymbol';
import { RouterView } from 'vue-router';

const selectedRoute = ref(null);
provideSelectedRoute(selectedRoute);
</script>

<style scoped>
.app-layout-container {
    max-height: 100vh;
    overflow: auto;
    display: flex;
    flex-direction: row;
    min-height: 100%;
}

.router-view {
    overflow-y: auto;
    width: 100%;
}
</style>
