import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {HistoryHeader, HistoryList} from '../../modules';
import i18n from './i18n';
import {
    QueryHistoryComparisonConfig,
    QueryHistoryEditingConfig,
    QueryHistoryFilterConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistorySearchConfig,
    QueryHistoryVisibleFieldsConfig,
} from '../../types/history';
import {FieldsSelector} from '../../components';
import {ComparisonActions} from './ComparisonActions';
import cn from 'bem-cn-lite';
import './QueriesHistory.scss';

export type QueriesHistoryProps<T extends QueryHistoryRow = QueryHistoryRow> = {
    className?: string;
    title?: string;
    search: QueryHistorySearchConfig;
    filter?: QueryHistoryFilterConfig;
    items: QueryHistoryItem<T>[];
    selectedRowId?: T['id'];
    editing?: QueryHistoryEditingConfig<T>;
    comparison?: QueryHistoryComparisonConfig<T>;
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    onListItemClick?: (item: QueryHistoryItem<T>) => void;
};

const block = cn('qp-query-history');

export const QueriesHistory = <T extends QueryHistoryRow>({
    title,
    search,
    filter,
    items,
    selectedRowId,
    editing,
    comparison,
    visibleFields,
    renderRowItem,
    getRowActions,
    onListItemClick,
    className,
}: QueriesHistoryProps<T>) => {
    const showSearchResults = Boolean(search.fullSearch && search.value?.trim());

    const historyListKey = `${showSearchResults ? 'search' : 'default'}:${items
        .map((item) => ('header' in item ? `h:${item.header}` : `r:${item.id}`))
        .join(',')}`;

    return (
        <Flex direction="column" gap={1} className={block(null, className)}>
            <Flex alignItems="center" justifyContent="space-between">
                <div>logo</div>
                {visibleFields && <FieldsSelector {...visibleFields} />}
            </Flex>
            <Text variant="subheader-1">{title || i18n('title_history')}</Text>
            <HistoryHeader
                search={search.value}
                fullSearch={search.fullSearch}
                hasClear={search.hasClear}
                filter={filter}
                onUpdate={search.onUpdate}
            />
            <HistoryList
                key={historyListKey}
                items={items}
                rowVariant={showSearchResults ? 'search' : 'default'}
                selectedRowId={selectedRowId}
                visibleFields={visibleFields}
                editing={editing}
                comparison={comparison}
                renderRowItem={renderRowItem}
                getRowActions={getRowActions}
                onItemClick={onListItemClick}
            />
            {comparison && (
                <ComparisonActions
                    comparison={comparison}
                    className={block('comparison-actions')}
                />
            )}
        </Flex>
    );
};
