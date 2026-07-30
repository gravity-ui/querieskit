import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {HistoryHeader} from '../../modules/HistoryHeader';
import {HistoryList} from '../../modules/HistoryList';
import i18n from './i18n';
import {
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistorySearchConfig,
    QueryHistorySelectionConfig,
} from '../../types/history';

export type Props<T extends QueryHistoryRow = QueryHistoryRow> = {
    className?: string;
    title?: string;
    search: QueryHistorySearchConfig;
    items: QueryHistoryItem<T>[];
    editing?: QueryHistoryEditingConfig<T>;
    selection?: QueryHistorySelectionConfig<T>;
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    onListItemClick?: (item: QueryHistoryItem<T>) => void;
};

export const QueriesHistory = <T extends QueryHistoryRow>({
    title,
    search,
    items,
    editing,
    selection,
    renderRowItem,
    getRowActions,
    onListItemClick,
    className,
}: Props<T>) => {
    return (
        <Flex direction="column" gap={1} className={className}>
            <Text variant="subheader-3">{title || i18n('title_history')}</Text>
            <HistoryHeader
                search={search.value}
                fullSearch={search.fullSearch}
                hasClear={search.hasClear}
                onUpdate={search.onUpdate}
            />
            <HistoryList
                items={items}
                editing={editing}
                selection={selection}
                renderRowItem={renderRowItem}
                getRowActions={getRowActions}
                onItemClick={onListItemClick}
            />
        </Flex>
    );
};
