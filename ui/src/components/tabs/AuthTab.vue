<template>
    <div>
        <CurrentAuthSelect v-model="selectedAuthId" />
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
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

watch(selectedAuthId, (newVal, _oldVal) => {
    console.log(newVal, 'authId watcher @ auth TAB');
});
</script>

<style scoped></style>
