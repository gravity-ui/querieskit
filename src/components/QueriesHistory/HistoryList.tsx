import React from 'react';
import {List} from '@gravity-ui/uikit';
import {
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
} from '../../types/history';
import cn from 'bem-cn-lite';
import {HistoryRowContent} from './HistoryRowContent';

type Props<T extends QueryHistoryRow> = {
    items: QueryHistoryItem<T>[];
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    onItemClick?: (item: QueryHistoryItem<T>) => void;
};

const block = cn('qp-history-list');

export const HistoryList = <T extends QueryHistoryRow>({
    items,
    getRowActions,
    renderRowItem,
    onItemClick,
}: Props<T>) => {
    return (
        <List
            className={block()}
            filterable={false}
            items={items}
            itemHeight={({height}: QueryHistoryItem<T>) => height}
            itemsHeight={(listItems) =>
                listItems.reduce((acc, {height}) => {
                    acc += height;
                    return acc;
                }, 0)
            }
            renderItem={(item, isActive) => {
                const actions =
                    'header' in item || !getRowActions ? undefined : getRowActions(item);

                return renderRowItem ? (
                    renderRowItem({item, isActive, actions})
                ) : (
                    <HistoryRowContent item={item} actions={actions} isActive={isActive} />
                );
            }}
            onItemClick={onItemClick}
        />
    );
};
