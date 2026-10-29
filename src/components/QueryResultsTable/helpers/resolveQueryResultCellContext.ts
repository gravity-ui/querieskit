import type {
    QueryResultCellRenderContext,
    QueryResultCellSettings,
} from '../../../types/queryResults';

/** Resolve only standard cells; custom renderers retain their raw context. */
export function resolveQueryResultCellContext<TRow extends Record<string, unknown>>(
    context: QueryResultCellRenderContext<TRow>,
    getCellValue?: QueryResultCellSettings<TRow>['getCellValue'],
): QueryResultCellRenderContext<TRow> {
    return getCellValue ? {...context, value: getCellValue(context)} : context;
}
