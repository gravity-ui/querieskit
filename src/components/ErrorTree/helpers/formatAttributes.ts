import type {ErrorTreeItem} from '../../../types/errorTree';

export function formatAttributes(attributes: ErrorTreeItem['attributes']) {
    try {
        return JSON.stringify(attributes, null, 2);
    } catch {
        return null;
    }
}
