import type {ChartAxisType} from '@gravity-ui/charts';
import type {
    ChartConfigurationField,
    ChartConfigurationIssue,
    ChartConfigurationValidation,
} from '../types/chartConfiguration';
import type {ChartConfigValues, ChartFieldsChartType, ChartXYType} from '../types/chartEditor';

export const defaultChartAxisVariants: readonly ChartAxisType[] = [
    'category',
    'datetime',
    'linear',
    'logarithmic',
];
const xyTypes: readonly ChartXYType[] = ['line', 'area', 'scatter', 'bar-x', 'bar-y'];
const supportedTypes: readonly ChartFieldsChartType[] = [...xyTypes, 'pie', 'treemap', 'sankey'];

export function isXYChartType(type: string | undefined): type is ChartXYType {
    return xyTypes.some((candidate) => candidate === type);
}

export function isChartFieldsChartType(type: string | undefined): type is ChartFieldsChartType {
    return supportedTypes.some((candidate) => candidate === type);
}

function isAxisType(value: unknown): value is ChartAxisType {
    return defaultChartAxisVariants.some((axis) => axis === value);
}

const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

function invalid(
    path: string,
    code: ChartConfigurationIssue['code'] = 'invalid-definition',
): {valid: false; issues: ChartConfigurationIssue[]} {
    return {valid: false, issues: [{code, path}]};
}

function validateRows(
    value: unknown,
    path: string,
): {valid: true; rows: ChartConfigurationField[]} | ReturnType<typeof invalid> {
    if (!Array.isArray(value) || value.length === 0) return invalid(path);
    const ids = new Set<string>();
    const fields = new Set<string>();
    const rows: ChartConfigurationField[] = [];
    for (let index = 0; index < value.length; index++) {
        const row: unknown = value[index];
        if (
            !record(row) ||
            typeof row.id !== 'string' ||
            row.id.length === 0 ||
            typeof row.fieldId !== 'string' ||
            ids.has(row.id) ||
            fields.has(row.fieldId)
        )
            return invalid(`${path}.${index}`);
        ids.add(row.id);
        fields.add(row.fieldId);
        rows.push({id: row.id, fieldId: row.fieldId});
    }
    return {valid: true, rows};
}

function validateAppearance(
    input: Record<string, unknown>,
): {valid: true; appearance: ChartConfigValues} | ReturnType<typeof invalid> {
    for (const key of ['chartTitle', 'xTitle', 'yTitle']) {
        if (input[key] !== undefined && typeof input[key] !== 'string') return invalid(key);
    }
    if (input.showLegend !== undefined && typeof input.showLegend !== 'boolean')
        return invalid('showLegend');
    return {
        valid: true,
        appearance: {
            ...(typeof input.chartTitle === 'string' && {chartTitle: input.chartTitle}),
            ...(typeof input.showLegend === 'boolean' && {showLegend: input.showLegend}),
            ...(typeof input.xTitle === 'string' && {xTitle: input.xTitle}),
            ...(typeof input.yTitle === 'string' && {yTitle: input.yTitle}),
        },
    };
}

/** Validate structure without consulting data availability. Unknown properties are omitted. */
export function validateChartConfiguration(input: unknown): ChartConfigurationValidation {
    if (!record(input)) return invalid('');
    const {chartType} = input;
    if (typeof chartType !== 'string' || !isChartFieldsChartType(chartType))
        return invalid('chartType', 'unsupported-type');
    const validatedAppearance = validateAppearance(input);
    if (!validatedAppearance.valid) return validatedAppearance;
    const {xTitle, yTitle, ...appearance} = validatedAppearance.appearance;

    if (isXYChartType(chartType)) {
        if (typeof input.dimensionFieldId !== 'string') return invalid('dimensionFieldId');
        if (!isAxisType(input.dimensionAxisType)) return invalid('dimensionAxisType');
        const measures = validateRows(input.measureItems, 'measureItems');
        if (!measures.valid) return measures;
        return {
            valid: true,
            configuration: {
                chartType,
                ...appearance,
                dimensionFieldId: input.dimensionFieldId,
                dimensionAxisType: input.dimensionAxisType,
                measureItems: measures.rows,
                ...(xTitle !== undefined && {xTitle}),
                ...(yTitle !== undefined && {yTitle}),
            },
        };
    }
    // Empty strings are legitimate field IDs for custom adapters.
    if (typeof input.valueFieldId !== 'string') return invalid('valueFieldId');
    switch (chartType) {
        case 'pie':
            if (typeof input.categoryFieldId !== 'string') return invalid('categoryFieldId');
            return {
                valid: true,
                configuration: {
                    chartType,
                    ...appearance,
                    categoryFieldId: input.categoryFieldId,
                    valueFieldId: input.valueFieldId,
                },
            };
        case 'treemap': {
            const levels = validateRows(input.levels, 'levels');
            if (!levels.valid) return levels;
            return {
                valid: true,
                configuration: {
                    chartType,
                    ...appearance,
                    levels: levels.rows,
                    valueFieldId: input.valueFieldId,
                },
            };
        }
        case 'sankey':
            if (typeof input.sourceFieldId !== 'string') return invalid('sourceFieldId');
            if (
                typeof input.targetFieldId !== 'string' ||
                input.targetFieldId === input.sourceFieldId
            )
                return invalid('targetFieldId');
            return {
                valid: true,
                configuration: {
                    chartType,
                    ...appearance,
                    sourceFieldId: input.sourceFieldId,
                    targetFieldId: input.targetFieldId,
                    valueFieldId: input.valueFieldId,
                },
            };
        default:
            return invalid('chartType', 'unsupported-type');
    }
}
