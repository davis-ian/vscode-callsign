<template>
    <div>
        <div>
            <label class="block text-sm font-medium mb-2">API</label>
            <div class="flex gap-4">
                <select
                    :value="apiStore.selectedUrlId || ''"
                    class="w-full p-2 border rounded bg-vs-ibg border-vs-border text-vs-fg"
                >
                    <!-- <option value="https://petstore3.swagger.io/api/v3/openapi.json">
                    https://petstore3.swagger.io/api/v3/openapi.json
                </option> -->

                    <option v-for="spec in apiStore.specUrls" :key="spec.id" :value="spec.id">
                        {{ spec.name }}
                    </option>
                </select>
                <Btn @click="showAddForm = !showAddForm">+</Btn>
            </div>
        </div>
        <div v-if="showAddForm" class="add-form">
            <TextInput v-model="newSpecName" placeholder="Name (e.g., Petstore API)" @keyup.enter="handleAdd" />
            <TextInput
                v-model="newSpecUrl"
                placeholder="URL (e.g., https://api.example.com/openapi.json)"
                @keyup.enter="handleAdd"
            />
            <div class="flex gap-2">
                <Btn @click="handleAdd">Add</Btn>
                <Btn @click="showAddForm = false">Cancel</Btn>
            </div>
        </div>

        <!-- Current spec info -->
        <div v-if="apiStore.selectedUrl" class="spec-info">
            <span>{{ apiStore.selectedUrl.name }}</span>
            <button @click="handleRefresh" :disabled="apiStore.isLoading">↻</button>
            <button @click="handleDelete">✕</button>
        </div>

        <!-- Status -->
        <div v-if="apiStore.isLoading" class="loading">Loading...</div>
        <div v-if="apiStore.error" class="error">{{ apiStore.error }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';

const apiStore = useApiStore();

// import { extensionBridge } from '@/services/ExtensionBridge';
import type { OpenApiSpec } from '@/types';
import { useApiStore } from '@/stores/api';
import Btn from './Common/Btn.vue';
import TextInput from './Common/TextInput.vue';

const showAddForm = ref(false);
const newSpecName = ref('');
const newSpecUrl = ref('');

async function handleAdd() {
    if (!newSpecName.value || !newSpecUrl.value) return;

    try {
        await apiStore.addSpecUrl(newSpecName.value, newSpecUrl.value);
        newSpecName.value = '';
        newSpecUrl.value = '';
        showAddForm.value = false;
    } catch (error) {
        console.error('Failed to add spec:', error);
    }
}

async function handleRefresh() {
    await apiStore.refreshCurrentSpec();
}

async function handleDelete() {
    if (apiStore.selectedUrlId && confirm('Delete this spec URL?')) {
        await apiStore.deleteSpecUrl(apiStore.selectedUrlId);
    }
}

// async function loadJsonFromUrl() {
//     console.log('Loading JSON from remote URL...');

//     try {
//         // const spec = await extensionBridge.loadJsonFromUrl('https://api-develop.memoryshare.com/internal/swagger.json');
//         const spec = await extensionBridge.loadJsonFromUrl('https://petstore3.swagger.io/api/v3/openapi.json');
//         fullSpec.value = spec;
//         console.log('JSON loaded successfully:', spec);
//     } catch (error) {
//         console.log('Failed to load JSON', error);
//     }
// }

const fullSpec = ref<OpenApiSpec | null>(null);
provide('openApiSpec', fullSpec);

onMounted(() => {
    // loadJsonFromUrl();
});
</script>

<style scoped></style>
