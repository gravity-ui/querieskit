import type {ReactNode} from 'react';
import type {Column} from '../components';
import {isEmptyValue} from './isEmptyValue';

export function buildColumnsFromKeys<TRow extends Record<string, unknown>>(
    columns: string[],
    emptyText: string,
): Array<Column<TRow>> {
    return columns.map((column) => ({
        name: column,
        header: column,
        render: ({row}) => {
            const value = row[column];
            return isEmptyValue(value) ? emptyText : (value as ReactNode);
        },
    }));
}
