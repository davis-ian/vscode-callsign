<template>
    <div class="flex flex-col h-full">
        <div>
            <p class="uppercase text-center">Request</p>
        </div>
        <!-- Header - Fixed at top -->
        <div class="p-4 flex-shrink-0">
            <h2 class="font-semibold">
                <span v-if="route?.method" :class="getMethodColorClass(route?.method)">{{
                    route?.method.toUpperCase()
                }}</span>
                {{ route?.path }}
            </h2>
            <p class="text-sm text-vs-efg opacity-50" v-if="route?.details?.description">
                {{ route.details.description }}
            </p>
        </div>

        <!-- Request Tabs - Flexible content area -->
        <div class="flex-1 flex flex-col min-h-0">
            <RequestTabs
                v-model:activeTab="activeTab"
                :has-params="hasParams"
                :has-body="hasBody"
                class="flex-shrink-0"
            />

            <!-- Scrollable content area -->
            <div class="flex-1 p-4 overflow-y-auto">
                <component :is="currentTabComponent" v-bind="currentTabProps" @update:model-value="handleTabUpdate" />
            </div>
        </div>

        <!-- Send Button - Fixed at bottom -->
        <div class="p-4 flex-shrink-0">
            <Btn block @click="handleSend" :disabled="loading">
                {{ loading ? 'Sending...' : 'Send Request' }}
            </Btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component, onMounted } from 'vue';
import Btn from '@/components/Common/Btn.vue';
import RequestTabs from './RequestTabs.vue';
import ParamsTab from '@/components/Tabs/ParamsTab.vue';
import BodyTab from '@/components/Tabs/BodyTab.vue';
import HeadersTab from '@/components/Tabs/HeadersTab.vue';
import AuthTab from '@/components/Tabs/AuthTab.vue';
import type { OpenApiRoute } from '@/types';
import { getMethodColorClass } from '@/utilities/dynamicColors';
import { useSpecStore } from '@/stores/spec';

const specStore = useSpecStore();

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
}

function handleSend() {
    emit('send-request', requestData.value);
}

onMounted(() => {
    if (specStore.selectedAuthId) {
        requestData.value.authId = specStore.selectedAuthId;
    }
});
</script>

<style scoped></style>
