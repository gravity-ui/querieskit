import type {ReactNode} from 'react';
import {isEmptyValue} from '../../../helpers/isEmptyValue';
import type {NavigationMetaGroup, NavigationMetaItem} from '../../../types/navigation';
import type metaI18n from '../i18n';

export type PreparedMetaItem = {
    name: string;
    value: ReactNode;
};

export type PreparedMetaGroup = {
    title?: string;
    items: PreparedMetaItem[];
};

export function buildMetaGroups<TItem extends NavigationMetaItem>(
    groups: Array<NavigationMetaGroup<TItem>>,
    i18n: typeof metaI18n,
): PreparedMetaGroup[] {
    return groups.map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
            name: item.name,
            value: isEmptyValue(item.value) ? i18n('value_empty') : item.value,
        })),
    }));
}
