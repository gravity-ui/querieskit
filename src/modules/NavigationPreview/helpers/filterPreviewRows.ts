import {formatQueryResultValue} from '../../../components/QueryResultsTable/helpers/formatQueryResultValue';
import {resolveQueryResultCellType} from '../../../components/QueryResultsTable/helpers/resolveQueryResultCellType';
import {filterNavigationRows} from '../../../helpers/filterNavigationRows';
import type {QueryResultCellSettings, QueryResultColumn} from '../../../types/queryResults';

export function filterPreviewRows<TRow extends Record<string, unknown>>(
    rows: TRow[],
    columns: Array<string | QueryResultColumn<TRow>>,
    search?: string,
    settings?: QueryResultCellSettings<TRow>,
): TRow[] {
    const query = search?.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row, index) =>
        columns.some((column) => {
            // Preserve the public helper's string-column API and custom-renderer search.
            if (typeof column === 'string' || column.render) {
                const name = typeof column === 'string' ? column : column.name;
                return filterNavigationRows([row], [name], query).length > 0;
            }

            try {
                const value = row[column.name];
                const context = {row, value, index, column};
                const options = settings?.getCellOptions?.(context);
                const formatted = formatQueryResultValue(
                    value,
                    resolveQueryResultCellType(context, settings?.getCellType),
                    settings?.formatterSettings,
                    // Clipboard overrides are not the displayed value.
                    {...options, copyText: undefined},
                    0,
                );
                return !formatted.error && formatted.text.toLowerCase().includes(query);
            } catch {
                return false;
            }
        }),
    );
}
