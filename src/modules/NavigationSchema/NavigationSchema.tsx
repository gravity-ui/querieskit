import React, {useMemo} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {type Column, DataTable, FieldsSearchToolbar} from '../../components';
import {useVisibleColumns} from '../../helpers/useVisibleColumns';
import type {NavigationSchemaColumn, NavigationSchemaConfig} from '../../types/navigation';
import {buildSchemaColumns} from './helpers/buildSchemaColumns';
import {filterSchema} from './helpers/filterSchema';
import i18n from './i18n';
import './NavigationSchema.scss';

const block = cn('qp-navigation-schema');

export type NavigationSchemaViewConfig<
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
> = {
    tableColumns?: Array<Column<TColumn>>;
    extraColumns?: Array<Column<TColumn>>;
};

export type NavigationSchemaProps<TColumn extends NavigationSchemaColumn = NavigationSchemaColumn> =
    {
        data: NavigationSchemaConfig<TColumn>;
        view?: NavigationSchemaViewConfig<TColumn>;
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

export function NavigationSchema<TColumn extends NavigationSchemaColumn = NavigationSchemaColumn>({
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
}: NavigationSchemaProps<TColumn>) {
    const {columns, loading, loaded, errorContent} = data;
    const {tableColumns, extraColumns} = view ?? {};

    const resolvedColumns = useMemo(() => {
        if (tableColumns) {
            return tableColumns;
        }
        return [...buildSchemaColumns<TColumn>(i18n), ...(extraColumns ?? [])];
    }, [tableColumns, extraColumns]);

    const allColumnNames = useMemo(
        () => resolvedColumns.map((column) => column.name),
        [resolvedColumns],
    );

    const [activeVisibleColumns, handleVisibleColumnsChange] = useVisibleColumns(allColumnNames, {
        value: visibleColumns,
        onChange: onVisibleColumnsChange,
        defaultValue: defaultVisibleColumns,
    });

    const displayedColumns = useMemo(
        () => resolvedColumns.filter((column) => activeVisibleColumns.includes(column.name)),
        [resolvedColumns, activeVisibleColumns],
    );

    const fieldsOptions = useMemo(
        () =>
            resolvedColumns.map((column) => ({
                id: column.name,
                title: column.header ?? column.name,
            })),
        [resolvedColumns],
    );

    const rows = useMemo(() => filterSchema(columns, search), [columns, search]);

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
            <DataTable<TColumn>
                columns={displayedColumns}
                data={rows}
                loading={loading}
                loaded={loaded}
                emptyVariant={search ? 'nothing-found' : 'no-data'}
                settings={{displayIndices: false}}
                className={block('table')}
            />
        </Flex>
    );
}
