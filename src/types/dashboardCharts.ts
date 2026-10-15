import type {FlexProps} from '@gravity-ui/uikit';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import type {DashboardProps} from './dashboard';
import type {
    ChartData,
    ChartEditorProps,
    ChartFieldsChartType,
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
    'formValues' | 'onSubmit' | 'onCancel'
> & {
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
    chartItems?: DashboardItem[];
    defaultLayout?: DashboardProps['defaultLayout'];
    onItemsChange?: (items: DashboardItem[]) => void;
    onLayoutChange?: (layout: ConfigLayout[]) => void;
};

export type DashboardChartsProps = DashboardChartsCommonProps &
    (
        | {
              editorMode?: 'series';
              dataSource: {
                  [chartType in ChartSeries['type']]?: ChartEditorProps['chartSeriesMap'];
              };
              chartEditorProps?: Omit<ChartEditorProps, 'onSubmit' | 'onCancel' | 'chartSeriesMap'>;
              chartFieldsEditorProps?: never;
          }
        | {
              editorMode: 'fields';
              chartFieldsEditorProps: DashboardChartFieldsEditorProps;
              dataSource?: never;
              chartEditorProps?: never;
          }
    );
