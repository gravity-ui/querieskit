import type {
    ChartDefinition,
    ChartDefinitionValidation,
    RestoredChartDefinition,
} from '../types/chartDefinitions';
import type {DashboardItem} from '../types/dashboardCharts';
import type {ChartDataResolver} from '../types/tabularChartSource';
import {validateChartConfiguration} from './validateChartConfiguration';
import {applyChartFieldsAppearance} from './applyChartFieldsAppearance';

const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
const id = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

/** Validate persisted structure without consulting the current data source. Unknown properties are omitted. */
export function validateChartDefinition(input: unknown): ChartDefinitionValidation {
    const invalid = (
        path: string,
        code:
            | 'invalid-definition'
            | 'unsupported-version'
            | 'unsupported-type' = 'invalid-definition',
    ): ChartDefinitionValidation => ({valid: false, issues: [{code, path}]});
    if (!record(input)) return invalid('');
    if (input.version !== 1) return invalid('version', 'unsupported-version');
    if (!id(input.id)) return invalid('id');
    const result = validateChartConfiguration(input.fieldsFormValues);
    if (!result.valid) {
        return {
            valid: false,
            issues: result.issues.map((issue) => ({
                ...issue,
                path: issue.path ? `fieldsFormValues.${issue.path}` : 'fieldsFormValues',
            })),
        };
    }
    return {
        valid: true,
        definition: {
            version: 1,
            id: input.id,
            fieldsFormValues: result.configuration,
        },
    };
}

/** Extract only stable bindings and appearance, never the derived series. */
export function extractChartDefinition(item: DashboardItem): ChartDefinitionValidation {
    return validateChartDefinition({
        version: 1,
        id: item.id,
        fieldsFormValues: item.fieldsFormValues,
    });
}

/** Preserve the definition even when its fields or data are temporarily unavailable. */
export function restoreChartDefinition(
    definition: ChartDefinition,
    resolve: ChartDataResolver,
): RestoredChartDefinition {
    const result = resolve(definition.fieldsFormValues);
    return result.status === 'ready'
        ? {
              status: 'ready',
              definition,
              item: {
                  id: definition.id,
                  fieldsFormValues: definition.fieldsFormValues,
                  chartData: applyChartFieldsAppearance(result.data, definition.fieldsFormValues),
              },
          }
        : {...result, definition};
}
