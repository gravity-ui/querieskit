import {ReactNode} from 'react';
import type {LoadPathSuggestions} from './pathEditor';

export type NavigationLocation = {
    cluster: string | undefined;
    path: string | undefined;
};

export type NavigationHeaderAction = {
    id: string;
    title: string;
    content: ReactNode;
    hidden?: boolean;
    disabled?: boolean;
    qa?: string;
    onClick: (location: NavigationLocation) => void;
};

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

export type NavigationDetailTab = {
    id: string;
    title: string;
    content: ReactNode;
    hidden?: boolean;
    disabled?: boolean;
};

export type NavigationDetailConfig = {
    tabs: NavigationDetailTab[];
    defaultTab?: string;
    hasSearch?: boolean;
    searchPlaceholder?: string;
    actions?: NavigationHeaderAction[];
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
    /** Whether loading failed. Ignored when `errorContent` is set. */
    error?: boolean;
    /** Custom error content; implies an error state even without `error: true`. */
    errorContent?: ReactNode;
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
};
