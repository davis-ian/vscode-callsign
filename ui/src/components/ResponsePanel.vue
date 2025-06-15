<template>
    <div class="flex flex-col">
        <p class="text-center uppercase">Response</p>
        <p class="text-xl p-3">
            Status:
            <span v-if="response?.status" :class="getStatusColorClass(response.status)">{{ response?.status }}</span>
        </p>

        <ResponseTabs
            :active-tab="activeTab"
            @update:activeTab="val => (activeTab = val)"
            :showBody="!!response?.body"
            :showHeaders="!!response?.headers"
            :showMeta="false"
        />

        <div class="flex-1 p-4 overflow-y-auto">
            <div v-if="activeTab == 'body'">
                <pre class="overflow-x-auto p-2 flex-grow max-h-150 text-xs"><code>{{ response?.body }}</code></pre>
            </div>

            <div v-if="activeTab == 'headers'">
                <pre class="overflow-x-auto p-2 flex-grow max-h-150 text-xs"><code>{{ response?.headers }}</code></pre>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '@/types';
import { getStatusColorClass } from '@/utilities/dynamicColors';
import ResponseTabs from './ResponseTabs.vue';
import { ref, watch } from 'vue';

const props = defineProps<{
    response: ApiResponse | null;
}>();

const activeTab = ref('body');

// watch(activeTab, (newVal, oldVal) => {
//     console.log(newVal, 'activeTab update');
// });
</script>

<style scoped></style>
