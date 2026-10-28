import type {
    ChartConfiguration,
    ChartDefinition,
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
const definitions: ChartDefinition[] = [];
const controlled: DashboardChartsProps = {
    editorMode: 'fields',
    chartFieldsEditorProps: source,
    chartDefinitions: definitions,
    onDefinitionsChange: () => {},
};
const legacy: DashboardChartsProps = {
    editorMode: 'fields',
    chartFieldsEditorProps: source,
    chartItems: [],
    onItemsChange: () => {},
};
// @ts-expect-error Definitions and materialized items are mutually exclusive.
const invalid: DashboardChartsProps = {...controlled, chartItems: []};
// @ts-expect-error The definition path requires controlled updates.
const withoutCallback: DashboardChartsProps = {
    editorMode: 'fields',
    chartFieldsEditorProps: source,
    chartDefinitions: definitions,
};
const {resolveChartData: _resolver, ...legacySource} = source;
const {getChartData: _getChartData, ...resolverSource} = source;
const draft: ChartFieldsFormValues = {chartType: 'pie'};
// @ts-expect-error An incomplete form is not a completed configuration.
const incompleteConfiguration: ChartConfiguration = draft;
const incompleteDefinition: ChartDefinition = {
    version: 1,
    id: 'chart',
    // @ts-expect-error Persisted definitions require complete bindings.
    fieldsFormValues: draft,
};
const resolverOnly: ChartFieldsEditorProps = {
    ...resolverSource,
    formValues: draft,
    onSubmit: (_data, configuration) => {
        const completed: ChartConfiguration = configuration;
        return completed;
    },
};
const legacyOnly: ChartFieldsEditorProps = {...legacySource, formValues: draft};
const resolverDefinition: DashboardChartsProps = {
    editorMode: 'fields',
    chartFieldsEditorProps: resolverSource,
    chartDefinitions: definitions,
    onDefinitionsChange: () => {},
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
    definitions.push({version: 1, id: 'validated', fieldsFormValues: checked.configuration});
}
// @ts-expect-error A structured resolver receives only completed configurations.
source.resolveChartData(draft);
// @ts-expect-error Definition restoration requires structured diagnostics.
const withoutResolver: DashboardChartsProps = {
    editorMode: 'fields',
    chartFieldsEditorProps: legacySource,
    chartDefinitions: definitions,
    onDefinitionsChange: () => {},
};
export const examples = [
    controlled,
    legacy,
    invalid,
    withoutCallback,
    withoutResolver,
    _resolver,
    _getChartData,
    incompleteConfiguration,
    incompleteDefinition,
    resolverOnly,
    legacyOnly,
    resolverDefinition,
    withoutDataCallback,
];
