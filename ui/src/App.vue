<template>
  <AppLayout />
  <LoadingOverlay :is-visible="!mounted" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppLayout from "./components/Layout/AppLayout.vue";
import { extensionBridge } from "./services/ExtensionBridge";
import { useSpecStore } from "./stores/spec";
import { useRouter } from "vue-router";
import LoadingOverlay from "./components/LoadingOverlay.vue";
import { vsLog } from "./utilities/extensionLogger";

const specStore = useSpecStore();
const router = useRouter();

const mounted = ref(false);

onMounted(async () => {
  const initialData = await extensionBridge.vueAppReady();
  specStore.sync(
    initialData.openApiSpec,
    initialData.selectedRoute,
    initialData.selectedAuthId,
    initialData.historyLimit
  );

  if (initialData.initialVueRoute) {
    router.push({ path: initialData.initialVueRoute });
  }

  window.addEventListener("message", (e) => {
    if (e.data.command === "navigateTo") {
      vsLog(e, "nav heard @ vue");
      router.push({ path: e.data.path });
    }
    if (e.data.command === "syncState") {
      if (e.data.selectedRoute) {
        specStore.updateSelectedRoute(e.data.selectedRoute);
      }
      if (e.data.spec) {
        specStore.updateSpec(e.data.spec);
      }
      if (e.data.selectedAuthId) {
        specStore.updateSelectedAuthId(e.data.selectedAuthId);
        vsLog("auth id sync heard", e.data.selectedAuthId);
      }
    }
  });

  mounted.value = true;

  vsLog("Vue app mounted");
});
</script>

<style>
#app {
  height: 100%;
  width: 100%;
}
</style>
