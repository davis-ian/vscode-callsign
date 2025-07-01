<template>
    <div>
        <div>headers</div>
        <div class="border-2 border-purple-600">
            {{ props.route }}
        </div>
        <div class="border-2 border-lime-600">
            {{ props.modelValue }}
        </div>
    </div>
</template>

<script setup lang="ts">
import type { OpenApiRoute } from '@/types';

const props = defineProps<{
    route: OpenApiRoute | null;
    modelValue: Record<string, string>;
}>();
</script>

<style scoped></style>
