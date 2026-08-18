import type {NavigationSchemaColumn} from '../../../types/navigation';

export function filterSchema<TColumn extends NavigationSchemaColumn>(
    columns: TColumn[],
    search?: string,
): TColumn[] {
    const query = search?.trim().toLowerCase();
    if (!query) {
        return columns;
    }

    return columns.filter((column) => {
        return (
            column.name.toLowerCase().includes(query) ||
            (column.type?.toLowerCase().includes(query) ?? false)
        );
    });
}
