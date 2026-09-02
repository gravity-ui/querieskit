import React, {useMemo} from 'react';
import type {Column} from '@gravity-ui/react-data-table';
import {DataTable, formatQueryResultType} from '../../../components';
import type {QueryResultColumn} from '../../../types/queryResults';
import i18n from '../i18n';

export type QueryResultsSchemaProps<TRow extends Record<string, unknown>> = {
    columns: Array<QueryResultColumn<TRow>>;
    loading?: boolean;
};

export function QueryResultsSchema<TRow extends Record<string, unknown>>({
    columns,
    loading,
}: QueryResultsSchemaProps<TRow>) {
    const tableColumns = useMemo<Array<Column<QueryResultColumn<TRow>>>>(
        () => [
            {
                name: 'name',
                header: i18n('field_name'),
                render: ({row}) => row.header ?? row.name,
            },
            {
                name: 'type',
                header: i18n('field_type'),
                render: ({row}) => <code>{formatQueryResultType(row.type)}</code>,
            },
        ],
        [],
    );

    return (
        <DataTable<QueryResultColumn<TRow>>
            columns={tableColumns}
            data={columns}
            loading={loading}
            loaded={!loading}
            settings={{displayIndices: false, sortable: false, stripedRows: true}}
        />
    );
}
