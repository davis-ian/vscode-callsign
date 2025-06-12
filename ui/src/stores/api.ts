import { extensionBridge } from '@/services/ExtensionBridge';
import type { OpenApiSpec } from '@/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface SpecUrl {
    id: string;
    name: string;
    url: string;
    createdAt: string;
}

export const useApiStore = defineStore('api', () => {
    const specUrls = ref<SpecUrl[]>([]);
    const selectedUrlId = ref<string | null>(null);
    const currentSpec = ref<OpenApiSpec | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const selectedUrl = computed(() => specUrls.value.find(spec => spec.id === selectedUrlId.value) || null);

    async function loadSpecUrls() {
        try {
            const urls = await extensionBridge.getAllSpecUrls();
            specUrls.value = urls;

            const lastSelected = await extensionBridge.getLastSelectedSpecUrl();
            if (lastSelected && specUrls.value.find(s => s.id === lastSelected)) {
                await selectSpecUrl(lastSelected);
            } else if (specUrls.value.length > 0) {
                await selectSpecUrl(specUrls.value[0].id);
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load spec URLs';
            console.error('Failed to load spec URLs:', err);
        }
    }

    async function selectSpecUrl(urlId: string) {
        const specUrl = specUrls.value.find(s => s.id === urlId);
        if (!specUrl) return;

        try {
            isLoading.value = true;
            error.value = null;
            selectedUrlId.value = urlId;

            await extensionBridge.saveLastSelectedSpecUrl(urlId);

            console.log(`Loading spec  from ${specUrl.url}`);
            const spec = await extensionBridge.loadJsonFromUrl(specUrl.url);
            currentSpec.value = spec;
            console.log(`Spec loaded successfully: `, specUrl.name);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load spec';
            currentSpec.value = null;
            console.error('Failed to load spec:', err);
        } finally {
            isLoading.value = false;
        }
    }

    async function addSpecUrl(name: string, url: string) {
        try {
            const newSpec = await extensionBridge.saveSpecUrl({ name, url });
            specUrls.value.push(newSpec);

            await selectSpecUrl(newSpec.id);

            return newSpec;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to add spec URL';
            console.error('Failed to add spec URL:', err);
            throw err;
        }
    }

    async function deleteSpecUrl(urlId: string) {
        try {
            const success = await extensionBridge.deleteSpecUrl(urlId);
            if (success) {
                specUrls.value = specUrls.value.filter(s => s.id !== urlId);

                // If deleted spec was selected, select another one
                if (selectedUrlId.value === urlId) {
                    if (specUrls.value.length > 0) {
                        await selectSpecUrl(specUrls.value[0].id);
                    } else {
                        selectedUrlId.value = null;
                        currentSpec.value = null;
                    }
                }
            }
            return success;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete spec URL';
            console.error('Failed to delete spec URL:', err);
            throw err;
        }
    }

    async function refreshCurrentSpec() {
        if (selectedUrl.value) {
            await selectSpecUrl(selectedUrl.value.id);
        }
    }

    // Initialize
    async function initialize() {
        await loadSpecUrls();
    }

    return {
        // State
        specUrls,
        selectedUrlId,
        currentSpec,
        isLoading,
        error,

        // Computed
        selectedUrl,

        // Actions
        initialize,
        selectSpecUrl,
        addSpecUrl,
        deleteSpecUrl,
        refreshCurrentSpec,
    };
});
