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

    function sync(spec: OpenApiSpec | null, route: OpenApiRoute | null, authId: string | null) {
        currentSpec.value = spec;
        selectedRoute.value = route;
        selectedAuthId.value = authId;
    }

    function updateSelectedRoute(route: OpenApiRoute | null) {
        selectedRoute.value = route;
    }

    return {
        // State
        selectedRoute,
        selectedAuthId,
        currentSpec,

        //Actions
        sync,
        updateSelectedRoute,
    };
});
