import {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListItem,
    QueryListRow,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListRowVariant,
    QueryListVisibleFieldsConfig,
} from '../../../types/queryList';

type Props<T extends QueryListRow> = {
    item: QueryListItem<T>;
    isActive: boolean;
    index: number;
    variant: QueryListRowVariant;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
};

export const prepareRowData = <T extends QueryListRow>({
    item,
    isActive,
    index,
    variant,
    visibleFields,
    editing,
    comparison,
    getRowActions,
}: Props<T>): QueryListRowRenderData<T> => {
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
