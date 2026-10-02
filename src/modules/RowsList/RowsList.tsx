import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import type {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRow,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListRowVariant,
    QueryListVisibleFieldsConfig,
} from '../../types/queryList';
import {EmptyContent} from '../../components/EmptyContent';
import {LazyList} from '../../components/LazyList';
import {prepareRowData} from './helpers/prepareRowData';
import {SEARCH_ROW_HEIGHT} from '../../constants/row';
import './RowsList.scss';
import type {ListEmptyContentProps} from '../../types/listPanel';

const block = cn('qp-rows-list');

export type RowsListProps<T extends QueryListRow> = ListEmptyContentProps & {
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    rowVariant?: QueryListRowVariant;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    renderRow: (data: QueryListRowRenderData<T>) => React.ReactNode;
    showFiltersHint?: boolean;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
    className?: string;
    onItemClick?: (item: QueryListItem<T>, index: number) => void;
};

export const RowsList = <T extends QueryListRow>({
    items,
    selectedRowId,
    rowVariant = 'default',
    visibleFields,
    editing,
    comparison,
    getRowActions,
    renderRow,
    showFiltersHint,
    emptyContent,
    hasMore,
    loading,
    onLoadMore,
    renderLink,
    className,
    onItemClick,
}: RowsListProps<T>) => {
    const listItems = useMemo(
        () => items.map((item) => ('header' in item ? {...item, disabled: true} : item)),
        [items],
    );
    const getItemHeight = (item: QueryListItem<T>) =>
        rowVariant === 'search' && !('header' in item) ? SEARCH_ROW_HEIGHT : item.height;
    const selectedItemIndex =
        selectedRowId === undefined
            ? undefined
            : items.findIndex((item) => !('header' in item) && item.id === selectedRowId);

    const handleItemClick = (item: QueryListItem<T>, index: number) => {
        if ('header' in item || !comparison?.enabled) {
            onItemClick?.(item, index);
            return;
        }

        const selected = comparison.comparedRowIds.includes(item.id);
        comparison.onChange(item, !selected);
    };

    return (
        <LazyList<QueryListItem<T>>
            className={block(null, className)}
            items={listItems}
            itemHeight={getItemHeight}
            renderItem={(_item, isActive, index) =>
                renderRow(
                    prepareRowData({
                        item: items[index],
                        isActive,
                        index,
                        variant: rowVariant,
                        visibleFields,
                        editing,
                        comparison,
                        getRowActions,
                        renderLink,
                    }),
                )
            }
            selectedItemIndex={selectedItemIndex}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={onLoadMore}
            emptyContent={
                emptyContent === undefined ? (
                    <EmptyContent
                        variant={showFiltersHint ? 'nothing-found' : 'no-files'}
                        className={className}
                    />
                ) : (
                    emptyContent
                )
            }
            onItemClick={handleItemClick}
        />
    );
};
