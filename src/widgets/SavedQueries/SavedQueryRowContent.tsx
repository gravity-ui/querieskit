import React from 'react';
import {HistoryGroupHeader} from '../../components';
import {SavedQueryRow, SavedQuerySearchRow} from '../../modules';
import {QueryListRowRenderData} from '../../types/queryList';
import {SavedQuery} from '../../types/savedQueries';

type Props<T extends SavedQuery> = QueryListRowRenderData<T> & {
    renderAuthor?: (item: T) => React.ReactNode;
};

export const SavedQueryRowContent = <T extends SavedQuery>({
    item,
    variant,
    renderAuthor,
    ...data
}: Props<T>) => {
    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return variant === 'search' ? (
        <SavedQuerySearchRow {...data} item={item} renderAuthor={renderAuthor} />
    ) : (
        <SavedQueryRow {...data} item={item} renderAuthor={renderAuthor} />
    );
};
