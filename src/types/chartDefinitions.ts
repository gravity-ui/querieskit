import type {ChartConfiguration, ChartConfigurationIssue} from './chartConfiguration';
import type {DashboardItem} from './dashboardCharts';
import type {ChartDataUnavailable} from './tabularChartSource';

export type ChartDefinition = {version: 1; id: string; fieldsFormValues: ChartConfiguration};
export type ChartDefinitionIssue = {
    code: ChartConfigurationIssue['code'] | 'unsupported-version';
    path: string;
};
export type ChartDefinitionValidation =
    {valid: true; definition: ChartDefinition} | {valid: false; issues: ChartDefinitionIssue[]};
export type RestoredChartDefinition =
    | {status: 'ready'; definition: ChartDefinition; item: DashboardItem}
    | (ChartDataUnavailable & {definition: ChartDefinition});
