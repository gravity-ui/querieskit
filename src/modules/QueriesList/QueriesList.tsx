import React, {useState} from 'react';
import cn from 'bem-cn-lite';
import {FieldsSelector} from '../../components/FieldsSelector';
import {useListKey} from '../../helpers/useListKey';
import type {
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
import {EmptyContent} from '../../components/EmptyContent';
import type {QueryListPanelOptions} from '../../types/listPanel';

const block = cn('qp-queries-list');

const getPanelEmptyContent = (hasSearchOrFilter: boolean, emptyContent: React.ReactNode) => {
    if (hasSearchOrFilter) return <EmptyContent variant="nothing-found" />;
    if (emptyContent === undefined) return <EmptyContent variant="no-data" />;
    return emptyContent;
};

export type QueriesListProps<T extends QueryListRow> = QueryListPanelOptions & {
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
    variant = 'default',
    emptyContent,
    hideSearchWhenEmpty = false,
}: QueriesListProps<T>) => {
    const [localSearch, setLocalSearch] = useState(() => ({
        value: search.value ?? '',
        fullSearch: search.fullSearch ?? false,
    }));
    const searchValue = search.value ?? localSearch.value;
    const fullSearch = search.fullSearch ?? localSearch.fullSearch;
    const handleSearchUpdate: QueryListSearchConfig['onUpdate'] = (data) => {
        setLocalSearch(data);
        search.onUpdate(data);
    };
    const fullSearchAvailable = search.fullSearchAvailable !== false;
    const showSearchResults = Boolean(fullSearchAvailable && fullSearch && searchValue.trim());
    const rowVariant = showSearchResults ? 'search' : 'default';
    const listKey = useListKey(items, rowVariant, Boolean(onLoadMore));

    const isPanel = variant !== 'default';
    const hasSearchOrFilter = Boolean(searchValue.trim()) || filter?.isChanged === true;
    const hideSearch = hideSearchWhenEmpty && !items.length && !loading && !hasSearchOrFilter;
    const resolvedEmptyContent = isPanel
        ? getPanelEmptyContent(hasSearchOrFilter, emptyContent)
        : emptyContent;
    const rows = (
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
            emptyContent={resolvedEmptyContent}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={onLoadMore}
            renderLink={renderLink}
            onItemClick={onListItemClick}
        />
    );

    return (
        <HistoryLayout
            variant={variant}
            className={block({panel: isPanel}, className)}
            title={title}
            logo={logo}
            header={
                !hideSearch && (
                    <HistoryHeader
                        variant={variant}
                        className={block('header')}
                        actions={
                            visibleFields && (
                                <FieldsSelector
                                    {...visibleFields}
                                    buttonView={isPanel ? 'flat' : 'normal'}
                                />
                            )
                        }
                        search={searchValue}
                        fullSearch={fullSearch}
                        fullSearchAvailable={fullSearchAvailable}
                        hasClear={search.hasClear}
                        filter={filter}
                        onUpdate={handleSearchUpdate}
                    />
                )
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
            {isPanel ? (
                <div className={block('body', {'has-items': items.length > 0})}>{rows}</div>
            ) : (
                rows
            )}
        </HistoryLayout>
    );
};
