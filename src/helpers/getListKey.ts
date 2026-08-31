import {QueryListItem, QueryListRow, QueryListRowVariant} from '../types/queryList';

export const getListKey = <T extends QueryListRow>(
    items: QueryListItem<T>[],
    variant: QueryListRowVariant,
): string => {
    const itemsKey = items
        .map((item) => ('header' in item ? `h:${item.header}` : `r:${item.id}`))
        .join(',');

    return `${variant}:${itemsKey}`;
};
