export function getMethodColorClass(method: string) {
    switch (method.toLowerCase()) {
        case 'post':
            return 'text-green-400';
        case 'get':
            return 'text-blue-400';
        case 'put':
            return 'text-amber-400';
        case 'patch':
            return 'text-amber-400';
        case 'delete':
            return 'text-red-400';
        default:
            return 'text-vs-bfg';
    }
}
