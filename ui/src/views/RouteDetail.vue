<template>
    <div class="flex flex-col">
        <AppBar class="mb-2" />
        <div class="flex-grow flex flex-col">
            <RouteEditor v-if="specStore.selectedRoute" />
        </div>
    </div>
</template>

<script setup lang="ts">
import AppBar from '@/components/Layout/AppBar.vue';
import RouteEditor from '@/components/Layout/RouteEditor.vue';

import { onMounted } from 'vue';
import { useSpecStore } from '@/stores/spec';

const specStore = useSpecStore();

onMounted(() => {
    console.log(specStore.selectedRoute, 'selectedRoute');
    console.log(specStore.currentSpec, 'current spec');
});
</script>

<style scoped></style>
