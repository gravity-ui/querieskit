import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import {ChartEditorForm} from './ChartEditorForm';
import type {ChartEditorFormValues, ChartEditorOption} from './types';

type ChartCategory = 'Area' | 'BarX' | 'BarY' | 'Line' | 'Pie' | 'Scatter';

const categoryOptions: ChartEditorOption<ChartCategory>[] = [
    {value: 'Area', content: 'Area'},
    {value: 'BarX', content: 'BarX'},
    {value: 'BarY', content: 'BarY'},
    {value: 'Line', content: 'Line'},
    {value: 'Pie', content: 'Pie'},
    {value: 'Scatter', content: 'Scatter'},
];

const xOptions: ChartEditorOption[] = [
    {value: 'Step', content: 'Step'},
    {value: 'Timestamp', content: 'Timestamp'},
    {value: 'Value', content: 'Value'},
];

const DEFAULT_FORM_VALUES: ChartEditorFormValues = {
    x: 'Step',
    axisType: 'category',
    chartTitle: '',
    xTitle: '',
    yTitle: '',
    showLegend: false,
};

const meta: Meta<typeof ChartEditorForm<ChartCategory>> = {
    title: 'Components/ChartEditorForm',
    component: ChartEditorForm,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof ChartEditorForm<ChartCategory>>;

const ControlledStory = (args: Partial<React.ComponentProps<typeof ChartEditorForm<ChartCategory>>>) => {
    const [category, setCategory] = useState<ChartCategory>(args.category ?? 'Line');
    const [formValues, setFormValues] = useState<ChartEditorFormValues>(
        args.formValues ?? DEFAULT_FORM_VALUES,
    );

    return (
        <ChartEditorForm
            {...args}
            category={category}
            categoryOptions={args.categoryOptions ?? categoryOptions}
            onCategoryChange={(next) => {
                setCategory(next);
                action('onCategoryChange')(next);
            }}
            formValues={formValues}
            onFormValuesChange={(next) => {
                setFormValues(next);
                action('onFormValuesChange')(next);
            }}
            xOptions={args.xOptions ?? xOptions}
            onCancel={action('onCancel')}
            onSubmit={action('onSubmit')}
        />
    );
};

export const Default: Story = {
    render: (args) => <ControlledStory {...args} />,
};

export const WithFilledValues: Story = {
    render: (args) => <ControlledStory {...args} />,
    args: {
        category: 'BarX',
        formValues: {
            x: 'Timestamp',
            axisType: 'datetime',
            chartTitle: 'Requests per minute',
            xTitle: 'Time',
            yTitle: 'Count',
            showLegend: true,
        },
    },
};

export const CustomLabels: Story = {
    render: (args) => <ControlledStory {...args} />,
    args: {
        labels: {
            formTitle: 'Add line chart',
            data: 'Chart type',
            x: 'X axis field',
            axisType: 'X axis scale',
            chartTitle: 'Title',
            xTitle: 'X label',
            yTitle: 'Y label',
            showLegend: 'Display legend',
            cancelLabel: 'Discard',
            submitLabel: 'Save chart',
        },
    },
};

export const Disabled: Story = {
    render: (args) => <ControlledStory {...args} />,
    args: {
        disabled: true,
        formValues: {
            x: 'Step',
            axisType: 'linear',
            chartTitle: 'Disabled chart',
            xTitle: 'X',
            yTitle: 'Y',
            showLegend: true,
        },
    },
};

export const WithoutXOptions: Story = {
    render: (args) => <ControlledStory {...args} />,
    args: {
        xOptions: [],
    },
};
