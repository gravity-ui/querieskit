import type React from 'react';
import type {
    QueryListFilterConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRowRenderData,
    QueryListSearchConfig,
} from './queryList';
import type {TutorialHistoryRow} from './tutorial';

export type TutorialsHistoryProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    filter?: QueryListFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    renderRowItem?: (data: QueryListRowRenderData<T>) => React.ReactNode;
    onListItemClick?: (item: QueryListItem<T>) => void;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
};
