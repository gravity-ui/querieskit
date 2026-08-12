import type {ChartData} from '@gravity-ui/charts';

import type {ChartEditorFormValues, ChartEditorOption} from '../../components/ChartEditorForm';

export const GRAVITY_CHART_CATEGORIES = [
    'Area',
    'BarX',
    'BarY',
    'Line',
    'Pie',
    'Scatter',
    'Waterfall',
] as const;

export type GravityChartCategory = (typeof GRAVITY_CHART_CATEGORIES)[number];

export const gravityChartCategoryOptions: ChartEditorOption<GravityChartCategory>[] =
    GRAVITY_CHART_CATEGORIES.map((value) => ({value, content: value}));

export const gravityAxisTypeOptions: ChartEditorOption[] = [
    {value: 'category', content: 'category'},
    {value: 'linear', content: 'linear'},
    {value: 'datetime', content: 'datetime'},
    {value: 'logarithmic', content: 'logarithmic'},
];

export const DEFAULT_CHART_EDITOR_FORM_VALUES: ChartEditorFormValues = {
    x: '',
    axisType: 'category',
    chartTitle: '',
    xTitle: '',
    yTitle: '',
    showLegend: false,
};

const getCategoryLabels = (chartData: ChartData): string[] => {
    const firstSeries = chartData.series.data[0];

    if (!firstSeries || !('data' in firstSeries) || !Array.isArray(firstSeries.data)) {
        return [];
    }

    return firstSeries.data.map((point, index) => {
        if (typeof point !== 'object' || point === null) {
            return String(index + 1);
        }

        if ('name' in point && typeof point.name === 'string') {
            return point.name;
        }

        if ('x' in point && (typeof point.x === 'string' || typeof point.x === 'number')) {
            return String(point.x);
        }

        return String(index + 1);
    });
};

const getSeriesForAxisType = (
    chartData: ChartData,
    axisType: ChartEditorFormValues['axisType'],
): ChartData['series'] => {
    if (axisType !== 'category' || chartData.xAxis?.type === 'category') {
        return chartData.series;
    }

    return {
        ...chartData.series,
        data: chartData.series.data.map((series) => ({
            ...series,
            data: series.data.map((point, index) =>
                point &&
                typeof point === 'object' &&
                'x' in point &&
                (typeof point.x === 'string' || typeof point.x === 'number')
                    ? {...point, x: index}
                    : point,
            ),
        })) as ChartData['series']['data'],
    };
};

export const applyGravityChartsFormValues = (
    chartData: ChartData,
    values: ChartEditorFormValues,
): ChartData => {
    const firstYAxis = chartData.yAxis?.[0];
    const isSameXAxisType = chartData.xAxis?.type === values.axisType;
    const categories =
        values.axisType === 'category'
            ? chartData.xAxis?.categories?.length
                ? chartData.xAxis.categories
                : getCategoryLabels(chartData)
            : undefined;

    return {
        ...chartData,
        legend: {...chartData.legend, enabled: values.showLegend},
        title: {...chartData.title, text: values.chartTitle},
        series: getSeriesForAxisType(chartData, values.axisType),
        xAxis: {
            ...chartData.xAxis,
            type: values.axisType,
            categories,
            min: isSameXAxisType ? chartData.xAxis?.min : undefined,
            max: isSameXAxisType ? chartData.xAxis?.max : undefined,
            ticks: isSameXAxisType ? chartData.xAxis?.ticks : undefined,
            title: {...chartData.xAxis?.title, text: values.xTitle},
        },
        yAxis: [
            {...firstYAxis, title: {...firstYAxis?.title, text: values.yTitle}},
            ...(chartData.yAxis?.slice(1) ?? []),
        ],
    };
};
