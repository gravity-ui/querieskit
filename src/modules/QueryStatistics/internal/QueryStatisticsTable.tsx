import React, {useMemo} from 'react';
import BaseDataTable, {type Column} from '@gravity-ui/react-data-table';
import {DataTable} from '../../../components';
import type {
    QueryStatisticsColumn,
    QueryStatisticsExtraColumn,
    QueryStatisticsFormatValueContext,
} from '../../../types/queryStatistics';
import {
    type QueryStatisticsRow,
    getQueryStatisticsValue,
    isQueryStatisticsGroup,
    isQueryStatisticsMetric,
} from '../helpers';
import i18n from '../i18n';
import {MetricCell} from './MetricCell';

import './QueryStatisticsTable.scss';

const NO_VALUE = '—';
const block = 'qp-query-statistics-table';
const COLUMN_TITLES: Record<QueryStatisticsColumn, () => string> = {
    min: () => i18n('field_min'),
    max: () => i18n('field_max'),
    avg: () => i18n('field_avg'),
    sum: () => i18n('field_sum'),
    count: () => i18n('field_count'),
    last: () => i18n('field_last'),
};

export type QueryStatisticsTableProps = {
    rows: QueryStatisticsRow[];
    visibleColumns: QueryStatisticsColumn[];
    columnConfig?: Partial<
        Record<QueryStatisticsColumn, {title?: React.ReactNode; width?: string}>
    >;
    extraColumns?: QueryStatisticsExtraColumn[];
    expandedIds: Set<string>;
    fixedHeader: boolean;
    virtual: boolean;
    formatValue?: (
        value: number | undefined,
        context: QueryStatisticsFormatValueContext,
    ) => React.ReactNode;
    isSearching: boolean;
    onToggleGroup: (id: string) => void;
};

export function QueryStatisticsTable({
    rows,
    visibleColumns,
    columnConfig,
    extraColumns,
    expandedIds,
    fixedHeader,
    virtual,
    formatValue,
    isSearching,
    onToggleGroup,
}: QueryStatisticsTableProps) {
    const numberFormatter = useMemo(
        () => new Intl.NumberFormat(undefined, {maximumFractionDigits: 6}),
        [],
    );
    const columns = useMemo<Array<Column<QueryStatisticsRow>>>(() => {
        const metricColumn: Column<QueryStatisticsRow> = {
            name: 'metric',
            header: i18n('field_metric'),
            className: `${block}__metric-column`,
            width: '40%',
            sortable: false,
            render: ({row}) => (
                <MetricCell
                    row={row}
                    expanded={isQueryStatisticsGroup(row.item) && expandedIds.has(row.item.id)}
                    onToggle={onToggleGroup}
                />
            ),
        };
        const valueColumns = visibleColumns.map<Column<QueryStatisticsRow>>((column) => ({
            name: column,
            header: columnConfig?.[column]?.title ?? COLUMN_TITLES[column](),
            className: `${block}__value-column`,
            width: columnConfig?.[column]?.width ?? '12%',
            align: BaseDataTable.RIGHT,
            sortable: false,
            render: ({row}) => {
                if (!isQueryStatisticsMetric(row.item)) return NO_VALUE;
                const value = getQueryStatisticsValue(row.item, column);
                if (formatValue) return formatValue(value, {column, item: row.item});
                return value === undefined || !Number.isFinite(value)
                    ? NO_VALUE
                    : numberFormatter.format(value);
            },
        }));
        const customColumns = (extraColumns ?? []).map<Column<QueryStatisticsRow>>((column) => ({
            name: column.id,
            header: column.title,
            width: column.width ?? '12%',
            className: `${block}__value-column`,
            sortable: false,
            render: ({row}) => column.render({item: row.item, level: row.level}),
        }));
        return [metricColumn, ...valueColumns, ...customColumns];
    }, [
        columnConfig,
        expandedIds,
        extraColumns,
        formatValue,
        numberFormatter,
        onToggleGroup,
        visibleColumns,
    ]);

    return (
        <div className={block + (fixedHeader ? ` ${block}_fixed` : '')}>
            <DataTable<QueryStatisticsRow>
                columns={columns}
                data={rows}
                loaded
                emptyVariant={isSearching ? 'nothing-found' : 'no-data'}
                rowKey={(row) => row.item.id}
                settings={{
                    displayIndices: false,
                    sortable: false,
                    stripedRows: false,
                    dynamicRender: virtual,
                    dynamicRenderType: 'uniform',
                    stickyHead: fixedHeader ? BaseDataTable.MOVING : undefined,
                    syncHeadOnResize: fixedHeader,
                }}
            />
        </div>
    );
}
