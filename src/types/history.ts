import {ReactNode} from 'react';

export type QueryStatus = 'completed' | 'failed' | 'aborted' | 'draft' | 'running';

/** ISO 8601 date string or Unix timestamp in milliseconds. */
export type QueryHistoryTimestamp = string | number;

export type HistoryRowRenderProps = {height: number};

export type QueryHistoryHeader = {header: string} & HistoryRowRenderProps;

export type QueryHistoryRow = {
    id: number;
    title: string;
    startTime: QueryHistoryTimestamp;
    endTime?: QueryHistoryTimestamp;
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

export type QueryHistoryEditingConfig<T extends QueryHistoryRow = QueryHistoryRow> = {
    rowId?: T['id'];
    onSubmit?: (item: T, title: string) => void;
    onCancel?: (item: T) => void;
};

export type QueryHistorySelectionConfig<T extends QueryHistoryRow = QueryHistoryRow> = {
    enabled?: boolean;
    selectedRowIds: T['id'][];
    onChange?: (item: T, selected: boolean) => void;
};

export type QueryHistoryEditingRenderData<T extends QueryHistoryRow = QueryHistoryRow> = {
    enabled: boolean;
} & Pick<QueryHistoryEditingConfig<T>, 'onSubmit' | 'onCancel'>;

export type QueryHistorySelectionRenderData<T extends QueryHistoryRow = QueryHistoryRow> = {
    enabled: boolean;
    checked: boolean;
} & Pick<QueryHistorySelectionConfig<T>, 'onChange'>;

export type QueryHistoryRowRenderData<T extends QueryHistoryRow = QueryHistoryRow> = {
    item: QueryHistoryItem<T>;
    index: number;
    isActive: boolean;
    actions?: QueryHistoryRowAction<T>[];
    editing?: QueryHistoryEditingRenderData<T>;
    selection?: QueryHistorySelectionRenderData<T>;
};
