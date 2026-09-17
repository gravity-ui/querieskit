import {useRef} from 'react';
import {getListItemKey, getListKey} from './getListKey';
import {QueryListItem, QueryListRow, QueryListRowVariant} from '../types/queryList';

type ListKeyState = {
    key: string;
    itemKeys: string[];
    rowVariant: QueryListRowVariant;
    paginationEnabled: boolean;
};

export const useListKey = <T extends QueryListRow>(
    items: QueryListItem<T>[],
    rowVariant: QueryListRowVariant,
    paginationEnabled: boolean,
) => {
    const itemKeys = items.map(getListItemKey);
    const currentKey = getListKey(items, rowVariant);
    const stateRef = useRef<ListKeyState | undefined>(undefined);
    const previousState = stateRef.current;
    const isAppend =
        previousState?.paginationEnabled &&
        previousState.rowVariant === rowVariant &&
        previousState.itemKeys.length <= itemKeys.length &&
        previousState.itemKeys.every((key, index) => key === itemKeys[index]);
    const key = paginationEnabled && isAppend ? previousState.key : currentKey;

    stateRef.current = {key, itemKeys, rowVariant, paginationEnabled};

    return key;
};
