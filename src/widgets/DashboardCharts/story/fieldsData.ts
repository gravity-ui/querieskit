import type {
    ChartData,
    ChartEditorOption,
    ChartFieldsChartType,
    ChartSelectedFormValues,
    ChartSeries,
} from '../../../types/chartEditor';
import type {DashboardChartFieldsEditorProps, DashboardItem} from '../../../types/dashboardCharts';

const rows: Record<string, number | string>[] = [
    {
        time: Date.UTC(2026, 7, 10),
        requests: 620,
        errors: 12,
        duration: 180,
        region: 'Europe',
        service: 'Search',
        source: 'Console',
        target: 'Parser',
    },
    {
        time: Date.UTC(2026, 7, 11),
        requests: 710,
        errors: 9,
        duration: 165,
        region: 'Europe',
        service: 'Search',
        source: 'Console',
        target: 'Parser',
    },
    {
        time: Date.UTC(2026, 7, 12),
        requests: 680,
        errors: 15,
        duration: 210,
        region: 'Europe',
        service: 'Storage',
        source: 'API',
        target: 'Parser',
    },
    {
        time: Date.UTC(2026, 7, 13),
        requests: 790,
        errors: 8,
        duration: 155,
        region: 'Asia',
        service: 'Search',
        source: 'Parser',
        target: 'Execution',
    },
    {
        time: Date.UTC(2026, 7, 14),
        requests: 860,
        errors: 11,
        duration: 170,
        region: 'Asia',
        service: 'Storage',
        source: 'Parser',
        target: 'Cache',
    },
];

const metrics = [
    {value: 'requests', content: 'Requests'},
    {value: 'errors', content: 'Errors'},
    {value: 'duration', content: 'Duration (ms)'},
];
const categories = [
    {value: 'region', content: 'Region'},
    {value: 'service', content: 'Service'},
];
export const chartTypeOptions: ChartEditorOption<ChartFieldsChartType>[] = [
    {value: 'line', content: 'Line'},
    {value: 'area', content: 'Area'},
    {value: 'scatter', content: 'Scatter'},
    {value: 'bar-x', content: 'Vertical bars'},
    {value: 'bar-y', content: 'Horizontal bars'},
    {value: 'pie', content: 'Pie'},
    {value: 'treemap', content: 'Treemap'},
    {value: 'sankey', content: 'Sankey'},
];

export const getInitialFormValues = (chartType: ChartFieldsChartType): ChartSelectedFormValues => {
    switch (chartType) {
        case 'pie':
            return {
                chartType,
                categoryFieldId: 'region',
                valueFieldId: 'requests',
                showLegend: true,
            };
        case 'treemap':
            return {
                chartType,
                levels: [
                    {id: 'region-level', fieldId: 'region'},
                    {id: 'service-level', fieldId: 'service'},
                ],
                valueFieldId: 'requests',
                showLegend: true,
            };
        case 'sankey':
            return {
                chartType,
                sourceFieldId: 'source',
                targetFieldId: 'target',
                valueFieldId: 'requests',
                showLegend: true,
            };
        default:
            return {
                chartType,
                dimensionFieldId: chartType === 'scatter' ? 'duration' : 'time',
                dimensionAxisType: chartType === 'scatter' ? 'linear' : 'datetime',
                measureItems: [{id: 'requests-series', fieldId: 'requests'}],
                showLegend: true,
            };
    }
};

/** JSON-encoded path arrays avoid collisions between labels containing separators. */
export function aggregateHierarchy(
    data: readonly Record<string, string | number>[],
    levels: readonly string[],
    valueField: string,
) {
    const nodes = new Map<string, {id: string; parentId?: string; name: string; value?: number}>();
    for (const row of data) {
        const path: string[] = [];
        levels.forEach((field, index) => {
            const parentId = path.length ? JSON.stringify(path) : undefined;
            const name = String(row[field]);
            path.push(name);
            const id = JSON.stringify(path);
            let node = nodes.get(id);
            if (!node) {
                node = {id, parentId, name};
                nodes.set(id, node);
            }
            if (index === levels.length - 1)
                node.value = (node.value ?? 0) + Number(row[valueField]);
        });
    }
    return [...nodes.values()];
}

export function aggregateCategories(
    data: readonly Record<string, string | number>[],
    category: string,
    value: string,
) {
    const totals = new Map<string, number>();
    for (const row of data) {
        const name = String(row[category]);
        totals.set(name, (totals.get(name) ?? 0) + Number(row[value]));
    }
    return [...totals].map(([name, total]) => ({name, value: total}));
}

export function aggregateFlows(
    data: readonly Record<string, string | number>[],
    source: string,
    target: string,
    value: string,
) {
    const nodes = new Map<string, Map<string, number>>();
    for (const row of data) {
        const from = String(row[source]);
        const to = String(row[target]);
        const links = nodes.get(from) ?? new Map<string, number>();
        nodes.set(from, links);
        if (!nodes.has(to)) nodes.set(to, new Map());
        links.set(to, (links.get(to) ?? 0) + Number(row[value]));
    }
    return [...nodes].map(([name, links]) => ({
        name,
        links: [...links].map(([targetName, total]) => ({name: targetName, value: total})),
    }));
}

/** Example-specific conversion: the library does not infer grouping or aggregation. */
export function getChartData(values: ChartSelectedFormValues): ChartData | undefined {
    const {chartType} = values;
    if (values.chartType === 'pie') {
        if (!values.categoryFieldId || !values.valueFieldId) return undefined;
        return {
            series: {
                data: [
                    {
                        type: 'pie',
                        seriesId: 'pie',
                        data: aggregateCategories(
                            rows,
                            values.categoryFieldId,
                            values.valueFieldId,
                        ),
                    },
                ],
            },
        };
    }
    if (values.chartType === 'treemap') {
        const levels = values.levels
            .map(({fieldId}) => fieldId)
            .filter((field): field is string => Boolean(field));
        if (!values.valueFieldId || !levels.length || levels.length !== values.levels.length)
            return undefined;
        return {
            series: {
                data: [
                    {
                        type: 'treemap',
                        seriesId: 'hierarchy',
                        name: 'Requests by hierarchy',
                        data: aggregateHierarchy(rows, levels, values.valueFieldId),
                        dataLabels: {enabled: true},
                    },
                ],
            },
        };
    }
    if (values.chartType === 'sankey') {
        if (!values.sourceFieldId || !values.targetFieldId || !values.valueFieldId)
            return undefined;
        return {
            series: {
                data: [
                    {
                        type: 'sankey',
                        seriesId: 'flows',
                        name: 'Request flow',
                        data: aggregateFlows(
                            rows,
                            values.sourceFieldId,
                            values.targetFieldId,
                            values.valueFieldId,
                        ),
                    },
                ],
            },
        };
    }
    const {dimensionFieldId, dimensionAxisType} = values;
    if (!dimensionFieldId || !values.measureItems.length) return undefined;
    const series: ChartSeries[] = [];
    for (const {id, fieldId} of values.measureItems) {
        if (!fieldId) return undefined;
        const data = rows.map((row) => {
            const raw = row[dimensionFieldId];
            let dimension: string | number = Number(raw);
            if (dimensionAxisType === 'category') {
                dimension =
                    dimensionFieldId === 'time'
                        ? new Date(Number(raw)).toISOString().slice(0, 10)
                        : String(raw);
            }
            const measure = Number(row[fieldId]);
            return values.chartType === 'bar-y'
                ? {x: measure, y: dimension}
                : {x: dimension, y: measure};
        });
        series.push({
            type: values.chartType,
            seriesId: id,
            name: metrics.find((field) => field.value === fieldId)?.content ?? fieldId,
            data,
        });
    }
    return {
        series: {data: series},
        xAxis: {type: chartType === 'bar-y' ? 'linear' : dimensionAxisType},
        yAxis: [{type: chartType === 'bar-y' ? dimensionAxisType : 'linear'}],
    };
}

export const fieldsEditorProps: DashboardChartFieldsEditorProps = {
    chartTypeOptions,
    getFieldOptions: ({chartType, role}) => {
        if (role === 'dimension')
            return chartType === 'scatter'
                ? metrics
                : [{value: 'time', content: 'Time'}, ...metrics];
        if (role === 'measure' || role === 'value') return metrics;
        if (role === 'source') return [{value: 'source', content: 'Source stage'}];
        if (role === 'target') return [{value: 'target', content: 'Target stage'}];
        return categories;
    },
    axisVariants: ['datetime', 'linear', 'category', 'logarithmic'],
    getInitialFormValues,
    getChartData,
};

export const fieldsChartItems: DashboardItem[] = chartTypeOptions.map(({value}) => {
    const fieldsFormValues = {...getInitialFormValues(value), chartTitle: `Saved ${value} chart`};
    const chartData = getChartData(fieldsFormValues);
    if (!chartData) throw new Error(`Incomplete example bindings for ${value}`);
    return {
        id: `saved-${value}`,
        fieldsFormValues,
        chartData: {
            ...chartData,
            title: {text: fieldsFormValues.chartTitle},
            legend: {enabled: true},
        },
    };
});
