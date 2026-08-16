import {
    BranchesRight,
    ChartAreaStacked,
    ChartBar,
    ChartColumn,
    ChartLine,
    ChartPie,
    ChartTreemap,
    Circles4Square,
    Circles5Random,
    CirclesConcentric,
    Funnel,
    ListTimeline,
    SquareBars,
} from '@gravity-ui/icons';
import type {ChartSeries} from '@gravity-ui/charts';
import type {IconData} from '@gravity-ui/uikit';

export const CHART_TYPE_ICONS: Record<ChartSeries['type'], IconData> = {
    area: ChartAreaStacked,
    'bar-x': ChartColumn,
    'bar-y': ChartBar,
    funnel: Funnel,
    heatmap: Circles4Square,
    line: ChartLine,
    pie: ChartPie,
    radar: CirclesConcentric,
    sankey: BranchesRight,
    scatter: Circles5Random,
    treemap: ChartTreemap,
    waterfall: SquareBars,
    'x-range': ListTimeline,
};
