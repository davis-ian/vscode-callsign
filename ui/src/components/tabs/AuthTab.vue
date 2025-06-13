<template>
    <div>
        <CurrentAuthSelect v-model="selectedAuthId" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CurrentAuthSelect from '../CurrentAuthSelect.vue';

const props = defineProps<{
    modelValue: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const selectedAuthId = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
});
</script>

<style scoped></style>
