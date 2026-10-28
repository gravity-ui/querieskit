import type {
    ChartData,
    ChartFieldsChartType,
    ChartFieldsEditorProps,
    ChartFieldsFormValues,
    ChartSelectedFormValues,
} from './chartEditor';
import type {ChartConfiguration} from './chartConfiguration';

export type TabularChartType = Extract<
    ChartFieldsChartType,
    'line' | 'area' | 'scatter' | 'bar-x' | 'bar-y' | 'pie'
>;
export type TabularChartField = {id: string; name: string; type: 'number' | 'string' | 'datetime'};
export type ChartDataUnavailable = {
    status: 'empty-data' | 'missing-fields' | 'invalid-selection' | 'unsupported-type';
    fieldIds?: string[];
};
export type ChartDataResult = {status: 'ready'; data: ChartData} | ChartDataUnavailable;
/** Builds series and data axes; the editor/restoration applies user appearance afterward. */
export type ChartDataResolver = (values: ChartConfiguration) => ChartDataResult;
export type TabularChartSourceOptions<Row> = {
    fields: readonly TabularChartField[];
    rows: readonly Row[];
    /** Return normalized values; datetime values are Unix milliseconds. */
    getValue: (row: Row, fieldId: string) => unknown;
    chartTypes?: readonly TabularChartType[];
};
export type TabularChartSource = Pick<
    ChartFieldsEditorProps,
    'chartTypeOptions' | 'getFieldOptions'
> & {
    getChartData: (values: ChartSelectedFormValues) => ChartData | undefined;
    getInitialFormValues: (type: ChartFieldsChartType) => ChartFieldsFormValues;
    resolveChartData: ChartDataResolver;
};
