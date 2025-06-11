<template>
    <div class="rounded-lg border border-vs-border bg-vs-ibg text-vs-fg shadow p-4 w-full max-w-md">
        <div v-if="$slots.title" class="mb-4 font-bold text-lg">
            <slot name="title" />
        </div>

        <div v-if="$slots.content" class="mb-4">
            <slot name="content" />
        </div>

        <div v-if="$slots.actions" class="flex justify-end gap-2 pt-2 border-t border-vs-border pt-4">
            <slot name="actions" />
        </div>
    </div>
</template>

<script setup lang="ts">
// No props needed — all content is passed via slots
</script>
