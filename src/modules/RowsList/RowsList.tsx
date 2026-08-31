import React from 'react';
import cn from 'bem-cn-lite';
import {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListItem,
    QueryListRow,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListRowVariant,
    QueryListVisibleFieldsConfig,
} from '../../types/queryList';
import {EmptyContent, LazyList} from '../../components';
import {prepareRowData} from './helpers/prepareRowData';
import {SEARCH_ROW_HEIGHT} from '../../constants/row';
import './RowsList.scss';

const block = cn('qp-rows-list');

export type RowsListProps<T extends QueryListRow> = {
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    rowVariant?: QueryListRowVariant;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    renderRow: (data: QueryListRowRenderData<T>) => React.ReactNode;
    showFiltersHint?: boolean;
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
    className,
    onItemClick,
}: RowsListProps<T>) => {
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

    if (!items.length) {
        return (
            <EmptyContent
                variant={showFiltersHint ? 'nothing-found' : 'no-files'}
                className={className}
            />
        );
    }

    return (
        <LazyList<QueryListItem<T>>
            className={block(null, className)}
            items={items}
            itemHeight={getItemHeight}
            renderItem={(item, isActive, index) =>
                renderRow(
                    prepareRowData({
                        item,
                        isActive,
                        index,
                        variant: rowVariant,
                        visibleFields,
                        editing,
                        comparison,
                        getRowActions,
                    }),
                )
            }
            selectedItemIndex={selectedItemIndex}
            onItemClick={handleItemClick}
        />
    );
};
