import React from 'react';
import cn from 'bem-cn-lite';
import {NavigationCluster, RenderNavigationCluster} from '../../types/navigation';
import {ClusterRow} from './internal/ClusterRow';
import {LazyList} from '../../components';
import {NAVIGATION_ROW_HEIGHT} from '../../constants/row';
import './ClustersList.scss';

const block = cn('qp-clusters-list');

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

export const ClustersList = <T extends NavigationCluster = NavigationCluster>({
    items,
    loading,
    error,
    hasMore,
    onLoadMore,
    emptyContent,
    renderRowItem,
    onItemClick,
    className,
}: ClustersListProps<T>) => {
    return (
        <LazyList<T>
            className={block(null, className)}
            items={items}
            itemHeight={() => NAVIGATION_ROW_HEIGHT}
            renderItem={(cluster, isActive, index) =>
                renderRowItem?.({cluster, index, isActive}) ?? <ClusterRow cluster={cluster} />
            }
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            loading={loading}
            error={error}
            emptyContent={emptyContent}
            onItemClick={onItemClick}
        />
    );
};
