import type {ChartData, ChartFieldsFormValues} from '../types/chartEditor';
import type {ChartConfiguration} from '../types/chartConfiguration';
import type {
    ChartDataResult,
    TabularChartSource,
    TabularChartSourceOptions,
    TabularChartType,
} from '../types/tabularChartSource';
import {
    createChartFieldsFormValues,
    isChartFieldsFormComplete,
    isXYFormValues,
} from './chartFieldsForm';
import {getChartTypeLabel} from './chartLabels';
import {validateChartConfiguration} from './validateChartConfiguration';

const defaultTypes: readonly TabularChartType[] = [
    'line',
    'area',
    'scatter',
    'bar-x',
    'bar-y',
    'pie',
];
const finite = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

export function createTabularChartSource<Row>({
    fields,
    rows,
    getValue,
    chartTypes = defaultTypes,
}: TabularChartSourceOptions<Row>): TabularChartSource {
    const byId = new Map(fields.map((field) => [field.id, field]));
    if (byId.size !== fields.length || fields.some(({id}) => !id))
        throw new Error('Chart field IDs must be unique and nonempty');
    const dimensions = fields.map(({id, name}) => ({value: id, content: name}));
    const measures = dimensions.filter(({value}) => byId.get(value)?.type === 'number');
    const chartTypeOptions = [...new Set(chartTypes)].map((value) => ({
        value,
        content: getChartTypeLabel(value),
    }));
    const getFieldOptions: TabularChartSource['getFieldOptions'] = ({role}) =>
        role === 'measure' || role === 'value' ? measures : dimensions;
    const valueAt = (row: Row, id: string | undefined) => {
        if (id === undefined) return undefined;
        const value = getValue(row, id);
        return byId.get(id)?.type === 'string'
            ? typeof value === 'string'
                ? value
                : undefined
            : finite(value)
              ? value
              : undefined;
    };
    const resolveChartData = (values: ChartConfiguration): ChartDataResult => {
        if (!chartTypes.some((type) => type === values.chartType))
            return {status: 'unsupported-type'};
        const selected = isXYFormValues(values)
            ? [values.dimensionFieldId, ...values.measureItems.map(({fieldId}) => fieldId)]
            : values.chartType === 'pie'
              ? [values.categoryFieldId, values.valueFieldId]
              : [];
        const missing = [
            ...new Set(selected.filter((id): id is string => id !== undefined && !byId.has(id))),
        ];
        if (missing.length) return {status: 'missing-fields', fieldIds: missing};
        if (!isChartFieldsFormComplete(values, {chartTypeOptions, getFieldOptions}))
            return {status: 'invalid-selection'};
        if (!rows.length) return {status: 'empty-data'};
        let data: ChartData;
        if (values.chartType === 'pie') {
            const points = rows.flatMap((row) => {
                const category = valueAt(row, values.categoryFieldId);
                const value = valueAt(row, values.valueFieldId);
                return category !== undefined && finite(value)
                    ? [{name: String(category), value}]
                    : [];
            });
            data = {series: {data: [{type: 'pie', seriesId: 'pie', data: points}]}};
        } else if (isXYFormValues(values)) {
            const categories = new Set<string>();
            const categorical = values.dimensionAxisType === 'category';
            const series = values.measureItems.map(({id, fieldId}) => ({
                type: values.chartType,
                seriesId: id,
                name: byId.get(fieldId ?? '')?.name,
                data: [] as {x: string | number; y: string | number}[],
            }));
            // Row-first iteration keeps category order independent of measure order and gaps.
            for (const row of rows) {
                const dimension = valueAt(row, values.dimensionFieldId);
                if (dimension === undefined || (!categorical && !finite(dimension))) continue;
                const coordinate = categorical ? String(dimension) : dimension;
                for (let index = 0; index < values.measureItems.length; index++) {
                    const measure = valueAt(row, values.measureItems[index].fieldId);
                    if (!finite(measure)) continue;
                    if (categorical) categories.add(String(dimension));
                    series[index].data.push(
                        values.chartType === 'bar-y'
                            ? {x: measure, y: coordinate}
                            : {x: coordinate, y: measure},
                    );
                }
            }
            const domain = {
                type: values.dimensionAxisType,
                ...(categorical && {categories: [...categories]}),
            };
            data = {
                series: {data: series as ChartData['series']['data']},
                xAxis: values.chartType === 'bar-y' ? {type: 'linear'} : domain,
                yAxis: [values.chartType === 'bar-y' ? domain : {type: 'linear'}],
            };
        } else return {status: 'unsupported-type'};
        return data.series.data.some((series) => series.data.length)
            ? {status: 'ready', data}
            : {status: 'empty-data'};
    };
    return {
        chartTypeOptions,
        getFieldOptions,
        getInitialFormValues: (type): ChartFieldsFormValues => {
            const initial = createChartFieldsFormValues(type);
            if (initial.chartType === 'pie')
                return {
                    ...initial,
                    categoryFieldId: dimensions[0]?.value,
                    valueFieldId: measures[0]?.value,
                };
            if (!isXYFormValues(initial)) return initial;
            const dimension = fields[0];
            return {
                ...initial,
                dimensionFieldId: dimension?.id,
                dimensionAxisType:
                    dimension?.type === 'number'
                        ? ('linear' as const)
                        : dimension?.type === 'datetime'
                          ? ('datetime' as const)
                          : ('category' as const),
                measureItems: [{id: 'measure-0', fieldId: measures[0]?.value}],
            };
        },
        resolveChartData,
        getChartData: (values) => {
            const validated = validateChartConfiguration(values);
            if (!validated.valid) return undefined;
            const result = resolveChartData(validated.configuration);
            return result.status === 'ready' ? result.data : undefined;
        },
    };
}
