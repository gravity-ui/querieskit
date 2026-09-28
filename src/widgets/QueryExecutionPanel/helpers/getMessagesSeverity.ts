import type {ErrorTreeItem, ErrorTreeSeverity} from '../../../types/errorTree';

export function getMessagesSeverity(root?: ErrorTreeItem): ErrorTreeSeverity {
    let severity: ErrorTreeSeverity = 'info';
    const pending = root ? [root] : [];
    while (pending.length) {
        const item = pending.pop();
        if (!item) continue;
        if (item.severity === 'error') return 'error';
        if (item.severity === 'warning') severity = 'warning';
        if (item.children) {
            for (const child of item.children) pending.push(child);
        }
    }
    return severity;
}
