export function getParentPath(path: string): string | undefined {
    const trimmed = path.replace(/\/+$/, '');
    const lastSlashIndex = trimmed.lastIndexOf('/');

    if (lastSlashIndex <= 0) {
        return trimmed.startsWith('/') ? '/' : undefined;
    }

    return trimmed.slice(0, lastSlashIndex);
}
