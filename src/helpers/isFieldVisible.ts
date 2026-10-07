import type {QueryListFieldKey, QueryListRow} from '../types/queryList';

/**
 * A field is visible when no config is provided or its key is explicitly included.
 * Accept only the selected keys to avoid coupling to generic config callbacks.
 */
export const isFieldVisible = <T extends QueryListRow>(
    visibleFields: {value: readonly string[]} | undefined,
    field: QueryListFieldKey<T>,
): boolean => {
    return visibleFields === undefined || visibleFields.value.includes(field);
};
