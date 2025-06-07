/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// declare global {
//     interface Window {
//         acquireVsCodeApi: () => {
//             postMessage: (msg: any) => void;
//             setState: (state: any) => void;
//             getState: () => any;
//         };
//     }
// }
