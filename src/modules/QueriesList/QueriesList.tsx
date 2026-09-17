import React from 'react';
import cn from 'bem-cn-lite';
import {FieldsSelector} from '../../components';
import {useListKey} from '../../helpers/useListKey';
import {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListFilterConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRow,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListSearchConfig,
    QueryListVisibleFieldsConfig,
} from '../../types/queryList';
import {HistoryComparisonActions} from '../HistoryComparisonActions';
import {HistoryHeader} from '../HistoryHeader';
import {HistoryLayout} from '../HistoryLayout';
import {RowsList} from '../RowsList';
import './QueriesList.scss';

const block = cn('qp-queries-list');

export type QueriesListProps<T extends QueryListRow> = {
    className?: string;
    title: React.ReactNode;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    filter?: QueryListFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    renderRow: (data: QueryListRowRenderData<T>) => React.ReactNode;
    onListItemClick?: (item: QueryListItem<T>) => void;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
};

export const QueriesList = <T extends QueryListRow>({
    title,
    logo,
    search,
    filter,
    items,
    selectedRowId,
    editing,
    comparison,
    visibleFields,
    getRowActions,
    renderRow,
    onListItemClick,
    hasMore,
    loading,
    onLoadMore,
    renderLink,
    className,
}: QueriesListProps<T>) => {
    const fullSearchAvailable = search.fullSearchAvailable !== false;
    const showSearchResults = Boolean(
        fullSearchAvailable && search.fullSearch && search.value?.trim(),
    );
    const rowVariant = showSearchResults ? 'search' : 'default';
    const listKey = useListKey(items, rowVariant, Boolean(onLoadMore));

    return (
        <HistoryLayout
            className={block(null, className)}
            title={title}
            logo={logo}
            actions={visibleFields && <FieldsSelector {...visibleFields} />}
            header={
                <HistoryHeader
                    className={block('header')}
                    search={search.value}
                    fullSearch={search.fullSearch}
                    fullSearchAvailable={fullSearchAvailable}
                    hasClear={search.hasClear}
                    filter={filter}
                    onUpdate={search.onUpdate}
                />
            }
            footer={
                comparison && (
                    <HistoryComparisonActions
                        comparison={comparison}
                        className={block('comparison-actions')}
                    />
                )
            }
        >
            <RowsList
                key={listKey}
                items={items}
                rowVariant={rowVariant}
                selectedRowId={selectedRowId}
                visibleFields={visibleFields}
                editing={editing}
                comparison={comparison}
                getRowActions={getRowActions}
                renderRow={renderRow}
                showFiltersHint={Boolean(filter)}
                hasMore={hasMore}
                loading={loading}
                onLoadMore={onLoadMore}
                renderLink={renderLink}
                onItemClick={onListItemClick}
            />
        </HistoryLayout>
    );
};
