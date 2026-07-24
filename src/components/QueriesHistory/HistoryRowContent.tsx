import React from 'react';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../types/history';
import {HistoryGroupHeader} from './HistoryGroupHeader';
import {HistoryRow} from './HistoryRow';

export const HistoryRowContent = <T extends QueryHistoryRow>(
    data: QueryHistoryRowRenderData<T>,
) => {
    const {item} = data;
    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return <HistoryRow {...data} item={item} />;
};
