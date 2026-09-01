import type {ReactNode} from 'react';

export type QueryStatisticsColumn = 'min' | 'max' | 'avg' | 'sum' | 'count' | 'last';

export type QueryStatisticsValues = Partial<Record<QueryStatisticsColumn, number>>;

type QueryStatisticsItemBase = {
    id: string;
    name: string;
    description?: string;
    unit?: string;
};

export type QueryStatisticsMetric = QueryStatisticsItemBase & {
    values: QueryStatisticsValues;
    children?: never;
};

export type QueryStatisticsGroup = QueryStatisticsItemBase & {
    children: QueryStatisticsItem[];
    values?: never;
};

export type QueryStatisticsItem = QueryStatisticsMetric | QueryStatisticsGroup;

export type QueryStatisticsFormatValueContext = {
    column: QueryStatisticsColumn;
    item: QueryStatisticsMetric;
};

export type QueryStatisticsColumnConfig = {
    title?: ReactNode;
    width?: string;
};

export type QueryStatisticsExtraColumnContext = {
    item: QueryStatisticsItem;
    level: number;
};

export type QueryStatisticsExtraColumn = {
    id: string;
    title: ReactNode;
    width?: string;
    render: (context: QueryStatisticsExtraColumnContext) => ReactNode;
};

export type QueryStatisticsProps = {
    data: QueryStatisticsItem[];
    visibleColumns?: QueryStatisticsColumn[];
    columnConfig?: Partial<Record<QueryStatisticsColumn, QueryStatisticsColumnConfig>>;
    extraColumns?: QueryStatisticsExtraColumn[];
    className?: string;
    virtual?: boolean;
    fixedHeader?: boolean;
    formatValue?: (
        value: number | undefined,
        context: QueryStatisticsFormatValueContext,
    ) => ReactNode;
    search?: string;
    defaultSearch?: string;
    onSearchUpdate?: (value: string) => void;
    expandedIds?: string[];
    defaultExpandedIds?: string[];
    onExpandedIdsChange?: (ids: string[]) => void;
    searchDebounceMs?: number;
};
