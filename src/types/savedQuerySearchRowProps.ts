import type React from 'react';
import type {QueryListRowRenderData} from './queryList';
import type {SavedQuery} from './savedQueries';

export type SavedQuerySearchRowProps<T extends SavedQuery = SavedQuery> = {
    item: T;
    renderAuthor?: (item: T) => React.ReactNode;
} & Omit<QueryListRowRenderData<T>, 'item' | 'variant'>;
