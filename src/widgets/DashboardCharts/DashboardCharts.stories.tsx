import React from 'react';
import type {ChartData} from '@gravity-ui/charts';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import type {
    DashboardChart,
    DashboardChartCategory,
    DashboardChartEditorValues,
} from '../../types/dashboardCharts';
import {DashboardCharts} from './DashboardCharts';

import './DashboardCharts.stories.scss';

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const values = [46, 65, 38, 75, 53, 34];
const points = values.map((y, x) => ({x, y}));

const defaultEditorValues: DashboardChartEditorValues = {
    x: 'Day',
    axisType: 'category',
    chartTitle: '',
    xTitle: '',
    yTitle: '',
    showLegend: false,
};

const applyEditorValues = (
    data: ChartData,
    editorValues: DashboardChartEditorValues,
): ChartData => ({
    ...data,
    legend: {...data.legend, enabled: editorValues.showLegend},
    title: {...data.title, text: editorValues.chartTitle},
    xAxis: data.xAxis
        ? {
              ...data.xAxis,
              title: {...data.xAxis.title, text: editorValues.xTitle},
          }
        : undefined,
    yAxis: data.yAxis?.map((axis, index) =>
        index === 0 ? {...axis, title: {...axis.title, text: editorValues.yTitle}} : axis,
    ),
});

const createChartData = (
    category: DashboardChartCategory,
    editorValues: DashboardChartEditorValues,
): ChartData => {
    let data: ChartData;

    switch (category) {
        case 'Pie':
            data = {
                series: {
                    data: [
                        {
                            type: 'pie',
                            data: values.map((value, index) => ({
                                name: labels[index],
                                value,
                            })),
                        },
                    ],
                },
            };
            break;
        case 'BarY':
            data = {
                xAxis: {type: 'linear', min: 0},
                yAxis: [{type: 'category', categories: labels}],
                series: {
                    data: [
                        {
                            type: 'bar-y',
                            name: 'Value',
                            data: values.map((x, y) => ({x, y})),
                        },
                    ],
                },
            };
            break;
        case 'Waterfall':
            data = {
                xAxis: {type: 'category', categories: [...labels, 'Total']},
                yAxis: [{type: 'linear'}],
                series: {
                    data: [
                        {
                            type: 'waterfall',
                            name: 'Value',
                            data: [
                                {x: 0, y: 46},
                                {x: 1, y: 19},
                                {x: 2, y: -27},
                                {x: 3, y: 37},
                                {x: 4, y: -22},
                                {x: 5, y: -19},
                                {x: 6, y: 0, total: true},
                            ],
                        },
                    ],
                },
            };
            break;
        default: {
            const typeByCategory = {
                Area: 'area',
                BarX: 'bar-x',
                Line: 'line',
                Scatter: 'scatter',
            } as const;
            const type = typeByCategory[category];

            data = {
                xAxis: {type: 'category', categories: labels},
                yAxis: [{type: 'linear', min: 0}],
                series: {data: [{type, name: 'Value', data: points}]},
            };
        }
    }

    return applyEditorValues(data, editorValues);
};

const initialChart: DashboardChart = {
    id: 'requests',
    category: 'Line',
    values: {...defaultEditorValues, chartTitle: 'Requests'},
    data: createChartData('Line', {...defaultEditorValues, chartTitle: 'Requests'}),
};

const meta: Meta<typeof DashboardCharts<DashboardChartCategory>> = {
    title: 'Widgets/DashboardCharts',
    component: DashboardCharts,
    tags: ['autodocs'],
    parameters: {layout: 'fullscreen'},
};

export default meta;
type Story = StoryObj<typeof DashboardCharts<DashboardChartCategory>>;

const renderWidget = (defaultCharts: DashboardChart[] = []) => (
    <div className="qp-dashboard-charts-story">
        <DashboardCharts
            defaultCharts={defaultCharts}
            getChartData={createChartData}
            getDefaultEditorValues={() => ({...defaultEditorValues})}
            xOptions={[
                {value: 'Day', content: 'Day'},
                {value: 'Timestamp', content: 'Timestamp'},
                {value: 'Value', content: 'Value'},
            ]}
            onChartAdd={action('onChartAdd')}
            onChartsChange={action('onChartsChange')}
            onLayoutChange={action('onLayoutChange')}
        />
    </div>
);

/** Add a chart, save it, then drag or resize it on the dashboard. */
export const Default: Story = {render: () => renderWidget([initialChart])};

/** The empty state keeps the add-chart action available above the dashboard. */
export const Empty: Story = {render: () => renderWidget()};
