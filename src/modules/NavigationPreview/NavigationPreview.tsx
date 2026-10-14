import React, {useMemo} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {FieldsSearchToolbar} from '../../components/FieldsSearchToolbar';
import {QueryResultsTable} from '../../components/QueryResultsTable';
import {useVisibleColumns} from '../../helpers/useVisibleColumns';
import type {NavigationPreviewProps, NavigationPreviewRow} from '../../types/navigation';
import {filterPreviewRows} from './helpers/filterPreviewRows';
import './NavigationPreview.scss';

const block = cn('qp-navigation-preview');

export type {NavigationPreviewProps, NavigationPreviewViewConfig} from '../../types/navigation';

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
    const columnNames = useMemo(() => columns.map((column) => column.name), [columns]);

    const [activeVisibleColumns, handleVisibleColumnsChange] = useVisibleColumns(columnNames, {
        value: visibleColumns,
        onChange: onVisibleColumnsChange,
        defaultValue: defaultVisibleColumns,
    });

    const displayedColumns = useMemo(
        () => columns.filter((column) => activeVisibleColumns.includes(column.name)),
        [columns, activeVisibleColumns],
    );
    const fieldsOptions = useMemo(
        () =>
            columns.map((column) => ({
                id: column.name,
                title: column.header ?? column.name,
            })),
        [columns],
    );

    const filteredRows = useMemo(
        () => filterPreviewRows(rows, displayedColumns, search, view),
        [rows, displayedColumns, search, view],
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
            <QueryResultsTable<TRow>
                {...view}
                columns={displayedColumns}
                rows={filteredRows}
                loading={loading}
                loaded={loaded}
                emptyVariant={search ? 'nothing-found' : 'no-data'}
                displayIndices={view?.displayIndices ?? false}
            />
        </Flex>
    );
}
