import type {ChartAxisType} from '@gravity-ui/charts';
import type {ChartAppearanceValues, ChartXYType} from './chartEditor';

/** A completed binding. Row identity is independent of the selected field. */
export type ChartConfigurationField = {id: string; fieldId: string};

export type ChartXYConfiguration = ChartAppearanceValues & {
    chartType: ChartXYType;
    dimensionFieldId: string;
    dimensionAxisType: ChartAxisType;
    measureItems: ChartConfigurationField[];
    xTitle?: string;
    yTitle?: string;
};

/** Completed chart bindings; unlike form drafts, required selections cannot be omitted. */
export type ChartConfiguration =
    | ChartXYConfiguration
    | (ChartAppearanceValues & {
          chartType: 'pie';
          categoryFieldId: string;
          valueFieldId: string;
      })
    | (ChartAppearanceValues & {
          chartType: 'treemap';
          levels: ChartConfigurationField[];
          valueFieldId: string;
      })
    | (ChartAppearanceValues & {
          chartType: 'sankey';
          sourceFieldId: string;
          targetFieldId: string;
          valueFieldId: string;
      });

export type ChartConfigurationIssue = {
    code: 'invalid-definition' | 'unsupported-type';
    path: string;
};

export type ChartConfigurationValidation =
    | {valid: true; configuration: ChartConfiguration}
    | {valid: false; issues: ChartConfigurationIssue[]};
