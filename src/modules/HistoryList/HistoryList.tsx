import React from 'react';
import {List} from '@gravity-ui/uikit';
import {
    QueryHistoryComparisonConfig,
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistoryVisibleFieldsConfig,
} from '../../types/history';
import {HistoryRowContent} from './internal/HistoryRowContent';
import {HistoryListEmpty} from './internal/HistoryListEmpty';
import {prepareRowData} from './helpers/prepareRowData';
import {SEARCH_ROW_HEIGHT} from '../HistorySearchRow';

type Props<T extends QueryHistoryRow> = {
    selectedRowId?: T['id'];
    items: QueryHistoryItem<T>[];
    rowVariant?: 'default' | 'search';
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    editing?: QueryHistoryEditingConfig<T>;
    comparison?: QueryHistoryComparisonConfig<T>;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    onItemClick?: (item: QueryHistoryItem<T>) => void;
};

export const HistoryList = <T extends QueryHistoryRow>({
    items,
    selectedRowId,
    rowVariant = 'default',
    visibleFields,
    editing,
    comparison,
    getRowActions,
    renderRowItem,
    onItemClick,
}: Props<T>) => {
    const getItemHeight = (item: QueryHistoryItem<T>) =>
        rowVariant === 'search' && !('header' in item) ? SEARCH_ROW_HEIGHT : item.height;

    const handleItemClick = (item: QueryHistoryItem<T>) => {
        if ('header' in item || !comparison?.enabled) {
            onItemClick?.(item);
            return;
        }

        const selected = comparison.comparedRowIds.includes(item.id);
        comparison.onChange(item, !selected);
    };

    if (!items.length) {
        return <HistoryListEmpty />;
    }

    return (
        <List
            filterable={false}
            items={items}
            itemHeight={getItemHeight}
            itemsHeight={(listItems) =>
                listItems.reduce((totalHeight, item) => totalHeight + getItemHeight(item), 0)
            }
            renderItem={(item, isActive, index) => {
                const data = prepareRowData({
                    item,
                    isActive,
                    index,
                    visibleFields,
                    editing,
                    comparison,
                    getRowActions,
                });

                return renderRowItem ? (
                    renderRowItem(data)
                ) : (
                    <HistoryRowContent {...data} variant={rowVariant} />
                );
            }}
            selectedItemIndex={selectedRowId}
            onItemClick={handleItemClick}
        />
    );
};
