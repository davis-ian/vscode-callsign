<template>
    <div class="rounded bg-vs-ibg border border-vs-border">
        <div @click="selectRow" class="p-3 cursor-pointer">
            <span class="font-bold text-vs-bfg mr-2">{{ props.method.toUpperCase() }}</span>
            <span class="text-vs-ifg">{{ props.route }}</span>

            <span v-if="props.details?.summary" class="text-vs-tfg italic"> — {{ props.details?.summary }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
const selectedRoute = useSelectedRoute();

const props = defineProps({
    method: {
        type: String,
        default: '',
    },
    route: {
        type: String,
        default: '',
    },
    details: {
        type: Object,
        default: () => {},
    },
});

const emit = defineEmits(['select']);

function selectRow() {
    selectedRoute.value = { method: props.method, route: props.route, details: props.details };
    console.log(selectedRoute.value, 'selected route');
}

// const expanded = ref(false);
// function toggleExpand() {
//     expanded.value = !expanded.value;

//     if (expanded.value && props.details?.parameters) {
//         for (const param of props.details.parameters) {
//             if (!(param.name in paramInputs.value)) {
//                 paramInputs.value[param.name] = '';
//             }
//         }
//     }
// }
</script>

<style scoped>
pre code {
    background-color: transparent !important;
}
</style>
