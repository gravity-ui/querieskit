import {
    QueryHistoryEditingConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryRowAction,
    QueryHistoryRowRenderData,
    QueryHistorySelectionConfig,
    QueryHistoryVisibleFieldsConfig,
} from '../../../types/history';

type Props<T extends QueryHistoryRow> = {
    item: QueryHistoryItem<T>;
    isActive: boolean;
    index: number;
    visibleFields?: QueryHistoryVisibleFieldsConfig<T>;
    editing?: QueryHistoryEditingConfig<T>;
    selection?: QueryHistorySelectionConfig<T>;
    getRowActions?: (item: T) => QueryHistoryRowAction<T>[];
};

export const prepareRowData = <T extends QueryHistoryRow>({
    item,
    isActive,
    index,
    visibleFields,
    editing,
    selection,
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
    const selectionData =
        isRow && selection
            ? {
                  enabled: Boolean(selection.enabled),
                  checked: selection.selectedRowIds.includes(item.id),
                  onChange: selection.onChange,
              }
            : undefined;

    return {
        item,
        index,
        isActive,
        visibleFields,
        actions,
        editing: editingData,
        selection: selectionData,
    };
};
