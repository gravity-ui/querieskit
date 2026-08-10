import React from 'react';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../types/history';
import {HistoryGroupHeader} from './HistoryGroupHeader';
import {HistoryRow} from '../HistoryRow';
import {HistorySearchRow} from '../HistorySearchRow';

export const HistoryRowContent = <T extends QueryHistoryRow>(
    data: QueryHistoryRowRenderData<T> & {variant: 'default' | 'search'},
) => {
    const {item, variant} = data;
    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return variant === 'search' ? (
        <HistorySearchRow {...data} item={item} />
    ) : (
        <HistoryRow {...data} item={item} />
    );
};
