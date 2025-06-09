<template>
    <div>
        <div>Response</div>

        <div v-if="response?.status">
            <p class="text-xl">Status: {{ response?.body }}</p>
            <p>Response Body</p>
            <pre
                class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs max-h-100 border my-4"
            ><code>{{ response }}</code></pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '@/types';

const props = defineProps<{
    response: ApiResponse | null;
}>();
</script>

<style scoped></style>
