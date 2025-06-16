<template>
    <div>
        <h3 class="font-bold my-2 text-xl">Recent Requests</h3>
        <ul class="text-xs text-gray-400 space-y-1">
            <li
                @click="toggleExpand(snap)"
                class="cursor-pointer p-1 my-3 rounded border"
                v-for="snap in requestHistory"
                :key="snap.id"
            >
                <h2 class="font-semibold">
                    <span v-if="snap?.method" :class="getMethodColorClass(snap?.method)">{{
                        snap?.method.toUpperCase()
                    }}</span>
                    {{ snap?.path }}
                </h2>

                <p>
                    <span class="mr-2" :class="getStatusColorClass(snap.status)">
                        {{ snap.status }}
                    </span>
                    <span class="opacity-60"
                        >({{
                            new Date(snap.timestamp).toLocaleDateString() +
                            ' - ' +
                            new Date(snap.timestamp).toLocaleTimeString()
                        }})</span
                    >
                </p>

                <div v-if="expandedIds.has(snap.id)" class="my-2 p-2">
                    <!-- <Btn @click.stop="retryRequest(snap)">Retry</Btn> -->
                    <p>
                        Status:
                        <span class="font-bold" :class="getStatusColorClass(snap.status)">{{ snap.status }}</span>
                    </p>

                    <div class="my-1 border-b">
                        <p class="">Query Params:</p>
                        <div v-for="(value, key) in snap.queryParams">
                            <pre
                                class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs max-h-100 my-4"
                            ><code>{{ key }}: {{ value }}</code></pre>
                        </div>
                    </div>

                    <div class="my-1 p-1 border-b">
                        <p>Request Body:</p>
                        <p>{{ snap.requestBody }}</p>
                    </div>

                    <div class="my-1 p-1 border-b">
                        <p>Response Body:</p>
                        <!-- <p>{{ snap.responseBody }}</p> -->

                        <pre
                            class="bg-vs-pbg rounded overflow-x-auto p-2 text-xs max-h-100 my-4"
                        ><code>{{ snap.responseBody }}</code></pre>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useRequestHistory } from '@/composables/useRequestHistory';
import type { RequestSnapshot } from '@/types';
import { getMethodColorClass, getStatusColorClass } from '@/utilities/dynamicColors';
import { onMounted, ref } from 'vue';
// import Btn from '@/components/Common/Btn.vue';

const { requestHistory, loadHistory } = useRequestHistory();

const expandedIds = ref(new Set<string>());

function toggleExpand(snapshot: RequestSnapshot) {
    if (expandedIds.value.has(snapshot.id)) {
        expandedIds.value.delete(snapshot.id);
    } else {
        expandedIds.value.add(snapshot.id);
    }
}

onMounted(() => {
    loadHistory();
});
</script>

<style scoped></style>
