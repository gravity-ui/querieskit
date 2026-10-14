import cn from 'bem-cn-lite';
import React from 'react';
import {ClusterRow} from '../../components/ClusterRow';
import {LazyList} from '../../components/LazyList';
import {NAVIGATION_ROW_HEIGHT} from '../../constants/row';
import type {ClustersListProps} from '../../types/clustersListProps';
import type {NavigationCluster} from '../../types/navigation';
export type {ClustersListProps} from '../../types/clustersListProps';

const block = cn('qp-clusters-list');

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
