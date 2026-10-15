import type {QueryHistoryRow} from './history';
import type {QueryListRowRenderData} from './queryList';

export type HistoryRowProps<T extends QueryHistoryRow> = {
    item: T;
} & Omit<QueryListRowRenderData<T>, 'item' | 'variant'>;
