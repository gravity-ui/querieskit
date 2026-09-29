import React from 'react';
import {HistoryGroupHeader} from '../../../components/HistoryGroupHeader';
import {HistoryRow} from '../../../modules/HistoryRow';
import {HistorySearchRow} from '../../../modules/HistorySearchRow';
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
