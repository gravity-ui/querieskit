import type {ReactNode} from 'react';
import type {QueryHistoryRow} from './history';
import type {NavigationCluster, NavigationItem} from './navigation';
import type {QueriesHistoryProps} from './queriesHistory';
import type {QueriesNavigationProps} from './queriesNavigation';
import type {SavedQuery} from './savedQueries';
import type {SavedQueriesProps} from './savedQueriesProps';
import type {TutorialHistoryRow} from './tutorial';
import type {TutorialsHistoryProps} from './tutorialsHistory';

export type QueriesSidebarTabBase = {
    /** Unique, non-empty ID. Keep both id and type stable. */
    id: string;
    disabled?: boolean;
};

export type QueriesSidebarTabRenderContext = {active: boolean};

export type QueriesSidebarTab<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
> = QueriesSidebarTabBase &
    (
        | {type: 'history'; props: QueriesHistoryProps<THistory>}
        | {type: 'saved'; props: SavedQueriesProps<TSaved>}
        | {type: 'navigation'; props: QueriesNavigationProps<TNavigation, TCluster>}
        | {type: 'tutorials'; props: TutorialsHistoryProps<TTutorial>}
        | {
              type: 'custom';
              /** Accessible name and tooltip for the icon-only tab. */
              title: string;
              icon: ReactNode;
              renderContent: (context: QueriesSidebarTabRenderContext) => ReactNode;
          }
    );

export type QueriesSidebarProps<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
> = {
    header?: ReactNode;
    /** Array order is display order. Removed tabs lose their retained state. */
    tabs: QueriesSidebarTab<THistory, TSaved, TNavigation, TCluster, TTutorial>[];
    /** Do not switch between controlled and uncontrolled modes after mounting. */
    activeTab?: string;
    defaultActiveTab?: string;
    /** Reports user selection and uncontrolled fallback changes, not prop updates. */
    onActiveTabChange?: (id: string) => void;
    /** Hide the tab strip, for example when activeTab follows external navigation. */
    hideTabs?: boolean;
    /** Preserve visited tab contents while inactive. Default: false. */
    keepMounted?: boolean;
    className?: string;
};
