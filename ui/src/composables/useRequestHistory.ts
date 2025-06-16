import { ref } from 'vue';
import type { RequestSnapshot } from '@/types';
import { extensionBridge } from '@/services/ExtensionBridge';
import { vsLog } from '@/utilities/extensionLogger';

const requestHistory = ref<RequestSnapshot[]>([]);

export function useRequestHistory() {
    async function loadHistory() {
        try {
            vsLog('requesting histroy from vue');
            const history = await extensionBridge.loadRequestHistory();
            vsLog('response from extension bridge: ', history);
            requestHistory.value = Array.isArray(history) ? history : [];
        } catch (err) {
            vsLog('Failed to load request history', err);
            requestHistory.value = [];
        }
    }

    // async function addSnapshot(snapshot: RequestSnapshot) {
    //     try {
    //         vsLog('compasable add  snap', snapshot);
    //         await extensionBridge.addRequestSnapshot(snapshot);
    //         await loadHistory(); // refresh after adding
    //     } catch (err) {
    //         vsLog('Failed to add request snapshot', err);
    //     }
    // }

    async function clearHistory() {
        try {
            await extensionBridge.clearRequestHistory();
            requestHistory.value = [];
        } catch (err) {
            vsLog('Failed to clear request history', err);
        }
    }

    return {
        requestHistory,
        loadHistory,
        // addSnapshot,
        clearHistory,
    };
}
