<template>
    <pre class="overflow-x-auto p-2 flex-grow h-full text-xs border rounded"><code>{{ content }}</code></pre>
</template>

<script setup lang="ts">
defineProps<{
    content: string | object | null | undefined;
}>();
</script>

<style scoped>
/* pre code {
    background-color: transparent !important;
} */
</style>
