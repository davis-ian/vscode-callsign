import type { OpenApiRoute, OpenApiSpec } from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface SpecUrl {
    id: string;
    name: string;
    url: string;
    createdAt: string;
}

export const useSpecStore = defineStore('spec', () => {
    const currentSpec = ref<OpenApiSpec | null>(null);
    const selectedRoute = ref<OpenApiRoute | null>(null);
    const selectedAuthId = ref<string | null>('null');
    const historyLimit = ref(10);

    function sync(
        spec: OpenApiSpec | null,
        route: OpenApiRoute | null,
        authId: string | null,
        newHistoryLimit: number | null,
    ) {
        currentSpec.value = spec;
        selectedRoute.value = route;
        selectedAuthId.value = authId;
        historyLimit.value = newHistoryLimit || 10;
    }

    function updateSelectedRoute(route: OpenApiRoute | null) {
        selectedRoute.value = route;
    }

    function updateSpec(spec: OpenApiSpec | null) {
        currentSpec.value = spec;
    }

    function updateSelectedAuthId(id: string | null) {
        selectedAuthId.value = id;
    }

    return {
        // State
        selectedRoute,
        selectedAuthId,
        currentSpec,
        historyLimit,

        //Actions
        sync,
        updateSelectedRoute,
        updateSpec,
        updateSelectedAuthId,
    };
});
