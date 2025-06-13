<template>
    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium mb-2">Authentication Method:</label>
            <!-- :model-value="modelValue"
                @update:model-value="handleAuthChange" -->
            <select v-model="selectedAuthId" class="w-full p-2 border rounded bg-vs-ibg border-vs-border text-vs-fg">
                <option value="">No Authentication</option>
                <option v-for="auth in availableAuth" :key="auth.id" :value="auth.id">
                    {{ auth.displayName }}
                </option>
            </select>
        </div>

        <div v-if="authPreview" class="p-3 bg-vs-pbg rounded border">
            <h4 class="text-sm font-medium mb-2">Preview:</h4>
            <code class="text-xs"> {{ authPreview.key }}: {{ authPreview.value.substring(0, 50) }}... </code>
        </div>

        <div v-if="!availableAuth.length" class="text-gray-400 text-center py-8">
            No authentication methods configured.
        </div>
    </div>
</template>

<script setup lang="ts">
import { extensionBridge } from '@/services/ExtensionBridge';
import type { AuthHeader, AuthMethod } from '@/types';
import { computed, onMounted, ref, watch } from 'vue';

const availableAuth = ref<AuthMethod[]>([]);
const authPreview = ref<AuthHeader | null>(null);
const authHeaders = ref<Record<string, AuthHeader | null>>({});

const props = defineProps<{
    modelValue: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const selectedAuthId = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
});

watch(selectedAuthId, (_newVal, _oldVal) => {
    updateAuthPreview();
});

async function updateAuthPreview() {
    if (!props.modelValue) {
        authPreview.value = null;
        return;
    }

    try {
        authPreview.value = await extensionBridge.getAuthHeader(props.modelValue);
    } catch (err) {
        console.error('Failed to get auth header:', err);
        authPreview.value = null;
    }
}

async function loadAuthHeaders() {
    const headers: Record<string, AuthHeader | null> = {};

    for (const auth of availableAuth.value) {
        try {
            headers[auth.id] = await extensionBridge.getAuthHeader(auth.id);
        } catch (err) {
            console.error(`Failed to laod auth header for ${auth.id} `, err);
            headers[auth.id] = null;
        }
    }

    authHeaders.value = headers;
}

// function hasValidToken(auth: AuthMethod) {
//     const header = authHeaders.value[auth.id];
//     return header?.value ? header.value.trim().length > 0 : false;
// }

onMounted(async () => {
    try {
        availableAuth.value = await extensionBridge.getAvailableAuthMethods();

        await loadAuthHeaders();
        updateAuthPreview();

        // await setDefaultAuth();
    } catch (err) {
        console.error('Failed to load auth methods:', err);
    }
});
</script>

<style scoped></style>
