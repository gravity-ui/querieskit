import type {HistoryFilterConfig} from './historyFilter';
import type React from 'react';
import type {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListSearchConfig,
} from './queryList';
import type {SavedQuery} from './savedQueries';

export type SavedQueriesProps<T extends SavedQuery = SavedQuery> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    filter?: HistoryFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    renderAuthor?: (item: T) => React.ReactNode;
    renderRowItem?: (data: QueryListRowRenderData<T>) => React.ReactNode;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    onListItemClick?: (item: QueryListItem<T>) => void;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
};
