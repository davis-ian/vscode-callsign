<template>
    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium mb-2">Header Key</label>
            <input
                v-model="authHeader.key"
                placeholder="Authorization"
                class="w-full p-2 border rounded bg-vs-ibg border-vs-border text-vs-efg"
            />
        </div>

        <div>
            <label class="block text-sm font-medium mb-2">Header Value</label>
            <input
                v-model="authHeader.value"
                placeholder="Bearer YOUR_TOKEN"
                class="w-full p-2 border rounded bg-vs-ibg border-vs-border text-vs-efg"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
// import { extensionBridge } from '@/services/ExtensionBridge';
import { watch, reactive } from 'vue';

const props = defineProps<{
    modelValue: { key: string; value: string };
}>();

const emit = defineEmits(['update:modelValue']);

const authHeader = reactive({
    key: props.modelValue?.key || 'Authorization',
    value: props.modelValue?.value || '',
});

watch(authHeader, async () => {
    emit('update:modelValue', { key: authHeader.key, value: authHeader.value });

    // await extensionBridge.updateCredentialFields(props.authId, {
    //     headerName: authHeader.key,
    //     value: authHeader.value,
    // });
});
</script>

<style scoped></style>
