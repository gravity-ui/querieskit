import type {DashboardProps} from '../../components/Dashboard';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import type {ChartData, ChartSeries} from '../../modules/ChartEditor/types';
import type {ChartEditorProps} from '../../modules/ChartEditor';
import type {FlexProps} from '@gravity-ui/uikit';

export type DashboardItem = {
    id: string;
    chartData: ChartData;
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
    defaultLayout?: DashboardProps['defaultLayout'];

    onItemsChange?: (items: DashboardItem[]) => void;
    onLayoutChange?: (layout: ConfigLayout[]) => void;
};
