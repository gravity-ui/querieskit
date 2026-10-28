import type {
    ChartConfiguration,
    ChartFieldsEditorProps,
    ChartFieldsFormValues,
    DashboardChartsProps,
} from '../../src';
import {validateChartConfiguration} from '../../src';
import {createTabularChartSource} from '../../src/helpers/createTabularChartSource';

const source = createTabularChartSource({
    fields: [{id: 'x', name: 'X', type: 'number'}],
    rows: [{x: 1}],
    getValue: (row) => row.x,
});
const legacy: DashboardChartsProps = {
    editorMode: 'fields',
    chartFieldsEditorProps: source,
    chartItems: [],
    onItemsChange: () => {},
};
const {resolveChartData: _resolver, ...legacySource} = source;
const {getChartData: _getChartData, ...resolverSource} = source;
const draft: ChartFieldsFormValues = {chartType: 'pie'};
// @ts-expect-error An incomplete form is not a completed configuration.
const incompleteConfiguration: ChartConfiguration = draft;
const resolverOnly: ChartFieldsEditorProps = {
    ...resolverSource,
    formValues: draft,
    onSubmit: (_data, configuration) => {
        const completed: ChartConfiguration = configuration;
        return completed;
    },
};
const legacyOnly: ChartFieldsEditorProps = {
    ...legacySource,
    formValues: draft,
};
// @ts-expect-error At least one chart data callback is required.
const withoutDataCallback: ChartFieldsEditorProps = {
    chartTypeOptions: source.chartTypeOptions,
    getFieldOptions: source.getFieldOptions,
    formValues: draft,
};
const checked = validateChartConfiguration(source.getInitialFormValues('line'));
if (checked.valid) {
    source.resolveChartData(checked.configuration);
}
// @ts-expect-error A structured resolver receives only completed configurations.
source.resolveChartData(draft);
export const examples = [
    legacy,
    _resolver,
    _getChartData,
    incompleteConfiguration,
    resolverOnly,
    legacyOnly,
    withoutDataCallback,
];
