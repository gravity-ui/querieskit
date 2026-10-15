import cn from 'bem-cn-lite';
import React, {useMemo} from 'react';
import {EmptyContent} from '../../components/EmptyContent';
import {LazyList} from '../../components/LazyList';
import {SEARCH_ROW_HEIGHT} from '../../constants/row';
import type {QueryListItem, QueryListRow} from '../../types/queryList';
import type {RowsListProps} from '../../types/rowsListProps';
import {prepareRowData} from './helpers/prepareRowData';
import './RowsList.scss';
export type {RowsListProps} from '../../types/rowsListProps';

const block = cn('qp-rows-list');

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
