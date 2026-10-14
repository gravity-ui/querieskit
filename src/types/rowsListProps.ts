import type React from 'react';
import type {ListEmptyContentProps} from './listPanel';
import type {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRow,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListRowVariant,
    QueryListVisibleFieldsConfig,
} from './queryList';

export type RowsListProps<T extends QueryListRow> = ListEmptyContentProps & {
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    rowVariant?: QueryListRowVariant;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    renderRow: (data: QueryListRowRenderData<T>) => React.ReactNode;
    showFiltersHint?: boolean;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
    className?: string;
    onItemClick?: (item: QueryListItem<T>, index: number) => void;
};
