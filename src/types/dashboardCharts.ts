import type {ReactNode} from 'react';
import type {ChartData} from '@gravity-ui/charts';
import type {ConfigLayout, ReactGridLayoutProps} from '@gravity-ui/dashkit';
import type {IconData} from '@gravity-ui/uikit';

import type {
    ChartEditorFormValues,
    ChartEditorLabels,
    ChartEditorOption,
} from '../components/ChartEditorForm';

export type DashboardChartCategory =
    'Area' | 'BarX' | 'BarY' | 'Line' | 'Pie' | 'Scatter' | 'Waterfall';

export type DashboardChartEditorValues = ChartEditorFormValues;
export type DashboardChartEditorOption<TValue extends string = string> = ChartEditorOption<TValue>;
export type DashboardChartEditorLabels = ChartEditorLabels;

export type DashboardChart<TCategory extends string = DashboardChartCategory> = {
    id: string;
    category: TCategory;
    values: DashboardChartEditorValues;
    data: ChartData;
};

export type DashboardChartOption<TCategory extends string = DashboardChartCategory> = {
    value: TCategory;
    text: ReactNode;
    icon: IconData;
    editorContent?: ReactNode;
    disabled?: boolean;
    hidden?: boolean;
};

export type DashboardChartsProps<TCategory extends string = DashboardChartCategory> = {
    /** Controlled chart collection. Use `defaultCharts` for an uncontrolled widget. */
    charts?: readonly DashboardChart<TCategory>[];
    defaultCharts?: readonly DashboardChart<TCategory>[];
    /** Options shown by AddChartButton and in the ChartEditor category field. */
    chartOptions?: readonly DashboardChartOption<TCategory>[];
    /** Builds the editor preview and the chart snapshot that is added to the dashboard. */
    getChartData: (
        category: TCategory,
        values: DashboardChartEditorValues,
    ) => ChartData | undefined;
    getDefaultEditorValues?: (category: TCategory) => DashboardChartEditorValues;
    xOptions?: DashboardChartEditorOption[];
    axisTypeOptions?: DashboardChartEditorOption[];
    editorLabels?: DashboardChartEditorLabels;
    editorEmptyDataLabel?: string;
    /** Controlled dashboard layout. Use `defaultLayout` for an uncontrolled layout. */
    layout?: ConfigLayout[];
    defaultLayout?: ConfigLayout[];
    grid?: ReactGridLayoutProps;
    addChartText?: ReactNode;
    emptyTitle?: ReactNode;
    emptyDescription?: ReactNode;
    disabled?: boolean;
    className?: string;
    onChartsChange?: (charts: DashboardChart<TCategory>[]) => void;
    onChartAdd?: (chart: DashboardChart<TCategory>) => void;
    onLayoutChange?: (layout: ConfigLayout[]) => void;
};
