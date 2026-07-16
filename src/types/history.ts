import {ReactNode} from 'react';

export type QueryStatus = 'completed' | 'failed' | 'aborted' | 'draft' | 'running';

export type HistoryRowRenderProps = {height: number};

export type QueryHistoryHeader = {header: string} & HistoryRowRenderProps;

export type QueryHistoryRow = {
    id: number;
    title: string;
    startTime: number | string;
    endTime?: number | string;
    engine: string;
    status: QueryStatus;
    href?: string;
} & HistoryRowRenderProps;

export type QueryHistoryItem<T extends QueryHistoryRow = QueryHistoryRow> = QueryHistoryHeader | T;

export type QueryHistoryRowAction<T extends QueryHistoryRow = QueryHistoryRow> = {
    text: ReactNode;
    icon?: ReactNode;
    hidden?: boolean;
    disabled?: boolean;
    onClick: (item: T) => void;
};

export type QueryHistoryRowRenderData<T extends QueryHistoryRow = QueryHistoryRow> = {
    item: QueryHistoryItem<T>;
    isActive: boolean;
    actions?: QueryHistoryRowAction<T>[];
};
