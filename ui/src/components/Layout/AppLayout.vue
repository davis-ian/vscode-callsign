<template>
    <div class="app-layout-container">
        <RouterView class="router-view" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
    /* border: 2px solid lime; */
}

.router-view {
    overflow-y: auto;
    width: 100%;
}
</style>
