import React from 'react';
import cn from 'bem-cn-lite';
import {QueriesList} from '../../modules';
import {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListFilterConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListSearchConfig,
    QueryListVisibleFieldsConfig,
} from '../../types/queryList';
import {QueryHistoryRow} from '../../types/history';
import {HistoryRowContent} from './internal/HistoryRowContent';
import './QueriesHistory.scss';

export type QueriesHistoryProps<T extends QueryHistoryRow = QueryHistoryRow> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    filter?: QueryListFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    renderRowItem?: (data: QueryListRowRenderData<T>) => React.ReactNode;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    onListItemClick?: (item: QueryListItem<T>) => void;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
};

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
