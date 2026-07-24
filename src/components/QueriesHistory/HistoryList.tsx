import React from 'react';
import {List} from '@gravity-ui/uikit';
import {
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistorySelectionConfig,
} from '../../types/history';
import cn from 'bem-cn-lite';
import {HistoryRowContent} from './HistoryRowContent';
import {prepareRowData} from './helpers/prepareRowData';

type Props<T extends QueryHistoryRow> = {
    items: QueryHistoryItem<T>[];
    editing?: QueryHistoryEditingConfig<T>;
    selection?: QueryHistorySelectionConfig<T>;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    onItemClick?: (item: QueryHistoryItem<T>) => void;
};

const block = cn('qp-history-list');

export const HistoryList = <T extends QueryHistoryRow>({
    items,
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

    return (
        <List
            className={block()}
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
