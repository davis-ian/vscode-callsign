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
                        <div class="flex gap-2">
                            <Btn @click="clearAllCreds">Logout</Btn>
                            <Btn @click="saveHeaders">Save</Btn>
                        </div>
                    </div>
                </template>
            </Card>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Modal from '@/components/Modal.vue';
import TextInput from '@/components/TextInput.vue';
import Card from '@/components/Card.vue';
import Btn from '@/components/Btn.vue';
import { useVscode } from '@/composables/useVscode';

const apiKey = ref('');
const bearer = ref('');

const vscode = useVscode();

async function saveHeaders() {
    const apiMessage = {
        command: 'storeAuth',
        payload: {
            name: 'Api Key',
            type: 'api-key',
            value: apiKey.value,
        },
    };

    const bearerMessage = {
        command: 'storeAuth',
        payload: {
            name: 'Bearer JWT',
            type: 'bearer',
            value: bearer.value,
        },
    };

    await vscode.postMessage(apiMessage);
    await vscode.postMessage(bearerMessage);

    isOpen.value = false;
}

function getAllCreds() {
    try {
        vscode.postMessage({ command: 'getAllCredentials' });
    } catch (error) {
        console.log(error, 'error @ get all creds');
    }
}

function clearAllCreds() {
    try {
        vscode.postMessage({ command: 'clearAllCreds' });

        apiKey.value = '';
        bearer.value = '';
    } catch (error) {
        console.log(error, 'error @ clear all creds');
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

        if (command === 'allCreds') {
            const bearerCred = data.find((x: any) => x.type === 'bearer');
            const apiKeyCred = data.find((x: any) => x.type === 'api-key');

            if (bearerCred) {
                vscode.postMessage({ command: 'getCredentialById', id: bearerCred.id });
            }

            if (apiKeyCred) {
                vscode.postMessage({ command: 'getCredentialById', id: apiKeyCred.id });
            }
        }

        if (command === 'credentialValue') {
            if (data.credential.type === 'bearer') {
                bearer.value = data.value;
            } else if (data.credential.type === 'api-key') {
                apiKey.value = data.value;
            }
        }
    });

    getAllCreds();
});
</script>

<style scoped></style>
