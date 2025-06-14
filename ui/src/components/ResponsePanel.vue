<template>
    <div>
        <p class="text-center uppercase">Response</p>

        <div v-if="response?.status">
            <p class="text-xl">
                Status:
                <span :class="getStatusColorClass(response.status)">{{ response?.status }}</span>
            </p>

            <pre
                class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs max-h-150 border my-4"
            ><code>{{ response.body }}</code></pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '@/types';
import { getStatusColorClass } from '@/utilities/dynamicColors';

defineProps<{
    response: ApiResponse | null;
}>();
</script>

<style scoped></style>
