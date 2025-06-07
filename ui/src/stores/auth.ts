import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        headers: {} as Record<string, string>,
    }),
    actions: {
        setHeader(key: string, value: string) {
            this.headers[key] = value;
        },
        removeHeader(key: string) {
            delete this.headers[key];
        },
        clearHeaders() {
            this.headers = {};
        },
    },
});
