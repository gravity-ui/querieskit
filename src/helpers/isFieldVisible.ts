import {QueryHistoryFieldKey, QueryHistoryRow} from '../types/history';

/**
 * A field is visible either when no `visibleFields` config is provided
 * (the consumer doesn't opt into the feature — everything is shown), or when
 * the field key is explicitly included in `visibleFields.value`.
 *
 * `visibleFields` is accepted loosely as `{value: string[]}` (rather than the
 * generic `QueryHistoryVisibleFieldsConfig<T>`) so this helper works for any
 * `T extends QueryHistoryRow` without fighting TS variance on generic key
 * unions; `field` still uses `QueryHistoryFieldKey<QueryHistoryRow>` to keep
 * typo-protection for the built-in fields checked by the row renderers.
 */
export const isFieldVisible = (
    visibleFields: {value: string[]} | undefined,
    field: QueryHistoryFieldKey<QueryHistoryRow>,
): boolean => {
    return visibleFields === undefined || visibleFields.value.includes(field);
};
