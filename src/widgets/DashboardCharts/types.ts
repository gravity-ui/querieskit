import type {ChartData, ChartSeries} from '@gravity-ui/charts';
import type {DashboardProps} from '../../components';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import {ChartEditorProps} from '../../modules';
import {FlexProps} from '@gravity-ui/uikit';

export type DashboardItem = {
    id: string;
    chartData: ChartData<{dataId: string}>;
};

export type DashboardChartsProps = {
    dataSource: {
        [chartType in ChartSeries['type']]?: ChartEditorProps['chartSeriesMap'];
    };

    emptyTitle?: string;
    emptyDescription?: string;
    className?: string;
    gap?: FlexProps['gap'];

    chartEditorProps?: Omit<ChartEditorProps, 'onSubmit' | 'onCancel' | 'chartSeriesMap'>;
    dashboardProps?: Pick<DashboardProps, 'grid' | 'focusable' | 'className'>;

    chartItems?: DashboardItem[];
    chartsLayout?: ConfigLayout[];

    onItemsChange?: (items: DashboardItem[]) => void;
    onLayoutChange?: (layout: ConfigLayout[]) => void;
};
