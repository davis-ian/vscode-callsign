<template>
    <div @click="toggleExpand" class="cursor-pointer p-3 rounded bg-vs-ibg border border-vs-border">
        <div class="my-2">
            <span class="font-bold text-vs-bfg mr-2">{{ method.toUpperCase() }}</span>
            <span class="text-vs-ifg">{{ route }}</span>
            —
            <span class="text-vs-tfg italic">{{ details?.summary }}</span>
        </div>

        <div v-if="expanded" class="">
            <p class="mb-4" v-if="details?.description">{{ details.description }}</p>

            <div class="my-4">
                <p class="text-xl">Params</p>
                <div class="border-t"></div>
                <div class="p-2" v-for="param in details?.parameters">
                    <p class="text-xs">{{ param?.schema?.type }}({{ param?.schema?.format }})</p>
                    <p class="font-bold">{{ param.required ? '*' : '' }}{{ param.name }}</p>
                </div>
            </div>

            <div class="my-4">
                <p class="text-xl">Responses</p>
                <div class="border-t"></div>
                <div class="p-2" v-for="(resp, code) in details?.responses">
                    <p>{{ code }} - {{ resp?.description }}</p>
                </div>
            </div>
            <!--
            <div class="mt-4">
                {{ details }}
            </div> -->
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
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

const expanded = ref(false);
function toggleExpand() {
    expanded.value = !expanded.value;
    console.log(expanded.value, 'expanded');
}
</script>

<style lang="scss" scoped></style>
