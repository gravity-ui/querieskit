import React from 'react';
import {
    QueryResults,
    type QueryResultsColumnVisibility,
    type QueryResultsPagination,
} from '../../src/modules/QueryResults';
import {NavigationPreview} from '../../src/modules/NavigationPreview';
import {QueryExecutionPanel} from '../../src/widgets/QueryExecutionPanel';
import {QueryResultsTable} from '../../src/components/QueryResultsTable';
import type {QueryResultCellSettings as RootCellSettings} from '../../src';
import type {QueryResultCellSettings as TableCellSettings} from '../../src/components/QueryResultsTable';
import type {
    QueryResultCellSettings,
    QueryResultDataType,
    QueryResultsProps,
} from '../../src/types/queryResults';

type Row = {id: string; value: unknown; wireType: QueryResultDataType};
const pagination: QueryResultsPagination = {hasMore: true, onLoadMore: async () => {}};
const columnVisibility: QueryResultsColumnVisibility = {value: undefined, onChange: () => {}};
const checkType = <T,>(value: T): T => value;
const settings: QueryResultCellSettings<Row> = {
    getCellValue: ({row, value, column, index}) => {
        checkType<string>(row.id);
        checkType<unknown>(value);
        checkType<string>(column.name);
        checkType<number>(index);
        // @ts-expect-error The original row generic is retained, not widened to any.
        checkType<number>(row.id);
        return row.value;
    },
    getCellType: ({row, column}) => (column.name === 'value' ? row.wireType : undefined),
    onCellPreview: ({type, row}) => {
        checkType<QueryResultDataType>(type);
        checkType<string>(row.id);
    },
};
const props: QueryResultsProps<Row> = {
    columns: [{name: 'value', type: ['DataType', 'Utf8']}],
    rows: [],
    pagination,
    columnVisibility,
    ...settings,
};

export const results = <QueryResults {...props} />;
export const table = <QueryResultsTable {...props} />;
export const rootSettings: RootCellSettings<Row> = settings;
export const tableSettings: TableCellSettings<Row> = settings;
export const navigation = <NavigationPreview data={props} view={settings} />;
export const panel = <QueryExecutionPanel<Row> tabs={[{id: 'result', type: 'result', props}]} />;
