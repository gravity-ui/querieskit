import type React from 'react';
import type {QueryListPanelOptions} from './listPanel';
import type {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListFilterConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRow,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListSearchConfig,
    QueryListVisibleFieldsConfig,
} from './queryList';

export type QueriesListProps<T extends QueryListRow> = QueryListPanelOptions & {
    className?: string;
    title: React.ReactNode;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    filter?: QueryListFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    renderRow: (data: QueryListRowRenderData<T>) => React.ReactNode;
    onListItemClick?: (item: QueryListItem<T>) => void;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
};
