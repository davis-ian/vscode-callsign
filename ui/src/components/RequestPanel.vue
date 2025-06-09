<template>
    <div class="flex flex-col h-full border border-vs-border rounded">
        <Btn block @click="handleSend">Send</Btn>
        <!-- Header -->
        <div class="p-4 border-b border-vs-border">
            <h2 class="text-lg font-semibold">{{ route?.path }}</h2>
            <p class="text-sm text-gray-400" v-if="route?.details?.description">
                {{ route.details.description }}
            </p>
        </div>

        <!-- Request Tabs -->
        <div class="flex-1 flex flex-col">
            <RequestTabs v-model:activeTab="activeTab" :has-params="hasParams" :has-body="hasBody" />

            <div class="flex-1 p-4 overflow-y-auto">
                <component :is="currentTabComponent" v-bind="currentTabProps" @update:model-value="handleTabUpdate" />
            </div>
        </div>

        <!-- Send Button -->
        <div class="p-4 border-t border-vs-border">
            <Btn block @click="handleSend" :disabled="loading">
                {{ loading ? 'Sending...' : 'Send Request' }}
            </Btn>
        </div>

        <!-- <div class="border-2 border-red-500">{{ route }}</div> -->
    </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import Btn from '@/components/Btn.vue';
import RequestTabs from './RequestTabs.vue';
import ParamsTab from '@/components/tabs/ParamsTab.vue';
import BodyTab from '@/components/tabs/BodyTab.vue';
import HeadersTab from '@/components/tabs/HeadersTab.vue';
import AuthTab from '@/components/tabs/AuthTab.vue';
import type { OpenApiRoute } from '@/types';

const props = defineProps<{
    route: OpenApiRoute | null;
    loading?: boolean;
}>();

const emit = defineEmits(['toggle-editing', 'send-request']);

const activeTab = ref('params');
const requestData = ref({
    params: {},
    body: '',
    headers: {},
    authId: '',
});

const hasParams = computed(() => (props.route?.details?.parameters?.length ?? 0) > 0);
const hasBody = computed(() => !!props.route?.details?.requestBody);

const currentTabComponent = computed(() => {
    const components: Record<string, Component> = {
        params: ParamsTab,
        body: BodyTab,
        headers: HeadersTab,
        authId: AuthTab,
    };
    return components[activeTab.value] || ParamsTab;
});

const currentTabProps = computed(() => {
    const baseProps = {
        route: props.route,
    };

    switch (activeTab.value) {
        case 'params':
            return {
                ...baseProps,
                modelValue: requestData.value.params,
            };
        case 'body':
            return {
                ...baseProps,
                modelValue: requestData.value.body,
            };
        case 'headers':
            return {
                ...baseProps,
                modelValue: requestData.value.headers,
            };
        case 'authId':
            return {
                ...baseProps,
                modelValue: requestData.value.authId,
            };
        default: {
            return {
                ...baseProps,
                modelValue: requestData.value.params,
            };
        }
    }
});

function handleTabUpdate(value: any) {
    // requestData.value[activeTab.value] = value;
    console.log('handling tab update, value:', value);
    console.log('active tab: ', activeTab.value);
    switch (activeTab.value) {
        case 'params':
            requestData.value.params = value;
            break;
        case 'body':
            requestData.value.body = value;
            break;
        case 'headers':
            requestData.value.headers = value;
            break;
        case 'authId':
            requestData.value.authId = value;
            break;
    }

    console.log(requestData, 'req data after update');
}

function handleSend() {
    // emit('send-request', requestData.value);

    console.log('requestData: ', requestData.value);
}
</script>

<style scoped></style>
