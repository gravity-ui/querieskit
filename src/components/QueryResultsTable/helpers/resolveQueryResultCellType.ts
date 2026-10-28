import type {
    QueryResultCellRenderContext,
    QueryResultCellSettings,
} from '../../../types/queryResults';

export function resolveQueryResultCellType<TRow extends Record<string, unknown>>(
    context: QueryResultCellRenderContext<TRow>,
    getCellType?: QueryResultCellSettings<TRow>['getCellType'],
) {
    return getCellType?.(context) ?? context.column.type;
}
