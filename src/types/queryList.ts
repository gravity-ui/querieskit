import {ReactNode} from 'react';
import {RegisteredFormFields} from './forms';

/** ISO 8601 date string or Unix timestamp in milliseconds. */
export type QueryTimestamp = string | number;

export type QueryListRowRenderProps = {height: number};

export type QueryListHeader = {header: string} & QueryListRowRenderProps;

export type QueryListRow = {
    id: number;
    title: string;
    query?: string;
    href?: string;
} & QueryListRowRenderProps;

export type QueryListItem<T extends QueryListRow = QueryListRow> = QueryListHeader | T;

export type QueryListRowVariant = 'default' | 'search';

export type QueryListRowAction<T extends QueryListRow = QueryListRow> = {
    text: ReactNode;
    icon?: ReactNode;
    theme?: 'normal' | 'danger';
    hidden?: boolean;
    disabled?: boolean;
    onClick: (item: T) => void;
};

export type QueryListSearchConfig = {
    value?: string;
    fullSearch?: boolean;
    hasClear?: boolean;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
};

export type QueryListFilterConfig = {
    fields?: RegisteredFormFields[];
    values?: Record<string, any>;
    initialValues?: Record<string, any>;
    isChanged?: boolean;
    onApply?: (values: Record<string, any>) => void;
    onReset?: () => void;
};

export type QueryListEditingConfig<T extends QueryListRow = QueryListRow> = {
    rowId?: T['id'];
    onSubmit?: (item: T, title: string) => void;
    onCancel?: (item: T) => void;
};

export type QueryListComparisonConfig<T extends QueryListRow = QueryListRow> = {
    enabled: boolean;
    comparedRowIds: T['id'][];
    onChange: (item: T, selected: boolean) => void;
    onCancel: () => void;
    onCompare: () => void;
};

type RowFieldKey<T extends QueryListRow> = Exclude<keyof T & string, keyof QueryListRowRenderProps>;

export type QueryListFieldKey<T extends QueryListRow = QueryListRow> = RowFieldKey<T> | 'duration';

export type QueryListFieldOption<K extends string = string> = {
    id: K;
    title: ReactNode;
};

export type QueryListVisibleFieldsConfig<T extends QueryListRow = QueryListRow> = {
    value: QueryListFieldKey<T>[];
    fields: QueryListFieldOption<QueryListFieldKey<T>>[];
    onChange: (value: QueryListFieldKey<T>[]) => void;
};

export type QueryListEditingRenderData<T extends QueryListRow = QueryListRow> = {
    enabled: boolean;
} & Pick<QueryListEditingConfig<T>, 'onSubmit' | 'onCancel'>;

export type QueryListRowRenderData<T extends QueryListRow = QueryListRow> = {
    item: QueryListItem<T>;
    index: number;
    isActive: boolean;
    variant: QueryListRowVariant;
    comparison?: {
        enabled: boolean;
        checked: boolean;
    };
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    actions?: QueryListRowAction<T>[];
    editing?: QueryListEditingRenderData<T>;
};
