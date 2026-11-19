import type React from 'react';
import type {
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRowRenderData,
    QueryListSearchConfig,
} from './queryList';
import type {TutorialHistoryRow} from './tutorial';

export type TutorialsEngineOption = {
    id: string;
    title: string;
};

export type TutorialsEngineFilterConfig = {
    /** No selector is shown when engines are missing or empty. */
    engines?: readonly TutorialsEngineOption[];
    /** Both null and undefined select All. */
    value?: string | null;
    /** Selecting All emits null. The application owns filtering and pagination. */
    onUpdate: (engineId: string | null) => void;
};

export type TutorialsHistoryProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    engineFilter?: TutorialsEngineFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    renderRowItem?: (data: QueryListRowRenderData<T>) => React.ReactNode;
    onListItemClick?: (item: QueryListItem<T>) => void;
    hasMore?: boolean;
    loading?: boolean;
    onLoadMore?: () => void;
    renderLink?: QueryListLinkRenderer;
};
