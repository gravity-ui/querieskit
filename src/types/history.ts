import {ReactNode} from 'react';

export type QueryStatus = 'completed' | 'failed' | 'aborted' | 'draft' | 'running';

/** ISO 8601 date string or Unix timestamp in milliseconds. */
export type QueryHistoryTimestamp = string | number;

export type HistoryRowRenderProps = {height: number};

export type QueryHistoryHeader = {header: string} & HistoryRowRenderProps;

export type QueryHistoryRow = {
    id: number;
    title: string;
    query?: string;
    startTime?: QueryHistoryTimestamp;
    endTime?: QueryHistoryTimestamp;
    engine?: string;
    mode?: string;
    isPrivate?: boolean;
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

export type QueryHistorySearchConfig = {
    value?: string;
    fullSearch?: boolean;
    hasClear?: boolean;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
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

/**
 * Set of field keys that can be toggled via `QueryHistoryVisibleFieldsConfig`:
 * either a real string key of the row (excluding render-only ones) or a
 * computed pseudo-field such as `duration`, which is derived from
 * `startTime`/`endTime` rather than being a real property.
 */
type RowFieldKey<T extends QueryHistoryRow> = Exclude<
    keyof T & string,
    keyof HistoryRowRenderProps
>;

export type QueryHistoryFieldKey<T extends QueryHistoryRow = QueryHistoryRow> =
    RowFieldKey<T> | 'duration';

export type QueryHistoryFieldOption<K extends string = string> = {
    id: K;
    title: ReactNode;
};

export type QueryHistoryVisibleFieldsConfig<T extends QueryHistoryRow = QueryHistoryRow> = {
    value: QueryHistoryFieldKey<T>[];
    fields: QueryHistoryFieldOption<QueryHistoryFieldKey<T>>[];
    onChange: (value: QueryHistoryFieldKey<T>[]) => void;
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
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    actions?: QueryHistoryRowAction<T>[];
    editing?: QueryHistoryEditingRenderData<T>;
    selection?: QueryHistorySelectionRenderData<T>;
};
