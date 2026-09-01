import type {ErrorTreeItem} from '../../../types/errorTree';

export type IntermediateChain = {
    hiddenItems: ErrorTreeItem[];
    terminalItem: ErrorTreeItem;
};

export function getIntermediateChain(item: ErrorTreeItem): IntermediateChain {
    const items = [item];
    let current = item;

    while (current.children?.length === 1) {
        current = current.children[0];
        items.push(current);
    }

    return {
        hiddenItems: items.slice(0, -1),
        terminalItem: items[items.length - 1],
    };
}
