import React, {useMemo} from 'react';
import BaseDataTable, {type Column} from '@gravity-ui/react-data-table';
import cn from 'bem-cn-lite';
import {DataTable} from '../../../components/DataTable';
import type {QueryResultColumn, QueryResultsTableSettings} from '../../../types/queryResults';
import {
    buildQueryResultSchemaType,
    normalizeQueryResultSchemaType,
} from '../helpers/queryResultSchemaType';
import {QueryResultSchemaType} from './QueryResultSchemaType';
import i18n from '../i18n';

import './QueryResultsSchema.scss';

const block = cn('qp-query-results-schema');

function schemaKeyPart(_key: string, value: unknown) {
    return typeof value === 'number' && !Number.isFinite(value)
        ? {nonFiniteNumber: String(value)}
        : value;
}

export type QueryResultsSchemaProps<TRow extends Record<string, unknown>> = Pick<
    QueryResultsTableSettings<TRow>,
    'displayIndices' | 'stripedRows' | 'stickyHead'
> & {
    columns: Array<QueryResultColumn<TRow>>;
    loading?: boolean;
    stickyTop?: number;
};

export function QueryResultsSchema<TRow extends Record<string, unknown>>({
    columns,
    loading,
    displayIndices = true,
    stripedRows = true,
    stickyHead = BaseDataTable.MOVING,
    stickyTop = 0,
}: QueryResultsSchemaProps<TRow>) {
    const resolvedStickyHead = stickyHead === false ? undefined : stickyHead;
    const tableColumns = useMemo<Array<Column<QueryResultColumn<TRow>>>>(
        () => [
            {
                name: 'name',
                header: i18n('field_name'),
                render: ({row}) => {
                    const name = row.header ?? row.name;
                    return (
                        <span
                            className={block('name')}
                            title={
                                typeof name === 'string' || typeof name === 'number'
                                    ? String(name)
                                    : undefined
                            }
                        >
                            {name}
                        </span>
                    );
                },
            },
            {
                name: 'type',
                header: i18n('field_type'),
                render: ({row}) => {
                    const type =
                        row.schemaType === undefined
                            ? buildQueryResultSchemaType(row.type)
                            : normalizeQueryResultSchemaType(row.schemaType);
                    // Value identity preserves expansion for equivalent descriptions and
                    // resets only this row when its effective schema is replaced.
                    return (
                        <QueryResultSchemaType
                            key={JSON.stringify([row.name, type], schemaKeyPart)}
                            type={type}
                        />
                    );
                },
            },
        ],
        [],
    );

    return (
        <DataTable<QueryResultColumn<TRow>>
            className={block()}
            columns={tableColumns}
            data={columns}
            startIndex={1}
            loading={loading}
            loaded={!loading}
            settings={{
                displayIndices,
                sortable: false,
                stripedRows,
                stickyHead: resolvedStickyHead,
                stickyTop,
                syncHeadOnResize: Boolean(resolvedStickyHead),
            }}
        />
    );
}
