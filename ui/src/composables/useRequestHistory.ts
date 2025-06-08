import { ref } from 'vue';
import type { RequestSnapshot } from '@/types';

const MAX_HISTORY = 10;
const STORAGE_KEY = 'callsign_request_history';

const requestHistory = ref<RequestSnapshot[]>(load());

function load() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requestHistory.value));
}

export function useRequestHistory() {
    function addSnapshot(snapshot: RequestSnapshot) {
        requestHistory.value.unshift(snapshot);
        if (requestHistory.value.length > MAX_HISTORY) {
            requestHistory.value.length = MAX_HISTORY;
        }
        save();
    }

    function clearHistory() {
        requestHistory.value = [];
        save();
    }

    return {
        requestHistory,
        addSnapshot,
        clearHistory,
    };
}
