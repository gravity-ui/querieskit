import React, {useMemo} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {type Column, DataTable, FieldsSearchToolbar} from '../../components';
import {useVisibleColumns} from '../../helpers/useVisibleColumns';
import type {NavigationPreviewConfig, NavigationPreviewRow} from '../../types/navigation';
import {buildPreviewColumns} from './helpers/buildPreviewColumns';
import {filterPreviewRows} from './helpers/filterPreviewRows';
import i18n from './i18n';
import './NavigationPreview.scss';

const block = cn('qp-navigation-preview');

export type NavigationPreviewViewConfig<TRow extends NavigationPreviewRow = NavigationPreviewRow> =
    {
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
    const {tableColumns, extraColumns} = view ?? {};

    const [activeVisibleColumns, handleVisibleColumnsChange] = useVisibleColumns(columns, {
        value: visibleColumns,
        onChange: onVisibleColumnsChange,
        defaultValue: defaultVisibleColumns,
    });

    const displayedColumnNames = useMemo(
        () => columns.filter((column) => activeVisibleColumns.includes(column)),
        [columns, activeVisibleColumns],
    );

    const resolvedColumns = useMemo(() => {
        if (tableColumns) {
            return tableColumns;
        }
        return [...buildPreviewColumns<TRow>(displayedColumnNames, i18n), ...(extraColumns ?? [])];
    }, [tableColumns, extraColumns, displayedColumnNames]);

    const fieldsOptions = useMemo(
        () => columns.map((column) => ({id: column, title: column})),
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
            <DataTable<TRow>
                columns={resolvedColumns}
                data={filteredRows}
                loading={loading}
                loaded={loaded}
                emptyVariant={search ? 'nothing-found' : 'no-data'}
                settings={{displayIndices: false}}
                className={block('table')}
            />
        </Flex>
    );
}
