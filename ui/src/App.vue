<template>
    <AppLayout />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppLayout from './components/Layout/AppLayout.vue';
import { extensionBridge } from './services/ExtensionBridge';
import { useSpecStore } from './stores/spec';
import { useRouter } from 'vue-router';

const specStore = useSpecStore();
const router = useRouter();

onMounted(async () => {
    const initialData = await extensionBridge.vueAppReady();
    console.log('initialData', initialData);
    specStore.sync(initialData.openApiSpec, initialData.selectedRoute, initialData.selectedAuthId);

    if (initialData.selectedRoute) {
        router.push({ name: 'RouteDetail' });
    }

    window.addEventListener('message', e => {
        console.log(e, 'messate heard @ vue app');

        if (e.data.command === 'navigateTo') {
            router.push({ path: e.data.path });
        }

        if (e.data.type === 'syncState') {
            // Object.assign(state, e.data.payload);
            // console.log(state, 'state synced');
        }
    });
});
</script>

<style>
#app {
    height: 100%;
}
</style>
