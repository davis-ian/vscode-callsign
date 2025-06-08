<template>
    <div>
        <div v-for="(route, i) in props.routes" :key="i" class="my-2">
            <RouteRow :route="route" />
        </div>
    </div>
</template>

<script setup lang="ts">
import RouteRow from '@/components/RouteRow.vue';
import { type OpenApiRoute } from '@/types';

const props = defineProps({
    routes: {
        type: Array as () => OpenApiRoute[],
        default: () => [],
    },
});
</script>

<style lang="scss" scoped></style>
