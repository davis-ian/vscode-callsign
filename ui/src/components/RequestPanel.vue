<template>
    <div class="flex flex-col h-full" v-if="route">
        <div>
            <p class="uppercase text-center">Request</p>
        </div>

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

        <div class="flex-1 flex flex-col min-h-0">
            <RequestTabs
                v-model:activeTab="activeTab"
                :has-params="hasParams"
                :has-body="hasBody"
                :show-preview="true"
                class="flex-shrink-0"
            />

            <div class="flex-1 p-4 overflow-y-auto">
                <div :key="refreshKey" class="flex-1 p-4 overflow-y-auto">
                    <ParamsTab v-if="activeTab === 'params'" :route="route" v-model="requestData.params" />

                    <BodyTab v-else-if="activeTab === 'body'" :route="route" v-model="requestData.body" />

                    <HeadersTab v-else-if="activeTab === 'headers'" :route="route" v-model="requestData.headers" />

                    <AuthTab v-else-if="activeTab === 'authId'" :route="route" v-model="requestData.authHeader" />

                    <RequestPreviewTab
                        v-else-if="activeTab === 'preview'"
                        :route="route"
                        :params="requestData.params"
                        :body="requestData.body"
                        :auth-header="requestData.authHeader"
                    />
                </div>
            </div>
        </div>

        <div class="p-4 flex-shrink-0">
            <Btn block @click="handleSend" :disabled="loading">
                {{ loading ? 'Sending...' : 'Send Request' }}
            </Btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Btn from '@/components/Common/Btn.vue';
import RequestTabs from './RequestTabs.vue';
import ParamsTab from '@/components/Tabs/ParamsTab.vue';
import BodyTab from '@/components/Tabs/BodyTab.vue';
import HeadersTab from '@/components/Tabs/HeadersTab.vue';
import AuthTab from '@/components/Tabs/AuthTab.vue';
import RequestPreviewTab from './Tabs/RequestPreviewTab.vue';
import type { OpenApiRoute } from '@/types';
import { getMethodColorClass } from '@/utilities/dynamicColors';
import { useSpecStore } from '@/stores/spec';
import { vsLog } from '@/utilities/extensionLogger';
import { extensionBridge } from '@/services/ExtensionBridge';

const specStore = useSpecStore();

const props = defineProps<{
    route: OpenApiRoute | null;
    loading?: boolean;
}>();

const refreshKey = ref(0);

const emit = defineEmits(['toggle-editing', 'send-request']);

const activeTab = ref('params');
const requestData = ref({
    params: {},
    body: '',
    headers: {},
    authHeader: {
        key: 'Authorization',
        value: '',
    },
});

const hasParams = computed(() => (props.route?.details?.parameters?.length ?? 0) > 0);
const hasBody = computed(() => !!props.route?.details?.requestBody);

function handleSend() {
    vsLog(requestData.value, 'request data');
    emit('send-request', requestData.value);
}

onMounted(async () => {
    if (specStore.selectedAuthId) {
        // requestData.value.authId = specStore.selectedAuthId;

        vsLog(specStore.selectedAuthId, 'selectedAuthId @ request panel mount');
        const auth = await extensionBridge.getCredentialById(specStore.selectedAuthId);
        if (auth) {
            requestData.value.authHeader.value = auth.value;
            requestData.value.authHeader.key = auth.credential.key;
        }
        vsLog(auth, 'credential @ panel mount');
    }
});

watch(
    () => specStore.selectedAuthId,
    async newId => {
        if (!newId) return;

        const auth = await extensionBridge.getCredentialById(newId);
        if (auth) {
            requestData.value.authHeader.value = auth.value;
            requestData.value.authHeader.key = auth.credential.key;
            refreshKey.value++;
        }
    },
    { immediate: false },
);
</script>

<style scoped></style>
