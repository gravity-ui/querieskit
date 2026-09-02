import {ReactNode} from 'react';
import type {QueryResultColumn, QueryResultFormatterSettings} from './queryResults';
import type {LoadPathSuggestions} from './pathEditor';

export type NavigationLocation = {
    cluster: string | undefined;
    path: string | undefined;
};

export type NavigationAction<TArg> = {
    id: string;
    title: string;
    content: ReactNode;
    hidden?: boolean;
    disabled?: boolean;
    qa?: string;
    onClick: (arg: TArg) => void;
};

export type NavigationHeaderAction = NavigationAction<NavigationLocation>;

export type NavigationCluster = {
    id: string;
    title: string;
    icon?: ReactNode;
    color?: string;
    backgroundColor?: string;
    description?: string;
};

export type NavigationItemKind = 'folder' | 'file' | 'table' | 'link' | 'unknown';

export type NavigationItem = {
    path: string;
    title: string;
    icon?: ReactNode;
    kind?: NavigationItemKind;
    targetPathBroken?: boolean;
    hasChildren?: boolean;
    disabled?: boolean;
};

export type NavigationSortOrder = 'asc' | 'desc';

export type NavigationItemRowRenderData<T extends NavigationItem = NavigationItem> = {
    item: T;
    index: number;
    isActive: boolean;
    isParentRow: boolean;
};

export type NavigationClusterRowRenderData<T extends NavigationCluster = NavigationCluster> = {
    cluster: T;
    index: number;
    isActive: boolean;
};

export type RenderNavigationItem<T extends NavigationItem = NavigationItem> = (
    data: NavigationItemRowRenderData<T>,
) => ReactNode;

export type RenderNavigationCluster<T extends NavigationCluster = NavigationCluster> = (
    data: NavigationClusterRowRenderData<T>,
) => ReactNode;

export type NavigationDetailTabRenderContext = {
    search: string;
    onSearchUpdate?: (value: string) => void;
    searchPlaceholder?: string;
};

export type NavigationDetailTab = {
    id: string;
    title: string;
    content?: ReactNode;
    renderContent?: (ctx: NavigationDetailTabRenderContext) => ReactNode;
    hidden?: boolean;
    disabled?: boolean;
};

export type NavigationAsyncConfig = {
    loading?: boolean;
    loaded?: boolean;
    errorContent?: ReactNode;
};

export type NavigationSchemaSortOrder = 'ascending' | 'descending';

export type NavigationSchemaColumn = {
    name: string;
    type?: string;
    sortOrder?: NavigationSchemaSortOrder;
    required?: boolean;
    [key: string]: unknown;
};

export type NavigationSchemaConfig<
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
> = NavigationAsyncConfig & {
    columns: TColumn[];
};

export type NavigationCellValue = ReactNode;

export type NavigationPreviewRow = Record<string, NavigationCellValue>;

export type NavigationPreviewColumn<TRow extends NavigationPreviewRow = NavigationPreviewRow> =
    string | QueryResultColumn<TRow>;

export type NavigationPreviewConfig<TRow extends NavigationPreviewRow = NavigationPreviewRow> =
    NavigationAsyncConfig & {
        columns: Array<NavigationPreviewColumn<TRow>>;
        rows: TRow[];
    };

export type NavigationPreviewFormatterConfig = {
    /** Applied when every displayed preview column declares a YQL type. */
    formatterSettings?: QueryResultFormatterSettings;
    maxVisibleLines?: number;
};

export type NavigationViewRow = NavigationPreviewRow;

export type NavigationViewSectionAction<TRow extends NavigationViewRow = NavigationViewRow> =
    NavigationAction<NavigationViewSection<TRow>>;

export type NavigationViewSection<TRow extends NavigationViewRow = NavigationViewRow> =
    NavigationAsyncConfig & {
        id: string;
        title: ReactNode;
        columns: string[];
        rows: TRow[];
        expanded?: boolean;
        defaultExpanded?: boolean;
        onExpandedChange?: (expanded: boolean) => void;
        actions?: Array<NavigationViewSectionAction<TRow>>;
    };

export type NavigationViewConfig<TRow extends NavigationViewRow = NavigationViewRow> =
    NavigationAsyncConfig & {
        sections: Array<NavigationViewSection<TRow>>;
    };

export type NavigationMetaItem = {
    name: string;
    value: NavigationCellValue;
    [key: string]: unknown;
};

export type NavigationMetaGroup<TItem extends NavigationMetaItem = NavigationMetaItem> = {
    title?: string;
    items: TItem[];
};

export type NavigationMetaConfig<TItem extends NavigationMetaItem = NavigationMetaItem> =
    NavigationAsyncConfig & {
        groups: Array<NavigationMetaGroup<TItem>>;
    };

export type NavigationDetailConfig = {
    tabs: NavigationDetailTab[];
    defaultTab?: string;
    hasSearch?: boolean;
    searchPlaceholder?: string;
    actions?: NavigationHeaderAction[];
    emptyContent?: ReactNode;
};

export type ResolveNavigationDetail<T extends NavigationItem = NavigationItem> = (
    item: T,
) => NavigationDetailConfig | undefined;

export type NavigationDetailConfigFactory<T extends NavigationItem = NavigationItem> = (
    item: T,
) => NavigationDetailConfig;

export type NavigationSearchConfig = {
    value?: string;
    onUpdate?: (value: string) => void;
};

export type NavigationSortConfig = {
    value?: NavigationSortOrder;
    onUpdate?: (sort: NavigationSortOrder) => void;
};

export type NavigationListStateConfig = {
    loading?: boolean;
    error?: boolean | ReactNode;
    hasMore?: boolean;
    onLoadMore?: () => void;
};

export type NavigationHeaderConfig = {
    actions?: NavigationHeaderAction[];
    onLoadSuggestions?: LoadPathSuggestions;
};

export type NavigationDetailPanelConfig<TItem extends NavigationItem = NavigationItem> = {
    openedItem?: TItem;
    onItemOpen?: (item: TItem) => void;
    onClose?: () => void;
    resolve?: ResolveNavigationDetail<TItem>;
    search?: string;
    onSearchUpdate?: (value: string) => void;
    activeTab?: string;
    onTabUpdate?: (tab: string) => void;
    actions?: NavigationHeaderAction[];
};
