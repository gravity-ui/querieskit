import React, {useMemo} from 'react';
import BaseDataTable, {type Column} from '@gravity-ui/react-data-table';
import {Text, Tooltip} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {DataTable} from '../DataTable';
import type {QueryResultsTableProps} from '../../types/queryResults';
import {formatQueryResultType, isQueryResultNumericType} from './helpers/formatQueryResultType';
import {QueryResultCell} from './internal/QueryResultCell';

import '@gravity-ui/unipika/dist/unipika.css';
import './QueryResultsTable.scss';

const block = cn('qp-query-results-table');
const DEFAULT_MAX_VISIBLE_LINES = 5;

export type {QueryResultsTableProps} from '../../types/queryResults';

export function QueryResultsTable<TRow extends Record<string, unknown>>({
    columns,
    rows,
    loading,
    loaded,
    errorContent,
    rowKey,
    formatterSettings,
    maxVisibleLines = DEFAULT_MAX_VISIBLE_LINES,
    collapseAfterLines = maxVisibleLines,
    maxInlineTextLength,
    getCellOptions,
    onCellPreview,
    emptyVariant,
    displayIndices = true,
    stripedRows = true,
    stickyHead = BaseDataTable.MOVING,
    className,
}: QueryResultsTableProps<TRow>) {
    const resolvedStickyHead = stickyHead === false ? undefined : stickyHead;
    const tableColumns = useMemo<Array<Column<TRow>>>(
        () =>
            columns.map((column) => {
                const type = formatQueryResultType(column.type);
                const align =
                    column.align ??
                    (isQueryResultNumericType(column.type) ? BaseDataTable.LEFT : undefined);

                return {
                    name: column.name,
                    width: column.width,
                    align,
                    sortable: false,
                    headerTitle: type,
                    header: (
                        <Tooltip content={type}>
                            <span className={block('header')}>{column.header ?? column.name}</span>
                        </Tooltip>
                    ),
                    render: ({row, index}) =>
                        column.render ? (
                            column.render({row, index, column, value: row[column.name]})
                        ) : (
                            <QueryResultCell
                                row={row}
                                value={row[column.name]}
                                index={index}
                                column={column}
                                formatterSettings={formatterSettings}
                                maxVisibleLines={maxVisibleLines}
                                collapseAfterLines={collapseAfterLines}
                                maxInlineTextLength={maxInlineTextLength}
                                getCellOptions={getCellOptions}
                                onCellPreview={onCellPreview}
                            />
                        ),
                };
            }),
        [
            columns,
            formatterSettings,
            maxVisibleLines,
            collapseAfterLines,
            maxInlineTextLength,
            getCellOptions,
            onCellPreview,
        ],
    );

    if (errorContent) {
        return (
            <Text color="danger" className={block('error', className)}>
                {errorContent}
            </Text>
        );
    }

    return (
        <div className={block(null, className)}>
            <DataTable<TRow>
                columns={tableColumns}
                data={rows}
                loading={loading}
                loaded={loaded ?? !loading}
                emptyVariant={emptyVariant}
                rowKey={rowKey}
                settings={{
                    displayIndices,
                    stripedRows,
                    sortable: false,
                    stickyHead: resolvedStickyHead,
                    syncHeadOnResize: Boolean(resolvedStickyHead),
                }}
            />
        </div>
    );
}
