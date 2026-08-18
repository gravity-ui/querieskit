import {
    BaseHistoryRow,
    QueryHistoryComparisonConfig,
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistoryRowVariant,
    QueryHistoryVisibleFieldsConfig,
} from '../../../types/history';

type Props<T extends BaseHistoryRow> = {
    item: QueryHistoryItem<T>;
    isActive: boolean;
    index: number;
    variant: QueryHistoryRowVariant;
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    editing?: QueryHistoryEditingConfig<T>;
    comparison?: QueryHistoryComparisonConfig<T>;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
};

export const prepareRowData = <T extends BaseHistoryRow>({
    item,
    isActive,
    index,
    variant,
    visibleFields,
    editing,
    comparison,
    getRowActions,
}: Props<T>): QueryHistoryRowRenderData<T> => {
    const isRow = !('header' in item);
    const actions = isRow && getRowActions ? getRowActions(item) : undefined;
    const editingData =
        isRow && editing
            ? {
                  enabled: editing.rowId === item.id,
                  onSubmit: editing.onSubmit,
                  onCancel: editing.onCancel,
              }
            : undefined;
    const comparisonData =
        isRow && comparison && comparison.enabled
            ? {
                  enabled: true,
                  checked: comparison.comparedRowIds.includes(item.id),
              }
            : undefined;

    return {
        item,
        index,
        isActive,
        variant,
        visibleFields,
        actions,
        editing: editingData,
        comparison: comparisonData,
    };
};
