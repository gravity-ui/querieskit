import type {AttachItem} from './attachments';
import type {VcsItem} from './queriesVcs';
import type {ReactNode} from 'react';
import type {QueryHistoryRow} from './history';
import type {NavigationCluster, NavigationItem, NavigationMetaItem} from './navigation';
import type {QueriesSidebarProps} from './queriesSidebar';
import type {QueryEditorProps} from './queryEditor';
import type {QueryExecutionPanelProps} from './queryExecutionPanel';
import type {SavedQuery} from './savedQueries';
import type {TutorialHistoryRow} from './tutorial';
import type {QueryTabItem, QueryTabsProps} from './queryTabs';
import type {QueryComparisonProps} from './queryComparison';

export type QueryPageWorkspaceContext = {
    /** Standard editor, results and their resize handle. Keep mounted in a stable position. */
    children: ReactNode;
    /** Whether this query tab is selected; does not include consumer-controlled hiding. */
    active: boolean;
};

/** One independent editor and execution workspace. Keep id stable until closing. */
export type QueryPageQueryTab<
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
    TAttachment extends AttachItem = AttachItem,
    TValue = string,
> = Extract<QueryTabItem, {type: 'query'}> & {
    editorProps: QueryEditorProps<TCustom, TAttachment, TValue>;
    executionPanelProps: QueryExecutionPanelProps<TRow, TMetaItem>;
    /** Wrap the standard workspace without changing its identity or parent structure. */
    renderWorkspace?: (context: QueryPageWorkspaceContext) => ReactNode;
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
    TAttachment extends AttachItem = AttachItem,
    TValue = string,
> = QueryPageQueryTab<TCustom, TRow, TMetaItem, TAttachment, TValue> | QueryPageComparisonTab;

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
    TVcs extends VcsItem = VcsItem,
    TAttachment extends AttachItem = AttachItem,
    TValue = string,
> = {
    /** Default history menu callbacks. Custom getRowActions replaces the menu. */
    historyActions?: QueryPageHistoryActions<THistory>;
    sidebarProps: QueriesSidebarProps<THistory, TSaved, TNavigation, TCluster, TTutorial, TVcs>;
    /** Visited workspaces stay mounted until their item is removed. */
    tabsProps: Omit<QueryTabsProps, 'items'> & {
        items: QueryPageTab<TCustom, TRow, TMetaItem, TAttachment, TValue>[];
    };
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
