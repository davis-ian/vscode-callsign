<template>
    <div class="rounded bg-vs-ibg border border-vs-border">
        <div @click="selectRow" class="p-3 cursor-pointer">
            <span class="font-bold text-vs-bfg mr-2">{{ props.route.method.toUpperCase() }}</span>
            <span class="text-vs-ifg">{{ props.route.path }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { type OpenApiRoute } from '@/types';
import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
const selectedRoute = useSelectedRoute();

const props = defineProps<{
    route: OpenApiRoute;
}>();

function selectRow() {
    console.log(props.route, 'selected route');
    selectedRoute.value = props.route;
}
</script>

<style scoped>
pre code {
    background-color: transparent !important;
}
</style>
