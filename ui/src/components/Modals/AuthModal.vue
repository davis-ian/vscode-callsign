<template>
    <div>
        <Modal v-model="isOpen">
            <Card>
                <template #title> Auth </template>

                <template #content>
                    <div class="flex flex-col gap-6 my-6">
                        <div class="flex flex-col">
                            <span>ApiKey</span>
                            <span>Custom Api Key</span>
                            <span>Name: <code>x-api-key</code></span>
                            <span>In <code>header</code></span>
                            <TextInput v-model="apiKey" placeholder="ApiKey" />
                        </div>

                        <div class="flex flex-col">
                            <span>Bearer</span>
                            <span>JWT Auth using the Bearer scheme</span>
                            <span>Name: <code>Authorization</code></span>
                            <span>In <code>header</code></span>
                            <TextInput v-model="bearer" placeholder="Bearer" />
                        </div>
                    </div>
                </template>

                <template #actions>
                    <div class="flex justify-between w-full">
                        <Btn @click="emit('update:modelValue')" variant="secondary">Close</Btn>
                        <Btn @click="getAllCreds">Get All</Btn>
                        <Btn @click="saveHeaders">Save</Btn>
                    </div>
                </template>
            </Card>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, inject } from 'vue';
import Modal from '@/components/Modal.vue';
import TextInput from '@/components/TextInput.vue';
import Card from '@/components/Card.vue';
import Btn from '@/components/Btn.vue';
import { useVscode } from '@/composables/useVscode';

const apiKey = ref('');
const bearer = ref('');

const vscode = useVscode();

async function saveHeaders() {
    const message = {
        command: 'storeAuth',
        payload: {
            name: 'My Key',
            type: 'bearer',
            value: apiKey.value,
        },
    };

    vscode?.postMessage(message);

    console.log('AUTH STORED SUCCESSFULLY');
    isOpen.value = false;
}

function getAllCreds() {
    try {
        console.log(vscode, 'vscode');
        vscode.postMessage({ command: 'getAllCredentials' });
    } catch (error) {
        console.log(error, 'error @ get all credsx');
    }
}

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue', 'authenticated']);

// Computed property to handle v-model passthrough
const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
});

onMounted(() => {
    window.addEventListener('message', event => {
        const { command, data } = event.data;

        if (command === 'allCredentials') {
            console.log('All stored  credentials: ', data);
        }
    });
});
</script>

<style scoped></style>
