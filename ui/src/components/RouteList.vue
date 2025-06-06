<template>
    <div>
        <div v-for="group in props.groups" :key="group.tag" class="mb-6">
            <h2 class="text-2xl font-bold mb-2">{{ group.tag }}</h2>

            <div v-for="(methods, route) in group.routes" :key="route">
                <div v-for="(details, method) in methods" :key="method" class="mb-2">
                    <RouteRow :method="method" :route="route" :details="details" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import RouteRow from '@/components/RouteRow.vue';
import { type GroupedRoutes } from '@/types';

const props = defineProps({
    groups: {
        type: Array as () => GroupedRoutes[],
        default: () => [],
    },
});
</script>

<style lang="scss" scoped></style>
