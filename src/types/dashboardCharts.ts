import type {ChartDefinition} from './chartDefinitions';
import type {ChartDataResolver} from './tabularChartSource';
import type {FlexProps} from '@gravity-ui/uikit';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import type {DashboardProps} from './dashboard';
import type {
    ChartData,
    ChartEditorProps,
    ChartFieldsChartType,
    ChartFieldsDataSource,
    ChartFieldsEditorProps,
    ChartFieldsFormValues,
    ChartSeries,
} from './chartEditor';

export type DashboardItem = {
    id: string;
    chartData: ChartData;
    /** Persist alongside chartData to restore column bindings and Y order when editing. */
    fieldsFormValues?: ChartFieldsFormValues;
};

export type DashboardChartFieldsEditorProps = Omit<
    ChartFieldsEditorProps,
    'formValues' | 'onSubmit' | 'onCancel' | 'resolveChartData' | 'getChartData'
> &
    ChartFieldsDataSource & {
        /** Optional initial bindings for each chart type selected in the Add chart menu. */
        getInitialFormValues?: (chartType: ChartFieldsChartType) => ChartFieldsFormValues;
    };

type DashboardChartsCommonProps = {
    /** Hide the editor while inactive, preserving its draft. Defaults to true. */
    active?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    className?: string;
    gap?: FlexProps['gap'];
    dashboardProps?: Pick<DashboardProps, 'grid' | 'focusable' | 'className'>;
    defaultLayout?: DashboardProps['defaultLayout'];
    layout?: DashboardProps['layout'];
    onLayoutChange?: (layout: ConfigLayout[]) => void;
};

type ItemStateProps = {
    chartItems?: DashboardItem[];
    onItemsChange?: (items: DashboardItem[]) => void;
    chartDefinitions?: never;
    onDefinitionsChange?: never;
};
type DefinitionStateProps = {
    chartDefinitions: ChartDefinition[];
    onDefinitionsChange: (definitions: ChartDefinition[]) => void;
    chartItems?: never;
    onItemsChange?: never;
};

export type DashboardChartsProps = DashboardChartsCommonProps &
    (
        | ({
              editorMode?: 'series';
              dataSource: {
                  [chartType in ChartSeries['type']]?: ChartEditorProps['chartSeriesMap'];
              };
              chartEditorProps?: Omit<ChartEditorProps, 'onSubmit' | 'onCancel' | 'chartSeriesMap'>;
              chartFieldsEditorProps?: never;
          } & ItemStateProps)
        | ({
              editorMode: 'fields';
              chartFieldsEditorProps: DashboardChartFieldsEditorProps;
              dataSource?: never;
              chartEditorProps?: never;
          } & (
              | ItemStateProps
              | (DefinitionStateProps & {
                    chartFieldsEditorProps: DashboardChartFieldsEditorProps & {
                        resolveChartData: ChartDataResolver;
                    };
                })
          ))
    );
