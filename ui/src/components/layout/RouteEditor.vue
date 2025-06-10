<template>
    <div class="flex-grow flex">
        <RequestPanel
            @send-request="data => initSendRequest(data)"
            :route="selectedRoute"
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

import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
import type { ApiResponse } from '@/types';
const selectedRoute = useSelectedRoute();

import { sendRequest } from '@/services/RequestService';
const loading = ref(false);
const response = ref<ApiResponse | null>(null);

async function initSendRequest(requestData: any) {
    if (!selectedRoute.value) return;

    console.log(requestData, 'initing request');
    try {
        response.value = await sendRequest(
            selectedRoute.value,
            requestData.params,
            requestData.authId,
            requestData.body,
        );

        // response.value = typeof result.body === 'object' ? JSON.stringify(result.body, null, 2) : result.body;
    } catch (err: any) {
        console.log(err, 'request error');
        response.value = err;
    }

    console.log(response.value, 'response');
}
</script>

<style scoped></style>
