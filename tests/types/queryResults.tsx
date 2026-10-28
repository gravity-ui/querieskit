import React from 'react';
import {QueryResults} from '../../src/modules/QueryResults';
import {NavigationPreview} from '../../src/modules/NavigationPreview';
import {QueryExecutionPanel} from '../../src/widgets/QueryExecutionPanel';
import type {
    QueryResultCellSettings,
    QueryResultsProps,
    QueryResultDataType,
} from '../../src/types/queryResults';

type Row = {id: string; value: unknown; wireType: QueryResultDataType};
const settings: QueryResultCellSettings<Row> = {
    getCellType: ({row, column}) => (column.name === 'value' ? row.wireType : undefined),
    onCellPreview: ({type, row}) => {
        const wireType: QueryResultDataType = type;
        const id: string = row.id;
        void wireType;
        void id;
    },
};
const props: QueryResultsProps<Row> = {
    columns: [{name: 'value', type: ['DataType', 'Utf8']}],
    rows: [],
    ...settings,
};

export const results = <QueryResults {...props} />;
export const navigation = <NavigationPreview data={props} view={settings} />;
export const panel = <QueryExecutionPanel<Row> tabs={[{id: 'result', type: 'result', props}]} />;
