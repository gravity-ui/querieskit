import type {ReactNode} from 'react';

export type QueryPageLayoutHeaderContext = {
    /** Render this accessible button in your header to keep the sidebar reachable. */
    sidebarToggle: ReactNode;
    sidebarCollapsed: boolean;
};

/** A page shell independent of query widgets, tab models and application state. */
export type QueryPageLayoutProps = {
    sidebar: ReactNode;
    children: ReactNode;
    /** Nodes use the standard header with a sidebar toggle. A renderer owns its placement. */
    header?: ReactNode | ((context: QueryPageLayoutHeaderContext) => ReactNode);
    /** Preferred width in pixels; constrained to leave at least 320px for the workspace. */
    sidebarWidth?: number;
    /** Defaults to 300; the sidebar minimum is 240px. */
    defaultSidebarWidth?: number;
    onSidebarWidthChange?: (width: number) => void;
    sidebarCollapsed?: boolean;
    /** Defaults to false. Hiding the sidebar keeps its contents mounted. */
    defaultSidebarCollapsed?: boolean;
    onSidebarCollapsedChange?: (collapsed: boolean) => void;
    /** The parent must provide a bounded height. */
    className?: string;
    /** Additional classes on the layout regions, for composition and external positioning. */
    classNames?: Partial<
        Record<'layout' | 'sidebar' | 'sidebarDivider' | 'workspace' | 'content', string>
    >;
};
