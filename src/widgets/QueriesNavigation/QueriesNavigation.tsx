import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {ClustersList, NavigationDetail, NavigationHeader, NavigationItemsList} from '../../modules';
import {EmptyContent, SearchWithButtons} from '../../components';
import {
    NavigationCluster,
    NavigationDetailConfig,
    NavigationDetailPanelConfig,
    NavigationHeaderConfig,
    NavigationItem,
    NavigationListStateConfig,
    NavigationLocation,
    NavigationSearchConfig,
    NavigationSortConfig,
    RenderNavigationCluster,
    RenderNavigationItem,
} from '../../types/navigation';
import {createEmptyDetailConfig} from './helpers/createEmptyDetailConfig';
import i18n from './i18n';
import cn from 'bem-cn-lite';
import './QueriesNavigation.scss';

const block = cn('qp-queries-navigation');

export type QueriesNavigationProps<
    TItem extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
> = {
    location: NavigationLocation;
    onUpdate: (location: NavigationLocation) => void;
    clusters?: TCluster[];
    items?: TItem[];
    header?: NavigationHeaderConfig;
    search?: NavigationSearchConfig;
    sort?: NavigationSortConfig;
    listState?: NavigationListStateConfig;
    detail?: NavigationDetailPanelConfig<TItem>;
    renderClusterItem?: RenderNavigationCluster<TCluster>;
    renderNavigationItem?: RenderNavigationItem<TItem>;
    onClusterClick?: (cluster: TCluster) => void;
    onItemClick?: (item: TItem) => void;
    className?: string;
};

type NavigationBody<TItem extends NavigationItem> =
    | {type: 'loading'}
    | {type: 'details'; item: TItem; config: NavigationDetailConfig}
    | {type: 'clusters'}
    | {type: 'items'};

export const QueriesNavigation = <
    TItem extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
>({
    location,
    onUpdate,
    clusters = [],
    items = [],
    header,
    search,
    sort,
    listState,
    detail,
    renderClusterItem,
    renderNavigationItem,
    onClusterClick,
    onItemClick,
    className,
}: QueriesNavigationProps<TItem, TCluster>) => {
    const {loading, error, errorContent, hasMore, onLoadMore} = listState ?? {};
    const {actions, onLoadSuggestions} = header ?? {};
    const {value: searchValue, onUpdate: onSearchUpdate} = search ?? {};
    const {value: sortValue, onUpdate: onSortUpdate} = sort ?? {};
    const {
        openedItem,
        onItemOpen,
        onClose: onDetailClose,
        resolve: resolveDetail,
        search: detailSearch,
        onSearchUpdate: onDetailSearchUpdate,
        activeTab: detailActiveTab,
        onTabUpdate: onDetailTabUpdate,
    } = detail ?? {};

    const resolvedErrorContent = (error || errorContent) && (
        <Text color="danger" className={block('error')}>
            {errorContent ?? i18n('alert_load-error')}
        </Text>
    );

    const openedConfig = openedItem
        ? (resolveDetail?.(openedItem) ?? createEmptyDetailConfig(openedItem))
        : undefined;

    const body: NavigationBody<TItem> = (() => {
        if (loading) {
            return {type: 'loading'};
        }
        if (openedItem && openedConfig) {
            return {type: 'details', item: openedItem, config: openedConfig};
        }
        if (!location.cluster) {
            return {type: 'clusters'};
        }
        return {type: 'items'};
    })();

    const handleNavigate = (next: NavigationLocation) => {
        onDetailClose?.();
        onUpdate(next);
    };

    const handleClusterClick = (cluster: TCluster) => {
        handleNavigate({cluster: cluster.id, path: undefined});
        onClusterClick?.(cluster);
    };

    const handleItemClick = (item: TItem) => {
        if (item.hasChildren) {
            handleNavigate({cluster: location.cluster, path: item.path});
        } else {
            onItemOpen?.(item);
        }
        onItemClick?.(item);
    };

    if (body.type === 'details') {
        return (
            <NavigationDetail
                key={body.item.path}
                config={body.config}
                location={{cluster: location.cluster, path: body.item.path}}
                actions={actions}
                onUpdate={handleNavigate}
                onLoadSuggestions={onLoadSuggestions}
                search={detailSearch}
                onSearchUpdate={onDetailSearchUpdate}
                activeTab={detailActiveTab}
                onTabUpdate={onDetailTabUpdate}
                className={block(null, className)}
            />
        );
    }

    return (
        <Flex direction="column" gap={1} className={block(null, className)}>
            <NavigationHeader
                location={location}
                actions={actions}
                onUpdate={handleNavigate}
                onLoadSuggestions={onLoadSuggestions}
            />
            <SearchWithButtons
                placeholder={i18n('field_search-placeholder')}
                value={searchValue}
                onUpdate={onSearchUpdate}
            />
            {body.type === 'clusters' || (body.type === 'loading' && !location.cluster) ? (
                <ClustersList<TCluster>
                    items={clusters}
                    loading={loading}
                    error={resolvedErrorContent}
                    hasMore={hasMore}
                    onLoadMore={onLoadMore}
                    emptyContent={
                        <EmptyContent variant={searchValue ? 'nothing-found' : 'no-clusters'} />
                    }
                    renderRowItem={renderClusterItem}
                    onItemClick={handleClusterClick}
                />
            ) : (
                <NavigationItemsList<TItem>
                    items={items}
                    path={location.path}
                    search={searchValue}
                    sort={sortValue}
                    onSortUpdate={onSortUpdate}
                    titleLabel={i18n('title_name')}
                    loading={loading}
                    error={resolvedErrorContent}
                    hasMore={hasMore}
                    onLoadMore={onLoadMore}
                    emptyContent={
                        <EmptyContent variant={searchValue ? 'nothing-found' : 'no-files'} />
                    }
                    renderRowItem={renderNavigationItem}
                    onItemClick={handleItemClick}
                />
            )}
        </Flex>
    );
};
