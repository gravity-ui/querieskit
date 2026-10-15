import type {QueryListComparisonConfig, QueryListRow} from './queryList';

export type HistoryComparisonActionsProps<T extends QueryListRow = QueryListRow> = {
    comparison: QueryListComparisonConfig<T>;
    className?: string;
};
