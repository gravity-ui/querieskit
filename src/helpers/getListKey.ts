import {QueryListItem, QueryListRow, QueryListRowVariant} from '../types/queryList';

export const getListItemKey = <T extends QueryListRow>(item: QueryListItem<T>): string =>
    'header' in item ? `h:${item.header}` : `r:${item.id}`;

export const getListKey = <T extends QueryListRow>(
    items: QueryListItem<T>[],
    variant: QueryListRowVariant,
): string => {
    const itemsKey = items.map(getListItemKey).join(',');

    return `${variant}:${itemsKey}`;
};
