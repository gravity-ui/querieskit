import type React from 'react';
import type {NavigationCluster, RenderNavigationCluster} from './navigation';

export type ClustersListProps<T extends NavigationCluster = NavigationCluster> = {
    items: T[];
    loading?: boolean;
    error?: React.ReactNode;
    hasMore?: boolean;
    onLoadMore?: () => void;
    emptyContent?: React.ReactNode;
    renderRowItem?: RenderNavigationCluster<T>;
    onItemClick?: (cluster: T) => void;
    className?: string;
};
