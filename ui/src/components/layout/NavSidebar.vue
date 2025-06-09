<template>
    <div class="flex flex-col">
        <div v-for="entry in navEntries">
            <RouterLink class="p-2 text-lg" :to="entry.to" custom v-slot="{ navigate, isActive }">
                <Btn :variant="isActive ? 'primary' : 'secondary'" :block="true" square @click="navigate">
                    <component :is="entry.icon" />
                </Btn>
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { NavEntry } from '@/types';
import { ref } from 'vue';
import Btn from '../Btn.vue';
import { History, Route } from 'lucide-vue-next';

const navEntries = ref<NavEntry[]>([
    {
        label: 'Explorer',
        icon: Route,
        to: '/api-explorer',
    },
    {
        label: 'History',
        icon: History,
        to: '/history',
    },
]);
</script>

<style scoped></style>
