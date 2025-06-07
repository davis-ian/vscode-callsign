<template>
    <div class="flex justify-end">
        <Btn @click="showAuthModal = true">Auth</Btn>

        <AuthModal v-model="showAuthModal" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Btn from '@/components/Btn.vue';
import AuthModal from '@/components/Modals/AuthModal.vue';

const showAuthModal = ref(false);
</script>

<style scoped></style>
