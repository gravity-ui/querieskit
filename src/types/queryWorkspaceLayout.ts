import type {ReactNode} from 'react';

export type QueryWorkspaceEditorContext = {active: boolean};
export type QueryWorkspaceExecutionContext = {
    active: boolean;
    collapsed: boolean;
    expanded: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    onExpandedChange: (expanded: boolean) => void;
};

/** Data-independent layout. Keep slot component types and keys stable to retain their state. */
export type QueryWorkspaceLayoutProps = {
    renderEditor: (context: QueryWorkspaceEditorContext) => ReactNode;
    renderExecutionPanel: (context: QueryWorkspaceExecutionContext) => ReactNode;
    /** Parent workspace visibility, also supplied to retained slot content. */
    active?: boolean;
    /** Explicit visibility; the layout never inspects query data. Hidden slots remain mounted. */
    showResults?: boolean;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    executionPanelHeight?: number;
    defaultExecutionPanelHeight?: number;
    onExecutionPanelHeightChange?: (height: number) => void;
    className?: string;
};
