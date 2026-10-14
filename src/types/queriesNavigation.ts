import type {
    NavigationCluster,
    NavigationDetailPanelConfig,
    NavigationHeaderConfig,
    NavigationItem,
    NavigationListStateConfig,
    NavigationLocation,
    NavigationParentRowConfig,
    NavigationSearchConfig,
    NavigationSortConfig,
    RenderNavigationCluster,
    RenderNavigationItem,
} from './navigation';

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
    parentRow?: NavigationParentRowConfig;
    renderClusterItem?: RenderNavigationCluster<TCluster>;
    renderNavigationItem?: RenderNavigationItem<TItem>;
    onClusterClick?: (cluster: TCluster) => void;
    onItemClick?: (item: TItem) => void;
    className?: string;
};
