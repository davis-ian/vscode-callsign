<template>
    <div class="flex-grow flex border-0">
        <RequestPanel
            @send-request="data => initSendRequest(data)"
            :route="specStore.selectedRoute"
            :loading="loading"
            class="w-1/2"
        />
        <div class="border-r border-vs-tfg"></div>
        <ResponsePanel :key="refreshKey" :response="response" :loading="loading" class="w-1/2" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import RequestPanel from '../RequestPanel.vue';
import ResponsePanel from '../ResponsePanel.vue';

import type { ApiResponse } from '@/types';

const specStore = useSpecStore();

import { useSpecStore } from '@/stores/spec';
import { vsLog, vsLogError } from '@/utilities/extensionLogger';
import { extensionBridge } from '@/services/ExtensionBridge';

const loading = ref(false);
const response = ref<ApiResponse | null>(null);
const refreshKey = ref(0);

async function initSendRequest(requestData: any) {
    if (!specStore.selectedRoute) return;

    vsLog('init request');

    try {
        const resp = await extensionBridge.sendRequest(
            specStore.selectedRoute,
            requestData.authHeader,
            requestData.body,
            requestData.params,
        );

        vsLog('extensionBridge response', resp);
        response.value = resp;
        refreshKey.value++;
        // response.value = typeof resp.body === 'object' ? JSON.stringify(resp.body, null, 2) : resp.body;
    } catch (err: any) {
        vsLogError(err, 'request error');
        response.value = err;
    }
}
</script>

<style scoped></style>
