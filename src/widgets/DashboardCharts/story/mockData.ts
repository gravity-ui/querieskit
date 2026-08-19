import type {ChartData, ChartSeries} from '@gravity-ui/charts';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import type {ChartEditorProps} from '../../../modules';

import type {DashboardChartsProps} from '../types';

type DashboardChartItem = NonNullable<DashboardChartsProps['chartItems']>[number];

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const timeSeriesStart = Date.UTC(2026, 7, 10);

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const services = ['Query API', 'Scheduler', 'Metadata', 'Storage', 'Monitoring'];

export const lineSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    'query-rate-current': {
        type: 'line',
        name: 'Current week',
        custom: {dataId: 'query-rate-current'},
        seriesId: 'query-rate-current',
        marker: {enabled: true},
        data: [620, 710, 680, 790, 860, 740, 810].map((y, index) => ({
            x: timeSeriesStart + index * day,
            y,
        })),
    },
    'query-rate-previous': {
        type: 'line',
        name: 'Previous week',
        custom: {dataId: 'query-rate-previous'},
        seriesId: 'query-rate-current',
        dashStyle: 'Dash',
        marker: {enabled: false},
        data: [580, 640, 650, 700, 760, 720, 750].map((y, index) => ({
            x: timeSeriesStart + index * day,
            y,
        })),
    },
};

export const areaSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    interactive: {
        type: 'area',
        name: 'Interactive',
        custom: {dataId: 'interactive'},
        seriesId: 'interactive',
        stacking: 'normal',
        stackId: 'workload',
        data: [210, 245, 230, 285, 310, 275, 320].map((y, x) => ({x, y})),
    },
    scheduled: {
        type: 'area',
        name: 'Scheduled',
        seriesId: 'scheduled',
        stacking: 'normal',
        stackId: 'workload',
        data: [140, 155, 170, 165, 190, 205, 215].map((y, x) => ({x, y})),
    },
    background: {
        type: 'area',
        name: 'Background',
        seriesId: 'background',
        stacking: 'normal',
        stackId: 'workload',
        data: [70, 82, 76, 95, 88, 102, 110].map((y, x) => ({x, y})),
    },
};

export const columnSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    compiled: {
        type: 'bar-x',
        name: 'Compiled',
        seriesId: 'compiled',
        borderRadius: 3,
        data: [480, 560, 610, 590, 680, 720, 650].map((y, x) => ({x, y})),
    },
    cached: {
        type: 'bar-x',
        name: 'Cached',
        seriesId: 'cached',
        borderRadius: 3,
        data: [260, 310, 350, 380, 420, 460, 440].map((y, x) => ({x, y})),
    },
};

export const horizontalBarSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    completed: {
        type: 'bar-y',
        name: 'Completed',
        seriesId: 'completed',
        borderRadius: 3,
        dataLabels: {enabled: true},
        data: [94, 86, 78, 71, 63].map((x, y) => ({x, y})),
    },
};

export const scatterSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    cached: {
        type: 'scatter',
        name: 'Cached queries',
        custom: {dataId: 'cached'},
        seriesId: 'cached',
        data: [
            {x: 8, y: 46, radius: 5},
            {x: 16, y: 62, radius: 6},
            {x: 24, y: 79, radius: 5},
            {x: 36, y: 105, radius: 7},
            {x: 48, y: 128, radius: 6},
            {x: 64, y: 155, radius: 8},
        ],
    },
    uncached: {
        type: 'scatter',
        name: 'Uncached queries',
        custom: {dataId: 'uncached'},
        seriesId: 'uncached',
        symbolType: 'square',
        data: [
            {x: 10, y: 95, radius: 5},
            {x: 18, y: 135, radius: 6},
            {x: 28, y: 190, radius: 7},
            {x: 40, y: 255, radius: 8},
            {x: 52, y: 325, radius: 7},
            {x: 68, y: 410, radius: 9},
        ],
    },
};

export const pieSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    'query-origins': {
        type: 'pie',
        custom: {dataId: 'query-origins'},
        seriesId: 'query-origins',
        innerRadius: '55%',
        dataLabels: {enabled: true},
        data: [
            {name: 'Console', value: 38, label: '38%'},
            {name: 'API', value: 31, label: '31%'},
            {name: 'Scheduler', value: 21, label: '21%'},
            {name: 'Other', value: 10, label: '10%'},
        ],
    },
};

export const treemapSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    storage: {
        type: 'treemap',
        name: 'Storage',
        custom: {dataId: 'storage'},
        seriesId: 'storage',
        layoutAlgorithm: 'squarify',
        dataLabels: {enabled: true},
        data: [
            {id: 'production', name: 'Production'},
            {id: 'analytics', name: 'Analytics'},
            {name: 'Events', value: 42, parentId: 'production'},
            {name: 'Users', value: 28, parentId: 'production'},
            {name: 'Reports', value: 24, parentId: 'analytics'},
            {name: 'Experiments', value: 16, parentId: 'analytics'},
        ],
    },
};

export const waterfallSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    'monthly-cost': {
        type: 'waterfall',
        name: 'Monthly cost',
        custom: {dataId: 'monthly-cost'},
        seriesId: 'monthly-cost',
        dataLabels: {enabled: true},
        data: [
            {x: 0, y: 120, label: 'Baseline'},
            {x: 1, y: 34, label: 'Compute'},
            {x: 2, y: 18, label: 'Storage'},
            {x: 3, y: -27, label: 'Cache'},
            {x: 4, y: -12, label: 'Optimizations'},
            {x: 5, total: true, label: 'Total'},
        ],
    },
};

export const sankeySeriesMap: ChartEditorProps['chartSeriesMap'] = {
    'query-flow': {
        type: 'sankey',
        name: 'Query flow',
        custom: {dataId: 'query-flow'},
        seriesId: 'query-flow',
        data: [
            {name: 'Console', links: [{name: 'Parser', value: 44}]},
            {name: 'API', links: [{name: 'Parser', value: 36}]},
            {
                name: 'Parser',
                links: [
                    {name: 'Cache', value: 30},
                    {name: 'Execution', value: 50},
                ],
            },
            {name: 'Cache', links: [{name: 'Results', value: 30}]},
            {name: 'Execution', links: [{name: 'Results', value: 50}]},
            {name: 'Results', links: []},
        ],
    },
};

const radarCategories = [
    {key: 'CPU', maxValue: 100},
    {key: 'Memory', maxValue: 100},
    {key: 'I/O', maxValue: 100},
    {key: 'Latency', maxValue: 100},
    {key: 'Throughput', maxValue: 100},
];

export const radarSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    interactive: {
        type: 'radar',
        name: 'Interactive',
        custom: {dataId: 'interactive'},
        seriesId: 'interactive',
        categories: radarCategories,
        data: [72, 64, 45, 88, 76].map((value) => ({value})),
    },
    batch: {
        type: 'radar',
        name: 'Batch',
        custom: {dataId: 'batch'},
        seriesId: 'batch',
        categories: radarCategories,
        data: [86, 91, 82, 48, 94].map((value) => ({value})),
    },
};

export const heatmapSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    activity: {
        type: 'heatmap',
        name: 'Query activity',
        custom: {dataId: 'activity'},
        seriesId: 'activity',
        dataLabels: {enabled: true},
        data: weekdays.flatMap((_, y) =>
            [0, 1, 2, 3, 4, 5].map((x) => ({
                x,
                y,
                value: 18 + ((x * 17 + y * 11) % 73),
            })),
        ),
    },
};

export const funnelSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    optimization: {
        type: 'funnel',
        name: 'Optimization',
        custom: {dataId: 'optimization'},
        seriesId: 'optimization',
        shape: 'rectangle',
        dataLabels: {enabled: true, inside: true},
        data: [
            {name: 'Submitted', value: 1250, label: 'Submitted · 1,250'},
            {name: 'Parsed', value: 1180, label: 'Parsed · 1,180'},
            {name: 'Optimized', value: 940, label: 'Optimized · 940'},
            {name: 'Executed', value: 810, label: 'Executed · 810'},
            {name: 'Cached', value: 520, label: 'Cached · 520'},
        ],
    },
};

export const xRangeSeriesMap: ChartEditorProps['chartSeriesMap'] = {
    stages: {
        type: 'x-range',
        name: 'Execution stages',
        custom: {dataId: 'stages'},
        seriesId: 'stages',
        borderRadius: 3,
        dataLabels: {enabled: true},
        data: [
            {x0: timeSeriesStart, x1: timeSeriesStart + 2 * hour, y: 0, label: 'Parse'},
            {
                x0: timeSeriesStart + 2 * hour,
                x1: timeSeriesStart + 7 * hour,
                y: 1,
                label: 'Plan',
            },
            {
                x0: timeSeriesStart + 7 * hour,
                x1: timeSeriesStart + 18 * hour,
                y: 2,
                label: 'Execute',
            },
            {
                x0: timeSeriesStart + 18 * hour,
                x1: timeSeriesStart + 22 * hour,
                y: 3,
                label: 'Publish',
            },
        ],
    },
};

export const commonChartsDataSource: DashboardChartsProps['dataSource'] = {
    line: lineSeriesMap,
    area: areaSeriesMap,
    'bar-x': columnSeriesMap,
    'bar-y': horizontalBarSeriesMap,
    scatter: scatterSeriesMap,
    pie: pieSeriesMap,
};

export const advancedChartsDataSource: DashboardChartsProps['dataSource'] = {
    treemap: treemapSeriesMap,
    waterfall: waterfallSeriesMap,
    sankey: sankeySeriesMap,
    radar: radarSeriesMap,
    heatmap: heatmapSeriesMap,
    funnel: funnelSeriesMap,
    'x-range': xRangeSeriesMap,
};

export const allChartTypesDataSource: DashboardChartsProps['dataSource'] = {
    ...commonChartsDataSource,
    ...advancedChartsDataSource,
};

function createChartItem(
    id: string,
    title: string,
    series: ChartSeries<{dataId: string}>[],
    options: Omit<ChartData<{dataId: string}>, 'series' | 'title'> = {},
): DashboardChartItem {
    return {
        id,
        chartData: {
            ...options,
            title: {text: title},
            series: {data: series},
        },
    };
}

function createLayout(
    items: DashboardChartItem[],
    itemsPerRow: number,
    itemWidth: number,
): ConfigLayout[] {
    return items.map(({id}, index) => ({
        i: id,
        x: (index % itemsPerRow) * itemWidth,
        y: Math.floor(index / itemsPerRow) * 4,
        w: itemWidth,
        h: 4,
    }));
}

export const commonChartItems: DashboardChartItem[] = [
    createChartItem('query-rate', 'Query rate', Object.values(lineSeriesMap), {
        legend: {enabled: true},
        xAxis: {type: 'datetime'},
        yAxis: [{type: 'linear', min: 0, title: {text: 'Queries'}}],
    }),
    createChartItem('workload', 'Workload composition', Object.values(areaSeriesMap), {
        legend: {enabled: true},
        xAxis: {type: 'category', categories: weekdays},
        yAxis: [{type: 'linear', min: 0, title: {text: 'Queries'}}],
    }),
    createChartItem('compilation', 'Compilation results', Object.values(columnSeriesMap), {
        legend: {enabled: true},
        xAxis: {type: 'category', categories: weekdays},
        yAxis: [{type: 'linear', min: 0}],
    }),
    createChartItem(
        'service-progress',
        'Completed tasks by service',
        [horizontalBarSeriesMap.completed],
        {
            legend: {enabled: false},
            xAxis: {type: 'linear', min: 0},
            yAxis: [{type: 'category', categories: services}],
        },
    ),
    createChartItem('cache-effect', 'Data scanned vs duration', Object.values(scatterSeriesMap), {
        legend: {enabled: true},
        xAxis: {type: 'linear', title: {text: 'Data scanned, GB'}},
        yAxis: [{type: 'linear', min: 0, title: {text: 'Duration, ms'}}],
    }),
    createChartItem('query-origins', 'Query origins', [pieSeriesMap['query-origins']], {
        legend: {enabled: true},
    }),
];

export const commonChartsLayout = createLayout(commonChartItems, 3, 2);

export const advancedChartItems: DashboardChartItem[] = [
    createChartItem('storage', 'Storage distribution', [treemapSeriesMap.storage], {
        legend: {enabled: false},
    }),
    createChartItem('monthly-cost', 'Monthly cost change', [waterfallSeriesMap['monthly-cost']], {
        legend: {enabled: false},
        xAxis: {
            type: 'category',
            categories: ['Baseline', 'Compute', 'Storage', 'Cache', 'Optimizations', 'Total'],
        },
        yAxis: [{type: 'linear'}],
    }),
    createChartItem('query-flow', 'Query data flow', [sankeySeriesMap['query-flow']], {
        legend: {enabled: false},
    }),
    createChartItem('workload-profile', 'Workload profile', Object.values(radarSeriesMap), {
        legend: {enabled: true},
    }),
    createChartItem('activity', 'Activity by weekday and time', [heatmapSeriesMap.activity], {
        legend: {enabled: false},
        xAxis: {
            type: 'category',
            categories: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        },
        yAxis: [{type: 'category', categories: weekdays}],
    }),
    createChartItem('optimization', 'Query optimization funnel', [funnelSeriesMap.optimization], {
        legend: {enabled: false},
    }),
    createChartItem('execution-stages', 'Execution stages', [xRangeSeriesMap.stages], {
        legend: {enabled: false},
        xAxis: {type: 'datetime'},
        yAxis: [
            {
                type: 'category',
                categories: ['Parser', 'Planner', 'Workers', 'Results'],
            },
        ],
    }),
];

export const advancedChartsLayout = createLayout(advancedChartItems, 4, 2);
