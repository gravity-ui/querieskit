import type {ReactNode} from 'react';

/** Tutorials is a compatibility alias for the shared panel appearance. */
export type HistoryPanelVariant = 'default' | 'panel' | 'tutorials';

export type ListEmptyContentProps = {
    /** Undefined uses the default placeholder; null explicitly suppresses it. */
    emptyContent?: ReactNode;
};

export type QueryListPanelOptions = ListEmptyContentProps & {
    variant?: HistoryPanelVariant;
    hideSearchWhenEmpty?: boolean;
};

export type EmptyContentTextOverrides = {
    title?: ReactNode;
    description?: ReactNode;
};
