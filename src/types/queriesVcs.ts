import type {ReactNode} from 'react';
import type {
    NavigationAction,
    NavigationItem,
    NavigationListStateConfig,
    NavigationSearchConfig,
    NavigationSortConfig,
} from './navigation';
import type {PathEditorSuggestion} from './pathEditor';

export type VcsItem = NavigationItem & {kind: 'folder' | 'file'; sourceUrl?: string};
export type VcsLocation = {
    providerId?: string;
    /** Repository selected by the application; required for browsing when repositories is supplied. */
    repositoryId?: string;
    branch?: string;
    path: string;
};
export type VcsOption = {id: string; title: string; disabled?: boolean};
export type VcsSelectorConfig = {items: VcsOption[]; loading?: boolean; error?: ReactNode};
/** Loading state for the current provider, repository, branch and directory. */
export type VcsListStateConfig = NavigationListStateConfig & {
    /** Set true after a successful response, including an empty directory. Reset on navigation. */
    loaded?: boolean;
};
export type VcsFileContext<T extends VcsItem = VcsItem> = {item: T; location: VcsLocation};
export type VcsFileAction<T extends VcsItem = VcsItem> = NavigationAction<VcsFileContext<T>>;
export type VcsRowContext<T extends VcsItem = VcsItem> = {
    item: T;
    location: VcsLocation;
    index: number;
    isActive: boolean;
};
export type VcsIconContext<T extends VcsItem = VcsItem> = {
    item: T;
    location: VcsLocation;
    view: 'list' | 'detail';
};
export type VcsDetailRenderContext<T extends VcsItem = VcsItem> = VcsFileContext<T> & {
    content?: string;
    language?: string;
    loading?: boolean;
    error?: ReactNode;
    actions: VcsFileAction<T>[];
    onClose: () => void;
};
export type VcsDetailConfig<T extends VcsItem = VcsItem> = {
    openedFile?: VcsFileContext<T>;
    content?: string;
    language?: string;
    loading?: boolean;
    error?: ReactNode;
    onOpen?: (context: VcsFileContext<T>) => void;
    onClose?: () => void;
    renderContent?: (context: VcsDetailRenderContext<T>) => ReactNode;
};
export type VcsHeaderContext = {
    location: VcsLocation;
    onUpdate: (location: VcsLocation) => void;
    providers: VcsSelectorConfig;
    /** The standard header shows a selector only when there is more than one item. */
    repositories?: VcsSelectorConfig;
    branches: VcsSelectorConfig;
    actions: NavigationAction<VcsLocation>[];
};
export type QueriesVcsProps<TItem extends VcsItem = VcsItem> = {
    location: VcsLocation;
    onUpdate: (location: VcsLocation) => void;
    providers: VcsSelectorConfig;
    /** Optional repository selection. The application selects single repositories as well. */
    repositories?: VcsSelectorConfig;
    branches: VcsSelectorConfig;
    /** Items are filtered and sorted by the application. Paths start with '/'. */
    items: TItem[];
    search?: NavigationSearchConfig;
    sort?: NavigationSortConfig;
    listState?: VcsListStateConfig;
    detail?: VcsDetailConfig<TItem>;
    header?: {actions?: NavigationAction<VcsLocation>[]};
    renderHeader?: (context: VcsHeaderContext) => ReactNode;
    renderItemIcon?: (context: VcsIconContext<TItem>) => ReactNode;
    renderRowItem?: (context: VcsRowContext<TItem>) => ReactNode;
    onInsertFile?: (context: VcsFileContext<TItem>) => void;
    onAttachFile?: (context: VcsFileContext<TItem>) => void;
    /** Replaces the standard actions, including the source link. */
    getFileActions?: (context: VcsFileContext<TItem>) => VcsFileAction<TItem>[];
    /** The application resolves whether an entered path is a file or directory. */
    onPathSubmit?: (location: VcsLocation) => void;
    onLoadSuggestions?: (location: VcsLocation) => Promise<PathEditorSuggestion[]>;
    className?: string;
};
