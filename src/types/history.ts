import {ReactNode} from 'react';
import {RegisteredFormFields} from './forms';

export type QueryStatus = 'completed' | 'failed' | 'aborted' | 'draft' | 'running';

/** ISO 8601 date string or Unix timestamp in milliseconds. */
export type QueryHistoryTimestamp = string | number;

export type HistoryRowRenderProps = {height: number};

export type QueryHistoryHeader = {header: string} & HistoryRowRenderProps;

export type BaseHistoryRow = {
    id: number;
    title: string;
    query?: string;
    href?: string;
} & HistoryRowRenderProps;

export type QueryHistoryRow = BaseHistoryRow & {
    startTime?: QueryHistoryTimestamp;
    endTime?: QueryHistoryTimestamp;
    engine?: string;
    mode?: string;
    isPrivate?: boolean;
    status: QueryStatus;
};

export type QueryHistoryItem<T extends BaseHistoryRow = BaseHistoryRow> = QueryHistoryHeader | T;

export type QueryHistoryRowVariant = 'default' | 'search';

export type QueryHistoryRowAction<T extends BaseHistoryRow = BaseHistoryRow> = {
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

export type QueryHistoryFilterConfig = {
    fields?: RegisteredFormFields[];
    values?: Record<string, any>;
    initialValues?: Record<string, any>;
    isChanged?: boolean;
    onApply?: (values: Record<string, any>) => void;
    onReset?: () => void;
};

export type QueryHistoryEditingConfig<T extends BaseHistoryRow = BaseHistoryRow> = {
    rowId?: T['id'];
    onSubmit?: (item: T, title: string) => void;
    onCancel?: (item: T) => void;
};

export type QueryHistoryComparisonConfig<T extends BaseHistoryRow = BaseHistoryRow> = {
    enabled: boolean;
    comparedRowIds: T['id'][];
    onChange: (item: T, selected: boolean) => void;
    onCancel: () => void;
    onCompare: () => void;
};

type RowFieldKey<T extends BaseHistoryRow> = Exclude<keyof T & string, keyof HistoryRowRenderProps>;

export type QueryHistoryFieldKey<T extends BaseHistoryRow = BaseHistoryRow> =
    RowFieldKey<T> | 'duration';

export type QueryHistoryFieldOption<K extends string = string> = {
    id: K;
    title: ReactNode;
};

export type QueryHistoryVisibleFieldsConfig<T extends BaseHistoryRow = BaseHistoryRow> = {
    value: QueryHistoryFieldKey<T>[];
    fields: QueryHistoryFieldOption<QueryHistoryFieldKey<T>>[];
    onChange: (value: QueryHistoryFieldKey<T>[]) => void;
};

export type QueryHistoryEditingRenderData<T extends BaseHistoryRow = BaseHistoryRow> = {
    enabled: boolean;
} & Pick<QueryHistoryEditingConfig<T>, 'onSubmit' | 'onCancel'>;

export type QueryHistoryRowRenderData<T extends BaseHistoryRow = BaseHistoryRow> = {
    item: QueryHistoryItem<T>;
    index: number;
    isActive: boolean;
    variant: QueryHistoryRowVariant;
    comparison?: {
        enabled: boolean;
        checked: boolean;
    };
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    actions?: QueryHistoryRowAction<T>[];
    editing?: QueryHistoryEditingRenderData<T>;
};
