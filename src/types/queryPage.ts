import type {QueryHistoryRow} from './history';
import type {NavigationCluster, NavigationItem, NavigationMetaItem} from './navigation';
import type {QueriesSidebarProps} from './queriesSidebar';
import type {QueryEditorProps} from './queryEditor';
import type {QueryExecutionPanelProps} from './queryExecutionPanel';
import type {SavedQuery} from './savedQueries';
import type {TutorialHistoryRow} from './tutorial';
import type {QueryTabItem, QueryTabsProps} from './queryTabs';
import type {QueryComparisonProps} from './queryComparison';

/** One independent editor and execution workspace. Keep id stable until closing. */
export type QueryPageQueryTab<
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = Extract<QueryTabItem, {type: 'query'}> & {
    editorProps: QueryEditorProps<TCustom>;
    executionPanelProps: QueryExecutionPanelProps<TRow, TMetaItem>;
    /** Preferred results height in pixels, constrained to this workspace. */
    executionPanelHeight?: number;
    /** Defaults to 300. */
    defaultExecutionPanelHeight?: number;
    onExecutionPanelHeightChange?: (height: number) => void;
};

/** A comparison workspace has no query editor or execution panel. */
export type QueryPageComparisonTab = Extract<QueryTabItem, {type: 'comparison'}> & {
    comparisonProps: QueryComparisonProps;
};

export type QueryPageTab<
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = QueryPageQueryTab<TCustom, TRow, TMetaItem> | QueryPageComparisonTab;

/** Persistence and comparison data loading remain the application's responsibility. */
export type QueryPageHistoryActions<T extends QueryHistoryRow = QueryHistoryRow> = {
    onRename?: (item: T, title: string, historyTabId: string) => void;
    onDelete?: (item: T, historyTabId: string) => void;
    /** Append and activate a comparison tab with the selected rows' data. */
    onCompare?: (original: T, modified: T, historyTabId: string) => void;
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
    /** Default history menu callbacks. Custom getRowActions replaces the menu. */
    historyActions?: QueryPageHistoryActions<THistory>;
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
