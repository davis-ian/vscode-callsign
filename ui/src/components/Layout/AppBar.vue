<template>
    <div>
        <div class="flex justify-end p-2">
            <Btn v-if="selectedRoute" @click="selectedRoute = null">Back</Btn>
            <Btn @click="showAuthModal = true">Auth</Btn>
        </div>
        <AuthModal v-model="showAuthModal" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Btn from '@/components/Common/Btn.vue';
import AuthModal from '@/components/Modals/AuthModal.vue';
import { useSelectedRoute } from '@/composables/SelectedRouteSymbol';
const selectedRoute = useSelectedRoute();

const showAuthModal = ref(false);
</script>

<style scoped></style>
