let vscodeInstance: any;

export function useVscode() {
    if (!vscodeInstance) {
        vscodeInstance = (window as any).acquireVsCodeApi();
    }
    return vscodeInstance;
}
