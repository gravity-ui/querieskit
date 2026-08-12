import React from 'react';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../types/history';
import {HistoryGroupHeader} from '../../components';
import {HistoryRow} from '../HistoryRow';
import {HistorySearchRow} from '../HistorySearchRow';

export const HistoryRowContent = <T extends QueryHistoryRow>({
    variant,
    ...data
}: QueryHistoryRowRenderData<T>) => {
    const {item} = data;

    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return variant === 'search' ? (
        <HistorySearchRow {...data} item={item} />
    ) : (
        <HistoryRow {...data} item={item} />
    );
};
