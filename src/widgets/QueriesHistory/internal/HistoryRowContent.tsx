import React from 'react';
import {HistoryGroupHeader} from '../../../components';
import {HistoryRow, HistorySearchRow} from '../../../modules';
import {QueryListRowRenderData} from '../../../types/queryList';
import {QueryHistoryRow} from '../../../types/history';

export const HistoryRowContent = <T extends QueryHistoryRow>({
    variant,
    ...data
}: QueryListRowRenderData<T>) => {
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
