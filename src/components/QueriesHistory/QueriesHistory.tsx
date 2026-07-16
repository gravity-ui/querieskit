import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {HistoryHeader} from './HistoryHeader';
import {HistoryList} from './HistoryList';
import i18n from './i18n';
import {
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
} from '../../types/history';

export type Props<T extends QueryHistoryRow = QueryHistoryRow> = {
    title?: string;
    items: QueryHistoryItem<T>[];
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    onListItemClick?: (item: QueryHistoryItem<T>) => void;
    className?: string;
};

export const QueriesHistory = <T extends QueryHistoryRow>({
    title,
    items,
    renderRowItem,
    getRowActions,
    onListItemClick,
    className,
}: Props<T>) => {
    return (
        <Flex direction="column" gap={1} className={className}>
            <Text variant="subheader-3">{title || i18n('title_history')}</Text>
            <HistoryHeader />
            <HistoryList
                items={items}
                renderRowItem={renderRowItem}
                getRowActions={getRowActions}
                onItemClick={onListItemClick}
            />
        </Flex>
    );
};
