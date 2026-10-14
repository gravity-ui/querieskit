import type React from 'react';
import type {
    NavigationItem,
    NavigationParentRowConfig,
    NavigationSortOrder,
    RenderNavigationItem,
} from './navigation';

export type NavigationItemsListProps<T extends NavigationItem = NavigationItem> = {
    items: T[];
    path?: string;
    search?: string;
    parentRow?: NavigationParentRowConfig;
    sort?: NavigationSortOrder;
    onSortUpdate?: (sort: NavigationSortOrder) => void;
    titleLabel: string;
    loading?: boolean;
    error?: React.ReactNode;
    hasMore?: boolean;
    onLoadMore?: () => void;
    emptyContent?: React.ReactNode;
    renderRowItem?: RenderNavigationItem<T>;
    onItemClick?: (item: T) => void;
    className?: string;
};
