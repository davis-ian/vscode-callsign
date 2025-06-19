<template>
    <div class="flex flex-col h-full max-h-screen">
        <div class="p-4 flex-shrink-0">
            <h2 class="font-semibold">
                Status:
                <span v-if="response?.status" :class="getStatusColorClass(response.status)">{{
                    response?.status
                }}</span>
            </h2>
        </div>

        <div class="flex-1 flex flex-col min-h-0">
            <ResponseTabs
                :active-tab="activeTab"
                @update:activeTab="val => (activeTab = val)"
                :showBody="!!response?.body"
                :showHeaders="!!response?.headers"
                :showMeta="false"
            />

            <div v-if="response" class="flex-1 p-4 overflow-y-auto">
                <div class="h-full" v-if="activeTab == 'body'">
                    <CodeBlock :content="response?.body" />
                </div>

                <div v-if="activeTab == 'headers'">
                    <CodeBlock :content="response?.headers" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '@/types';
import { getStatusColorClass } from '@/utilities/dynamicColors';
import ResponseTabs from './ResponseTabs.vue';
import { ref } from 'vue';
import CodeBlock from './CodeBlock.vue';

defineProps<{
    response: ApiResponse | null;
}>();

const activeTab = ref('body');
</script>

<style scoped></style>
