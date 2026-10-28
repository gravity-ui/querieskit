import type {ChartAxisType} from '@gravity-ui/charts';
import type {
    ChartEditorOption,
    ChartFieldItem,
    ChartFieldsChartType,
    ChartFieldsFormProps,
    ChartFieldsFormValues,
    ChartSelectedFormValues,
    ChartXYFormValues,
} from '../types/chartEditor';

import type {ChartConfiguration} from '../types/chartConfiguration';
import {
    defaultChartAxisVariants,
    isXYChartType,
    validateChartConfiguration,
} from './validateChartConfiguration';

export {
    defaultChartAxisVariants,
    isXYChartType,
    isChartFieldsChartType,
} from './validateChartConfiguration';

type FieldsConfig = Pick<
    ChartFieldsFormProps,
    'chartTypeOptions' | 'getFieldOptions' | 'axisVariants'
>;

export function isXYFormValues(values: ChartFieldsFormValues): values is ChartXYFormValues {
    return isXYChartType(values.chartType);
}

function isAvailable(value: string | undefined, options: readonly ChartEditorOption[]) {
    return (
        value !== undefined && options.some((option) => option.value === value && !option.disabled)
    );
}

export function isChartFieldsFormComplete(
    values: ChartFieldsFormValues,
    {chartTypeOptions, getFieldOptions, axisVariants = defaultChartAxisVariants}: FieldsConfig,
): values is ChartConfiguration {
    const result = validateChartConfiguration(values);
    if (!result.valid) return false;
    const configuration = result.configuration;
    const {chartType} = configuration;
    if (!isAvailable(chartType, chartTypeOptions)) return false;
    const options = (role: Parameters<typeof getFieldOptions>[0]['role']) =>
        getFieldOptions({chartType, role});
    if ('measureItems' in configuration) {
        return (
            isAvailable(configuration.dimensionFieldId, options('dimension')) &&
            axisVariants.includes(configuration.dimensionAxisType) &&
            configuration.measureItems.every((item) =>
                isAvailable(item.fieldId, options('measure')),
            )
        );
    }
    switch (configuration.chartType) {
        case 'pie':
            return (
                isAvailable(configuration.categoryFieldId, options('category')) &&
                isAvailable(configuration.valueFieldId, options('value'))
            );
        case 'treemap':
            return (
                configuration.levels.every((item) => isAvailable(item.fieldId, options('level'))) &&
                isAvailable(configuration.valueFieldId, options('value'))
            );
        case 'sankey':
            return (
                isAvailable(configuration.sourceFieldId, options('source')) &&
                isAvailable(configuration.targetFieldId, options('target')) &&
                isAvailable(configuration.valueFieldId, options('value'))
            );
        default:
            return false;
    }
}

export function createChartFieldsFormValues(
    chartType: ChartFieldsChartType,
    axisVariants: readonly ChartAxisType[] = defaultChartAxisVariants,
): ChartSelectedFormValues {
    if (isXYChartType(chartType)) {
        return {
            chartType,
            dimensionAxisType: axisVariants[0],
            measureItems: [{id: crypto.randomUUID()}],
        };
    }
    switch (chartType) {
        case 'pie':
            return {chartType};
        case 'treemap':
            return {chartType, levels: [{id: crypto.randomUUID()}]};
        case 'sankey':
            return {chartType};
        default:
            throw new Error(`Unsupported chart fields type: ${chartType}`);
    }
}

/** Keep only bindings available for the destination type, without guessing new columns. */
export function changeChartFieldsType(
    previous: ChartFieldsFormValues,
    chartType: ChartFieldsChartType,
    {getFieldOptions, axisVariants = defaultChartAxisVariants}: FieldsConfig,
): ChartSelectedFormValues {
    let next: ChartSelectedFormValues;
    if (isXYFormValues(previous) && isXYChartType(chartType)) {
        const flipped = (previous.chartType === 'bar-y') !== (chartType === 'bar-y');
        next = {
            ...previous,
            chartType,
            xTitle: flipped ? previous.yTitle : previous.xTitle,
            yTitle: flipped ? previous.xTitle : previous.yTitle,
        };
    } else if (previous.chartType === chartType) {
        next = previous as ChartSelectedFormValues;
    } else {
        next = {
            ...createChartFieldsFormValues(chartType, axisVariants),
            chartTitle: previous.chartTitle,
            showLegend: previous.showLegend,
        };
    }
    const field = (
        value: string | undefined,
        role: Parameters<typeof getFieldOptions>[0]['role'],
    ) => (isAvailable(value, getFieldOptions({chartType, role})) ? value : undefined);
    const items = (rows: ChartFieldItem[], role: 'measure' | 'level') =>
        rows.map((row) => ({...row, fieldId: field(row.fieldId, role)}));
    if (isXYFormValues(next)) {
        return {
            ...next,
            dimensionFieldId: field(next.dimensionFieldId, 'dimension'),
            dimensionAxisType:
                next.dimensionAxisType !== undefined &&
                axisVariants.includes(next.dimensionAxisType)
                    ? next.dimensionAxisType
                    : undefined,
            measureItems: items(next.measureItems, 'measure'),
        };
    }
    switch (next.chartType) {
        case 'pie':
            return {
                ...next,
                categoryFieldId: field(next.categoryFieldId, 'category'),
                valueFieldId: field(next.valueFieldId, 'value'),
            };
        case 'treemap':
            return {
                ...next,
                levels: items(next.levels, 'level'),
                valueFieldId: field(next.valueFieldId, 'value'),
            };
        case 'sankey':
            return {
                ...next,
                sourceFieldId: field(next.sourceFieldId, 'source'),
                targetFieldId: field(next.targetFieldId, 'target'),
                valueFieldId: field(next.valueFieldId, 'value'),
            };
        default:
            throw new Error(`Unsupported chart fields type: ${chartType}`);
    }
}
