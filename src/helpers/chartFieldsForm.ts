import type {ChartAxisType} from '@gravity-ui/charts';
import type {
    ChartEditorOption,
    ChartFieldItem,
    ChartFieldsChartType,
    ChartFieldsFormProps,
    ChartFieldsFormValues,
    ChartSelectedFormValues,
    ChartXYFormValues,
    ChartXYType,
} from '../types/chartEditor';

export const defaultChartAxisVariants: readonly ChartAxisType[] = [
    'category',
    'datetime',
    'linear',
    'logarithmic',
];

const xyTypes: readonly ChartXYType[] = ['line', 'area', 'scatter', 'bar-x', 'bar-y'];
const supportedTypes: readonly ChartFieldsChartType[] = [...xyTypes, 'pie', 'treemap', 'sankey'];

type FieldsConfig = Pick<
    ChartFieldsFormProps,
    'chartTypeOptions' | 'getFieldOptions' | 'axisVariants'
>;

export function isXYChartType(type: string | undefined): type is ChartXYType {
    return xyTypes.some((candidate) => candidate === type);
}

export function isXYFormValues(values: ChartFieldsFormValues): values is ChartXYFormValues {
    return isXYChartType(values.chartType);
}

export function isChartFieldsChartType(type: string | undefined): type is ChartFieldsChartType {
    return supportedTypes.some((candidate) => candidate === type);
}

function isAvailable(value: string | undefined, options: readonly ChartEditorOption[]) {
    return (
        value !== undefined && options.some((option) => option.value === value && !option.disabled)
    );
}

function areItemsAvailable(
    items: readonly ChartFieldItem[],
    options: readonly ChartEditorOption[],
) {
    return (
        Array.isArray(items) &&
        items.length > 0 &&
        items.every((item) => isAvailable(item.fieldId, options)) &&
        new Set(items.map((item) => item.fieldId)).size === items.length &&
        new Set(items.map((item) => item.id)).size === items.length
    );
}

export function isChartFieldsFormComplete(
    values: ChartFieldsFormValues,
    {chartTypeOptions, getFieldOptions, axisVariants = defaultChartAxisVariants}: FieldsConfig,
): values is ChartSelectedFormValues {
    const {chartType} = values;
    if (
        !chartType ||
        !isChartFieldsChartType(chartType) ||
        !isAvailable(chartType, chartTypeOptions)
    ) {
        return false;
    }
    const options = (role: Parameters<typeof getFieldOptions>[0]['role']) =>
        getFieldOptions({chartType, role});
    if (isXYFormValues(values)) {
        return (
            isAvailable(values.dimensionFieldId, options('dimension')) &&
            values.dimensionAxisType !== undefined &&
            axisVariants.includes(values.dimensionAxisType) &&
            areItemsAvailable(values.measureItems, options('measure'))
        );
    }
    switch (values.chartType) {
        case 'pie':
            return (
                isAvailable(values.categoryFieldId, options('category')) &&
                isAvailable(values.valueFieldId, options('value'))
            );
        case 'treemap':
            return (
                areItemsAvailable(values.levels, options('level')) &&
                isAvailable(values.valueFieldId, options('value'))
            );
        case 'sankey':
            return (
                isAvailable(values.sourceFieldId, options('source')) &&
                isAvailable(values.targetFieldId, options('target')) &&
                values.sourceFieldId !== values.targetFieldId &&
                isAvailable(values.valueFieldId, options('value'))
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
