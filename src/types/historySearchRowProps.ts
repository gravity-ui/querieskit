import type {QueryHistoryRow} from './history';
import type {QueryListRowRenderData} from './queryList';

export type HistorySearchRowProps<T extends QueryHistoryRow> = {
    item: T;
} & Omit<QueryListRowRenderData<T>, 'item' | 'variant'>;
