<template>
    <div class="h-full flex">
        <RequestPanel
            @send-request="initSendRequest"
            :route="selectedRoute"
            :loading="loading"
            class="border-2 flex-grow"
        />
        <ResponsePanel :response="response" :loading="loading" class="border-2 flex-grow" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import RequestPanel from '../RequestPanel.vue';
import ResponsePanel from '../ResponsePanel.vue';

import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
import type { ApiResponse } from '@/types';
const selectedRoute = useSelectedRoute();

import { sendRequest } from '@/services/RequestService';
const loading = ref(false);
const response = ref<ApiResponse | null>(null);

async function initSendRequest() {
    if (!selectedRoute.value) return;

    console.log(selectedRoute.value, 'initing request');
    // try {
    //     const result = await sendRequest(selectedRoute.value, paramInputs.value, selectedAuthId.value, bodyInput.value);

    //     console.log(result, 'request result');
    //     responseCode.value = result.status;
    //     response.value = typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body;
    // } catch (err: any) {
    //     console.log(err, 'request error');
    //     response.value = err.message;
    //     responseCode.value = null;
    // }
}
</script>

<style scoped></style>
