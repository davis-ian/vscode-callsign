<template>
    <div class="flex-grow flex">
        <RequestPanel
            @send-request="data => initSendRequest(data)"
            :route="specStore.selectedRoute"
            :loading="loading"
            class="w-1/2"
        />
        <ResponsePanel :response="response" :loading="loading" class="w-1/2" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import RequestPanel from '../RequestPanel.vue';
import ResponsePanel from '../ResponsePanel.vue';

import type { ApiResponse } from '@/types';

const specStore = useSpecStore();

import { sendRequest } from '@/services/RequestService';
import { useSpecStore } from '@/stores/spec';

const loading = ref(false);
const response = ref<ApiResponse | null>(null);

async function initSendRequest(requestData: any) {
    if (!specStore.selectedRoute) return;

    try {
        response.value = await sendRequest(
            specStore.selectedRoute,
            requestData.params,
            requestData.authId,
            requestData.body,
        );

        // response.value = typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body;
    } catch (err: any) {
        logInfo(err, 'request error');
        response.value = err;
    }
}
</script>

<style scoped></style>
