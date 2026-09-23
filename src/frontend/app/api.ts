export function apiPath(path: string): string {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${path}`;
}
