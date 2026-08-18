import React from 'react';
import {
    QueryHistoryComparisonConfig,
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistoryRowVariant,
    QueryHistoryVisibleFieldsConfig,
} from '../../types/history';
import {RowsList} from '../RowsList';
import {HistoryRowContent} from './HistoryRowContent';

export type HistoryListProps<T extends QueryHistoryRow> = {
    selectedRowId?: T['id'];
    items: QueryHistoryItem<T>[];
    rowVariant?: QueryHistoryRowVariant;
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    editing?: QueryHistoryEditingConfig<T>;
    comparison?: QueryHistoryComparisonConfig<T>;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
    renderRowItem?: (data: QueryHistoryRowRenderData<T>) => React.ReactNode;
    showFiltersHint?: boolean;
    className?: string;
    onItemClick?: (item: QueryHistoryItem<T>, index: number) => void;
};

export const HistoryList = <T extends QueryHistoryRow>({
    renderRowItem,
    ...props
}: HistoryListProps<T>) => {
    return (
        <RowsList
            {...props}
            renderRow={(data) =>
                renderRowItem ? renderRowItem(data) : <HistoryRowContent {...data} />
            }
        />
    );
};
