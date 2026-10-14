import type {QueryHistoryRow} from './history';
import type {NavigationCluster, NavigationItem, NavigationMetaItem} from './navigation';
import type {QueriesSidebarProps} from './queriesSidebar';
import type {QueryEditorProps} from './queryEditor';
import type {QueryExecutionPanelProps} from './queryExecutionPanel';
import type {SavedQuery} from './savedQueries';
import type {TutorialHistoryRow} from './tutorial';
import type {QueryTabItem, QueryTabsProps} from './queryTabs';

/** One independent editor and execution workspace. Keep id stable until closing. */
export type QueryPageTab<
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = QueryTabItem & {
    editorProps: QueryEditorProps<TCustom>;
    executionPanelProps: QueryExecutionPanelProps<TRow, TMetaItem>;
    /** Preferred results height in pixels, constrained to this workspace. */
    executionPanelHeight?: number;
    /** Defaults to 300. */
    defaultExecutionPanelHeight?: number;
    onExecutionPanelHeightChange?: (height: number) => void;
};

export type QueryPageProps<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = {
    sidebarProps: QueriesSidebarProps<THistory, TSaved, TNavigation, TCluster, TTutorial>;
    /** Visited workspaces stay mounted until their item is removed. */
    tabsProps: Omit<QueryTabsProps, 'items'> & {items: QueryPageTab<TCustom, TRow, TMetaItem>[]};
    /** Preferred width in pixels, constrained to the available space. */
    sidebarWidth?: number;
    /** Defaults to 300. */
    defaultSidebarWidth?: number;
    onSidebarWidthChange?: (width: number) => void;
    sidebarCollapsed?: boolean;
    defaultSidebarCollapsed?: boolean;
    onSidebarCollapsedChange?: (collapsed: boolean) => void;
    /** Parent must supply a bounded height. */
    className?: string;
};
