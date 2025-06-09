<template>
    <div class="flex">
        <NavSidebar />
        <RouterView />
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

<style scoped></style>
