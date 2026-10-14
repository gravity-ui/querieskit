import type {QueryListEditingRenderData, QueryListRow} from './queryList';

export type EditableRowTitleProps<T extends QueryListRow = QueryListRow> = {
    item: T;
    editing?: QueryListEditingRenderData<T>;
};
