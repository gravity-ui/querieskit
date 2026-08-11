import React, {useMemo, useState} from 'react';
import type {ChartData} from '@gravity-ui/charts';
import type {Meta, StoryObj} from '@storybook/react';

import {ChartEditor} from './ChartEditor';
import {
    DEFAULT_CHART_EDITOR_FORM_VALUES,
    type GravityChartCategory,
    applyGravityChartsFormValues,
    gravityChartCategoryOptions,
} from './transform';
import type {ChartEditorFormValues} from './types';

const createCartesianData = (type: 'area' | 'bar-x' | 'line' | 'scatter'): ChartData => {
    const linePoints = [
        82, 46, 54, 49, 38, 41, 65, 46, 58, 58, 54, 30, 38, 65, 36, 53, 45, 75, 69, 64, 31, 38, 53,
        66, 52, 33, 34, 38, 37, 34, 26,
    ].map((y, index) => ({x: Number(1 + index * 0.15).toFixed(2), y}));

    return {
        colors: ['#3d97f2'],
        legend: {enabled: false},
        xAxis: {type: 'linear' as const},
        yAxis: [{type: 'linear' as const}],
        series: {
            data: [{type, name: 'Value', data: linePoints}],
        },
    };
};

const categoryLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const categoryValues = [46, 65, 38, 75, 53, 34];

const data: Partial<Record<GravityChartCategory, ChartData>> = {
    Area: createCartesianData('area'),
    BarX: {
        colors: ['#3d97f2'],
        legend: {enabled: false},
        xAxis: {type: 'category', categories: categoryLabels},
        yAxis: [{type: 'linear', min: 0}],
        series: {
            data: [
                {
                    type: 'bar-x',
                    name: 'Value',
                    data: categoryValues.map((y, index) => ({x: index, y})),
                },
            ],
        },
    },
    BarY: {
        colors: ['#3d97f2'],
        legend: {enabled: false},
        xAxis: {type: 'linear', min: 0},
        yAxis: [{type: 'category', categories: categoryLabels}],
        series: {
            data: [
                {
                    type: 'bar-y',
                    name: 'Value',
                    data: categoryValues.map((x, index) => ({x, y: index})),
                },
            ],
        },
    },
    Line: createCartesianData('line'),
    Pie: {
        colors: ['#3d97f2', '#ffbe5c', '#5dbd89', '#ff7a90', '#8f72dc', '#6bc5e8'],
        legend: {enabled: true, position: 'bottom'},
        series: {
            data: [
                {
                    type: 'pie',
                    data: categoryValues.map((value, index) => ({
                        name: categoryLabels[index],
                        value,
                    })),
                },
            ],
        },
    },
    Scatter: createCartesianData('scatter'),
    Waterfall: {
        colors: ['#3d97f2'],
        legend: {enabled: false},
        xAxis: {type: 'category', categories: [...categoryLabels, 'Total']},
        yAxis: [{type: 'linear'}],
        series: {
            data: [
                {
                    type: 'waterfall',
                    name: 'Value',
                    positiveColor: '#5dbd89',
                    negativeColor: '#ff7a90',
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
    },
};

const meta: Meta<typeof ChartEditor<GravityChartCategory>> = {
    title: 'Modules/ChartEditor',
    component: ChartEditor,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof ChartEditor<GravityChartCategory>>;

const ControlledStory = () => {
    const [category, setCategory] = useState<GravityChartCategory>('Line');
    const [formValues, setFormValues] = useState<ChartEditorFormValues>({
        ...DEFAULT_CHART_EDITOR_FORM_VALUES,
        x: 'Step',
        axisType: 'category',
    });

    const chartData = data[category];
    const preparedChartData = useMemo(
        () => (chartData ? applyGravityChartsFormValues(chartData, formValues) : undefined),
        [chartData, formValues],
    );

    return (
        <ChartEditor
            data={preparedChartData}
            chartFormProps={{
                category,
                onCategoryChange: setCategory,
                categoryOptions: gravityChartCategoryOptions,
                formValues,
                onFormValuesChange: setFormValues,
                labels: {formTitle: `Add ${category.toLowerCase()} chart`},
                xOptions: [
                    {value: 'Step', content: 'Step'},
                    {value: 'Timestamp', content: 'Timestamp'},
                    {value: 'Value', content: 'Value'},
                ],
                onCancel: () => console.info('cancel'),
                onSubmit: () => console.info('submit', {category, formValues}),
            }}
        />
    );
};

export const Default: Story = {render: () => <ControlledStory />};

const EmptyStory = () => {
    const [category, setCategory] = useState<GravityChartCategory>('Pie');
    const [formValues, setFormValues] = useState<ChartEditorFormValues>(
        DEFAULT_CHART_EDITOR_FORM_VALUES,
    );

    const chartData = category === 'Line' ? data.Line : undefined;
    const preparedChartData = useMemo(
        () => (chartData ? applyGravityChartsFormValues(chartData, formValues) : undefined),
        [chartData, formValues],
    );

    return (
        <ChartEditor
            data={preparedChartData}
            chartFormProps={{
                category,
                onCategoryChange: setCategory,
                categoryOptions: gravityChartCategoryOptions,
                formValues,
                onFormValuesChange: setFormValues,
            }}
        />
    );
};

export const WithoutSelectedCategoryData: Story = {render: () => <EmptyStory />};

const CustomButtonsStory = () => {
    const [category, setCategory] = useState<GravityChartCategory>('BarX');
    const [formValues, setFormValues] = useState<ChartEditorFormValues>({
        ...DEFAULT_CHART_EDITOR_FORM_VALUES,
        axisType: 'category',
    });

    const chartData = data[category];
    const preparedChartData = useMemo(
        () => (chartData ? applyGravityChartsFormValues(chartData, formValues) : undefined),
        [chartData, formValues],
    );

    return (
        <ChartEditor
            data={preparedChartData}
            chartFormProps={{
                category,
                onCategoryChange: setCategory,
                categoryOptions: gravityChartCategoryOptions,
                formValues: formValues,
                onFormValuesChange: setFormValues,
                labels: {cancelLabel: 'Discard', submitLabel: 'Save chart'},
                onCancel: () => console.info('discard'),
                onSubmit: () => console.info('save', {category, formValues}),
            }}
        />
    );
};

export const CustomButtonLabels: Story = {render: () => <CustomButtonsStory />};

const multiLineChartData: ChartData = {
    colors: ['#3d97f2', '#ffbe5c', '#5dbd89'],
    legend: {enabled: true, position: 'bottom'},
    xAxis: {type: 'linear'},
    yAxis: [{type: 'linear'}],
    series: {
        data: [
            {
                type: 'line',
                name: 'Series A',
                data: [82, 46, 54, 49, 38, 41, 65, 46, 58, 58, 54].map((y, index) => ({
                    x: Number((1 + index * 0.15).toFixed(2)),
                    y,
                })),
            },
            {
                type: 'line',
                name: 'Series B',
                data: [30, 55, 60, 35, 48, 52, 40, 62, 50, 44, 57].map((y, index) => ({
                    x: Number((1 + index * 0.15).toFixed(2)),
                    y,
                })),
            },
            {
                type: 'line',
                name: 'Series C',
                data: [70, 40, 45, 60, 30, 55, 35, 50, 42, 66, 33].map((y, index) => ({
                    x: Number((1 + index * 0.15).toFixed(2)),
                    y,
                })),
            },
        ],
    },
};

const MultipleLinesStory = () => {
    const [category, setCategory] = useState<GravityChartCategory>('Line');
    const [formValues, setFormValues] = useState<ChartEditorFormValues>({
        ...DEFAULT_CHART_EDITOR_FORM_VALUES,
        x: 'Step',
        axisType: 'linear',
        showLegend: true,
    });

    const preparedChartData = useMemo(
        () => applyGravityChartsFormValues(multiLineChartData, formValues),
        [formValues],
    );

    return (
        <ChartEditor
            data={preparedChartData}
            chartFormProps={{
                category,
                formValues,
                onCategoryChange: setCategory,
                categoryOptions: gravityChartCategoryOptions,
                onFormValuesChange: setFormValues,
                labels: {formTitle: 'Multi-line chart'},
                xOptions: [
                    {value: 'Step', content: 'Step'},
                    {value: 'Timestamp', content: 'Timestamp'},
                ],
                onCancel: () => console.info('cancel'),
                onSubmit: () => console.info('submit', {category, formValues}),
            }}
        />
    );
};

export const MultipleLines: Story = {render: () => <MultipleLinesStory />};
