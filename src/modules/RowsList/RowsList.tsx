import React from 'react';
import {List} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {
    BaseHistoryRow,
    QueryHistoryComparisonConfig,
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistoryRowVariant,
    QueryHistoryVisibleFieldsConfig,
} from '../../types/history';
import {HistoryListEmpty} from '../../components';
import {prepareRowData} from './helpers/prepareRowData';
import {SEARCH_ROW_HEIGHT} from '../../constants/row';
import './RowsList.scss';

const block = cn('qp-rows-list');

export type RowsListProps<T extends BaseHistoryRow> = {
    items: QueryHistoryItem<T>[];
    selectedRowId?: T['id'];
    rowVariant?: QueryHistoryRowVariant;
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    editing?: QueryHistoryEditingConfig<T>;
    comparison?: QueryHistoryComparisonConfig<T>;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    renderRow: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    showFiltersHint?: boolean;
    className?: string;
    onItemClick?: (item: QueryHistoryItem<T>, index: number) => void;
};

export const RowsList = <T extends BaseHistoryRow>({
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
    const getItemHeight = (item: QueryHistoryItem<T>) =>
        rowVariant === 'search' && !('header' in item) ? SEARCH_ROW_HEIGHT : item.height;

    const handleItemClick = (item: QueryHistoryItem<T>, index: number) => {
        if ('header' in item || !comparison?.enabled) {
            onItemClick?.(item, index);
            return;
        }

        const selected = comparison.comparedRowIds.includes(item.id);
        comparison.onChange(item, !selected);
    };

    if (!items.length) {
        return <HistoryListEmpty showFiltersHint={showFiltersHint} className={className} />;
    }

    return (
        <List
            className={block(null, className)}
            filterable={false}
            items={items}
            itemHeight={getItemHeight}
            itemsHeight={(listItems) =>
                listItems.reduce((totalHeight, item) => totalHeight + getItemHeight(item), 0)
            }
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
            selectedItemIndex={selectedRowId}
            onItemClick={handleItemClick}
        />
    );
};
