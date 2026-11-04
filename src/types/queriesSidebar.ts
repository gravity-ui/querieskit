import type {QueriesVcsProps, VcsItem} from './queriesVcs';
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

type StandardSidebarContent<TProps> =
    | {props: TProps; renderContent?: never}
    | {
          props?: never;
          /** Keep the standard tab label/icon and provide a component with its own data hooks. */
          renderContent: (context: QueriesSidebarTabRenderContext) => ReactNode;
      };

export type QueriesSidebarTab<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
    TVcs extends VcsItem = VcsItem,
> = QueriesSidebarTabBase &
    (
        | ({type: 'history'} & StandardSidebarContent<QueriesHistoryProps<THistory>>)
        | ({type: 'saved'} & StandardSidebarContent<SavedQueriesProps<TSaved>>)
        | ({type: 'navigation'} & StandardSidebarContent<
              QueriesNavigationProps<TNavigation, TCluster>
          >)
        | ({type: 'vcs'} & StandardSidebarContent<QueriesVcsProps<TVcs>>)
        | ({type: 'tutorials'} & StandardSidebarContent<TutorialsHistoryProps<TTutorial>>)
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
    TVcs extends VcsItem = VcsItem,
> = {
    header?: ReactNode;
    /** Array order is display order. Removed tabs lose their retained state. */
    tabs: QueriesSidebarTab<THistory, TSaved, TNavigation, TCluster, TTutorial, TVcs>[];
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
