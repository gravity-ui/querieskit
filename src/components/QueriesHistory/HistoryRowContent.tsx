import React from 'react';
import {QueryHistoryItem, QueryHistoryRow, QueryHistoryRowAction} from '../../types/history';
import {HistoryGroupHeader} from './HistoryGroupHeader';
import {HistoryRow} from './HistoryRow';

export type Props<T extends QueryHistoryRow> = {
    item: QueryHistoryItem<T>;
    isActive: boolean;
    actions?: QueryHistoryRowAction<T>[];
};

export const HistoryRowContent = <T extends QueryHistoryRow>({
    item,
    actions,
    isActive,
}: Props<T>) => {
    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return <HistoryRow item={item} actions={actions} isActive={isActive} />;
};
