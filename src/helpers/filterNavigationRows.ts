const stringifyCell = (value: unknown): string => {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return '';
};

export function filterNavigationRows<TRow extends Record<string, unknown>>(
    rows: TRow[],
    columns: string[],
    search?: string,
): TRow[] {
    const query = search?.trim().toLowerCase();
    if (!query) {
        return rows;
    }

    return rows.filter((row) =>
        columns.some((column) => stringifyCell(row[column]).toLowerCase().includes(query)),
    );
}
