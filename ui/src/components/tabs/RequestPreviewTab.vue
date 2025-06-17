<template>
    <div>
        <!-- <p class="text-sm mb-2 text-vs-efg/70 uppercase">Request Preview</p> -->
        <Btn variant="outlined" @click="copyToClipboard(curlCommand)">Copy</Btn>
        <pre
            class="text-xs p-3 bg-vs-ibg border rounded font-mono whitespace-pre-wrap break-all"
        ><code>{{ curlCommand }}</code></pre>
    </div>
</template>

<script setup lang="ts">
import type { OpenApiRoute } from '@/types';
import { extensionBridge } from '@/services/ExtensionBridge';
import { onMounted, ref } from 'vue';
import Btn from '../Common/Btn.vue';

const props = defineProps<{
    route: OpenApiRoute;
    params?: Record<string, string>;
    body?: unknown;
    authHeader?: { key: string; value: string };
}>();

const curlCommand = ref('');

async function triggerCurlBuilder() {
    const routeClone = JSON.parse(JSON.stringify(props.route));
    const sanitizedInputData = JSON.parse(
        JSON.stringify({
            params: props.params,
            body: props.body,
            authHeader: props.authHeader,
        }),
    );

    const resp = await extensionBridge.buildCurl(routeClone, sanitizedInputData);

    if (resp?.curl) {
        curlCommand.value = resp.curl;
    }
}

async function copyToClipboard(val: string) {
    await navigator.clipboard.writeText(val);
    await extensionBridge.toast('Copied to clipboard');
}

onMounted(() => {
    triggerCurlBuilder();
});
</script>
