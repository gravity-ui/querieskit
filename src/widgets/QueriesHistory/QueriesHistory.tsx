import React from 'react';
import {HistoryHeader, HistoryLayout, HistoryList} from '../../modules';
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
import {getListKey} from '../../helpers/getListKey';
import {ComparisonActions} from './ComparisonActions';
import cn from 'bem-cn-lite';
import './QueriesHistory.scss';

export type QueriesHistoryProps<T extends QueryHistoryRow = QueryHistoryRow> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
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
    logo,
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
    const rowVariant = showSearchResults ? 'search' : 'default';

    return (
        <HistoryLayout
            className={block(null, className)}
            title={title || i18n('title_history')}
            logo={logo}
            actions={visibleFields && <FieldsSelector {...visibleFields} />}
            header={
                <HistoryHeader
                    search={search.value}
                    fullSearch={search.fullSearch}
                    hasClear={search.hasClear}
                    filter={filter}
                    onUpdate={search.onUpdate}
                />
            }
            footer={
                comparison && (
                    <ComparisonActions
                        comparison={comparison}
                        className={block('comparison-actions')}
                    />
                )
            }
        >
            <HistoryList
                key={getListKey(items, rowVariant)}
                items={items}
                rowVariant={rowVariant}
                selectedRowId={selectedRowId}
                visibleFields={visibleFields}
                editing={editing}
                comparison={comparison}
                renderRowItem={renderRowItem}
                getRowActions={getRowActions}
                showFiltersHint={Boolean(filter)}
                onItemClick={onListItemClick}
            />
        </HistoryLayout>
    );
};
