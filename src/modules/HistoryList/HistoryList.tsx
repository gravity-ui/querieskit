import React from 'react';
import {List} from '@gravity-ui/uikit';
import {
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistorySelectionConfig,
    QueryHistoryVisibleFieldsConfig,
} from '../../types/history';
import {HistoryRowContent} from './internal/HistoryRowContent';
import {HistoryListEmpty} from './internal/HistoryListEmpty';
import {prepareRowData} from './helpers/prepareRowData';

type Props<T extends QueryHistoryRow> = {
    items: QueryHistoryItem<T>[];
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    editing?: QueryHistoryEditingConfig<T>;
    selection?: QueryHistorySelectionConfig<T>;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    onItemClick?: (item: QueryHistoryItem<T>) => void;
};

export const HistoryList = <T extends QueryHistoryRow>({
    items,
    visibleFields,
    editing,
    selection,
    getRowActions,
    renderRowItem,
    onItemClick,
}: Props<T>) => {
    const handleItemClick = (item: QueryHistoryItem<T>) => {
        if ('header' in item || !selection?.enabled) {
            onItemClick?.(item);
            return;
        }

        const selected = selection.selectedRowIds.includes(item.id);
        selection.onChange?.(item, !selected);
    };

    if (!items.length) {
        return <HistoryListEmpty />;
    }

    return (
        <List
            filterable={false}
            items={items}
            itemHeight={({height}: QueryHistoryItem<T>) => height}
            itemsHeight={(listItems) =>
                listItems.reduce((totalHeight, {height}) => totalHeight + height, 0)
            }
            renderItem={(item, isActive, index) => {
                const data = prepareRowData({
                    item,
                    isActive,
                    index,
                    visibleFields,
                    editing,
                    selection,
                    getRowActions,
                });

                return renderRowItem ? renderRowItem(data) : <HistoryRowContent {...data} />;
            }}
            onItemClick={handleItemClick}
        />
    );
};
