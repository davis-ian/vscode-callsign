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
                        ? 'border-vs-bbg text-vs-bbg '
                        : 'border-transparent text-gray-400 hover:text-gray-200',
                ]"
            >
                {{ tab.label }}
                <!-- <span v-if="tab.count" class="ml-1 text-xs opacity-60"> ({{ tab.count }}) </span> -->
            </button>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    activeTab: string;
    hasParams?: boolean;
    hasBody?: boolean;
    showAuth?: boolean;
}>();

defineEmits(['update:activeTab']);

const availableTabs = computed(() => {
    const tabs = [];

    if (props.hasParams) {
        tabs.push({ id: 'params', label: 'Params' });
    }

    if (props.hasBody) {
        tabs.push({ id: 'body', label: 'Body' });
    }

    // tabs.push({ id: 'headers', label: 'Headers' });

    // if (props.showAuth) {
    tabs.push({ id: 'authId', label: 'Auth' });
    // }

    return tabs;
});
</script>

<style scoped></style>
