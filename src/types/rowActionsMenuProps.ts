import type {QueryListRow, QueryListRowAction} from './queryList';

export type RowActionsMenuProps<T extends QueryListRow = QueryListRow> = {
    item: T;
    actions?: QueryListRowAction<T>[];
};
