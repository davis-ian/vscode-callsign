<template>
    <AppLayout />
    <LoadingOverlay :is-visible="!mounted" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppLayout from './components/Layout/AppLayout.vue';
import { extensionBridge } from './services/ExtensionBridge';
import { useSpecStore } from './stores/spec';
import { useRouter } from 'vue-router';
import LoadingOverlay from './components/LoadingOverlay.vue';

const specStore = useSpecStore();
const router = useRouter();

const mounted = ref(false);

onMounted(async () => {
    const initialData = await extensionBridge.vueAppReady();
    specStore.sync(initialData.openApiSpec, initialData.selectedRoute, initialData.selectedAuthId);
    console.log(initialData, 'initial data');
    if (initialData.initialVueRoute) {
        router.push({ path: initialData.initialVueRoute });
    }
    window.addEventListener('message', e => {
        if (e.data.command === 'navigateTo') {
            console.log(e, 'nav heard @ vue');
            router.push({ path: e.data.path });
        }
        if (e.data.command === 'syncState') {
            if (e.data.selectedRoute) {
                specStore.updateSelectedRoute(e.data.selectedRoute);
            }
            if (e.data.spec) {
                specStore.updateSpec(e.data.spec);
            }
        }
    });

    mounted.value = true;
});
</script>

<style>
#app {
    height: 100%;
}
</style>
