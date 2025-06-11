<template>
    <div>
        <h3 class="font-bold mb-2 text-xl">Recent Requests</h3>
        <ul class="text-xs text-gray-400 space-y-1">
            <li @click="toggleExpand(snap)" class="cursor-pointer" v-for="(snap, i) in requestHistory" :key="snap.id">
                <span class="font-bold">{{ snap.method.toUpperCase() }}</span> {{ snap.fullUrl || snap.path }}

                <p>
                    {{ snap.status }}
                    <span class="opacity-60">({{ new Date(snap.timestamp).toLocaleTimeString() }})</span>
                </p>

                <div v-if="expandedIds.has(snap.id)" class="my-2 p-2">
                    <Btn @click.stop="retryRequest(snap)">Retry</Btn>
                    <p>
                        Status: <span class="font-bold">{{ snap.status }}</span>
                    </p>

                    <div class="my-1 p-1 border-b">
                        <p class="">Query Params:</p>
                        <p v-for="(value, key) in snap.queryParams">{{ key }}: {{ value }}</p>
                    </div>

                    <div class="my-1 p-1 border-b">
                        <p>Request Body:</p>
                        <p>{{ snap.requestBody }}</p>
                    </div>

                    <div class="my-1 p-1 border-b">
                        <p>Response Body:</p>
                        <p>{{ snap.responseBody }}</p>
                    </div>
                    <!-- <div class="border-2 border-red-500">
                        {{ snap }}
                    </div> -->
                </div>

                <div class="border-t" v-if="i != requestHistory.length - 1"></div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useRequestHistory } from '@/composables/useRequestHistory';
import type { RequestSnapshot } from '@/types';
import { ref } from 'vue';
import Btn from '@/components/Common/Btn.vue';

const { requestHistory } = useRequestHistory();

const expandedIds = ref(new Set<string>());

function toggleExpand(snapshot: RequestSnapshot) {
    console.log(snapshot, 'snap');

    if (expandedIds.value.has(snapshot.id)) {
        expandedIds.value.delete(snapshot.id);
    } else {
        expandedIds.value.add(snapshot.id);
    }
}

// async function initSendRequest(snap: RequestSnapshot) {
//     if (!snap.route) return;

//     console.log(snap, 'initing request');
//     try {
//         //TODO: handle auth using auth id / setting new
//         // const result = await sendRequest(snap.route, snap.queryParams, selectedAuthId.value, snap.requestBody);
//         // console.log(result, 'request result');
//     } catch (err: any) {
//         console.log(err, 'request error');
//     }
// }

function retryRequest(snap: any) {
    console.log('TODO: rety request', snap.value);
}
</script>

<style scoped></style>
