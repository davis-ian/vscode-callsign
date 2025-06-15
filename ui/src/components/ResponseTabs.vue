<template>
    <div class="border-b border-vs-border">
        <nav class="flex space-x-0">
            <button
                v-for="tab in availableTabs"
                :key="tab.id"
                @click="$emit('update:activeTab', tab.id)"
                class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
                :class="[
                    activeTab === tab.id
                        ? 'border-vs-bbg text-vs-bbg'
                        : 'border-transparent text-vs-efg opacity-50 hover:opacity-85',
                ]"
            >
                {{ tab.label }}
            </button>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    activeTab: string;
    showBody?: boolean;
    showHeaders?: boolean;
    showMeta?: boolean;
}>();

defineEmits(['update:activeTab']);

const availableTabs = computed(() => {
    const tabs = [];

    tabs.push({ id: 'body', label: 'Body' });

    tabs.push({ id: 'headers', label: 'Headers' });

    if (props.showMeta) {
        tabs.push({ id: 'meta', label: 'Meta' });
    }

    return tabs;
});
</script>

<style scoped></style>
