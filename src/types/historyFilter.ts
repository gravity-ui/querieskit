import type {ReactNode} from 'react';
import type {QueryListFilterConfig} from './queryList';

export type HistoryFilterProps = QueryListFilterConfig & {buttonView?: 'normal' | 'flat'};

export type HistoryFilterFieldsContext<T extends object> = {
    value: T;
    onChange: (value: T) => void;
};

export type CustomHistoryFilterOptions<T extends object> = {
    /** Complete defaults, also used by Reset. Treat values as immutable plain form data. */
    initialValues: T;
    /** Applied values. Meaningful external changes replace the current draft. */
    values?: T;
    /** Render controlled fields only; the filter supplies Apply and Reset. */
    renderFields: (context: HistoryFilterFieldsContext<T>) => ReactNode;
    isChanged?: boolean;
    onApply?: (value: T) => void;
    onReset?: () => void;
};

/** Produced by createHistoryFilter; pass directly to a history widget's filter prop. */
export type CustomHistoryFilterConfig = {
    /**
     * Typed adapter created by createHistoryFilter.
     * @internal
     */
    customFilter: {
        render: (context: {buttonView?: 'normal' | 'flat'; isChanged?: boolean}) => ReactNode;
    };
    isChanged?: boolean;
    fields?: never;
    values?: never;
    initialValues?: never;
    onApply?: never;
    onReset?: never;
};

export type HistoryFilterConfig = QueryListFilterConfig | CustomHistoryFilterConfig;
export type CustomHistoryFilterProps = CustomHistoryFilterConfig & {
    buttonView?: 'normal' | 'flat';
};
