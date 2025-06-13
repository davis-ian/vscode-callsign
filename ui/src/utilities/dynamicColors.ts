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

export function getStatusColorClass(status: number) {
    if (status >= 200 && status < 300) {
        return 'text-green-400'; // Success
    } else if (status >= 300 && status < 400) {
        return 'text-blue-400'; // Redirect
    } else if (status >= 400 && status < 500) {
        return 'text-amber-400'; // Client Error
    } else if (status >= 500) {
        return 'text-red-400'; // Server Error
    } else {
        return 'text-vs-bfg'; // Unknown or custom default
    }
}
