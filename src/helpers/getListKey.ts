import {BaseHistoryRow, QueryHistoryItem, QueryHistoryRowVariant} from '../types/history';

export const getListKey = <T extends BaseHistoryRow>(
    items: QueryHistoryItem<T>[],
    variant: QueryHistoryRowVariant,
): string => {
    const itemsKey = items
        .map((item) => ('header' in item ? `h:${item.header}` : `r:${item.id}`))
        .join(',');

    return `${variant}:${itemsKey}`;
};
