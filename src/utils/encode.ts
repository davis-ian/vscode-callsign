export function encodePathForUrl(path: string): string {
    // Remove leading slash and encode path segments
    return path
        .substring(1)
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
}
