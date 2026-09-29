import React from 'react';
import cn from 'bem-cn-lite';
import {QueriesList} from '../../modules/QueriesList';
import type {QueryHistoryRow} from '../../types/history';
import {HistoryRowContent} from './internal/HistoryRowContent';
import './QueriesHistory.scss';

export type {QueriesHistoryProps} from '../../types/queriesHistory';
import type {QueriesHistoryProps} from '../../types/queriesHistory';

const block = cn('qp-query-history');

export const QueriesHistory = <T extends QueryHistoryRow>({
    title,
    logo,
    search,
    filter,
    items,
    selectedRowId,
    editing,
    comparison,
    visibleFields,
    renderRowItem,
    getRowActions,
    onListItemClick,
    hasMore,
    loading,
    onLoadMore,
    renderLink,
    className,
}: QueriesHistoryProps<T>) => {
    return (
        <QueriesList
            className={block(null, className)}
            title={title}
            logo={logo}
            search={search}
            filter={filter}
            items={items}
            selectedRowId={selectedRowId}
            visibleFields={visibleFields}
            editing={editing}
            comparison={comparison}
            getRowActions={getRowActions}
            renderRow={(data) =>
                renderRowItem ? renderRowItem(data) : <HistoryRowContent {...data} />
            }
            onListItemClick={onListItemClick}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={onLoadMore}
            renderLink={renderLink}
        />
    );
};
