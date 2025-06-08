/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare global {
    interface Window {
        addEventListener(
            type: 'message',
            listener: (event: MessageEvent) => void,
            options?: boolean | AddEventListenerOptions,
        ): void;
    }

    function acquireVsCodeApi(): {
        postMessage(message: any): void;
        setState(state: any): void;
        getState(): any;
    };
}

export {};
