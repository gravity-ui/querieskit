import React, {useMemo} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {type Column, DataTable, FieldsSearchToolbar, QueryResultsTable} from '../../components';
import {useVisibleColumns} from '../../helpers/useVisibleColumns';
import type {
    NavigationPreviewColumn,
    NavigationPreviewConfig,
    NavigationPreviewFormatterConfig,
    NavigationPreviewRow,
} from '../../types/navigation';
import type {QueryResultColumn} from '../../types/queryResults';
import {buildPreviewColumns} from './helpers/buildPreviewColumns';
import {filterPreviewRows} from './helpers/filterPreviewRows';
import i18n from './i18n';
import './NavigationPreview.scss';

const block = cn('qp-navigation-preview');

export type NavigationPreviewViewConfig<TRow extends NavigationPreviewRow = NavigationPreviewRow> =
    NavigationPreviewFormatterConfig & {
        tableColumns?: Array<Column<TRow>>;
        extraColumns?: Array<Column<TRow>>;
    };

export type NavigationPreviewProps<TRow extends NavigationPreviewRow = NavigationPreviewRow> = {
    data: NavigationPreviewConfig<TRow>;
    view?: NavigationPreviewViewConfig<TRow>;
    search?: string;
    onSearchUpdate?: (value: string) => void;
    searchPlaceholder?: string;
    visibleColumns?: string[];
    onVisibleColumnsChange?: (value: string[]) => void;
    defaultVisibleColumns?: string[];
    hideToolbar?: boolean;
    hideFieldsSelector?: boolean;
    className?: string;
};

function getColumnName<TRow extends NavigationPreviewRow>(column: NavigationPreviewColumn<TRow>) {
    return typeof column === 'string' ? column : column.name;
}

function isQueryResultColumn<TRow extends NavigationPreviewRow>(
    column: NavigationPreviewColumn<TRow>,
): column is QueryResultColumn<TRow> {
    return typeof column !== 'string';
}

export function NavigationPreview<TRow extends NavigationPreviewRow = NavigationPreviewRow>({
    data,
    view,
    search,
    onSearchUpdate,
    searchPlaceholder,
    visibleColumns,
    onVisibleColumnsChange,
    defaultVisibleColumns,
    hideToolbar,
    hideFieldsSelector,
    className,
}: NavigationPreviewProps<TRow>) {
    const {columns, rows, loading, loaded, errorContent} = data;
    const {tableColumns, extraColumns, formatterSettings, maxVisibleLines} = view ?? {};
    const columnNames = useMemo(() => columns.map(getColumnName), [columns]);

    const [activeVisibleColumns, handleVisibleColumnsChange] = useVisibleColumns(columnNames, {
        value: visibleColumns,
        onChange: onVisibleColumnsChange,
        defaultValue: defaultVisibleColumns,
    });

    const displayedColumns = useMemo(
        () => columns.filter((column) => activeVisibleColumns.includes(getColumnName(column))),
        [columns, activeVisibleColumns],
    );
    const displayedColumnNames = useMemo(
        () => displayedColumns.map(getColumnName),
        [displayedColumns],
    );
    const typedColumns = useMemo(
        () => displayedColumns.filter(isQueryResultColumn),
        [displayedColumns],
    );
    const canUseQueryResultsTable =
        !tableColumns && !extraColumns?.length && typedColumns.length === displayedColumns.length;

    const resolvedColumns = useMemo(() => {
        if (tableColumns) {
            return tableColumns;
        }
        return [...buildPreviewColumns<TRow>(displayedColumnNames, i18n), ...(extraColumns ?? [])];
    }, [tableColumns, extraColumns, displayedColumnNames]);

    const fieldsOptions = useMemo(
        () =>
            columns.map((column) => ({
                id: getColumnName(column),
                title: typeof column === 'string' ? column : (column.header ?? column.name),
            })),
        [columns],
    );

    const filteredRows = useMemo(
        () => filterPreviewRows(rows, displayedColumnNames, search),
        [rows, displayedColumnNames, search],
    );

    if (errorContent) {
        return (
            <Text color="danger" className={block('error')}>
                {errorContent}
            </Text>
        );
    }

    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            {!hideToolbar && (
                <FieldsSearchToolbar
                    search={search}
                    onSearchUpdate={onSearchUpdate}
                    searchPlaceholder={searchPlaceholder}
                    fields={fieldsOptions}
                    visibleFields={activeVisibleColumns}
                    onVisibleFieldsChange={handleVisibleColumnsChange}
                    hideFieldsSelector={hideFieldsSelector}
                />
            )}
            {canUseQueryResultsTable ? (
                <QueryResultsTable<TRow>
                    columns={typedColumns}
                    rows={filteredRows}
                    loading={loading}
                    loaded={loaded}
                    formatterSettings={formatterSettings}
                    maxVisibleLines={maxVisibleLines}
                    emptyVariant={search ? 'nothing-found' : 'no-data'}
                    displayIndices={false}
                    className={block('table')}
                />
            ) : (
                <DataTable<TRow>
                    columns={resolvedColumns}
                    data={filteredRows}
                    loading={loading}
                    loaded={loaded}
                    emptyVariant={search ? 'nothing-found' : 'no-data'}
                    settings={{displayIndices: false}}
                    className={block('table')}
                />
            )}
        </Flex>
    );
}
