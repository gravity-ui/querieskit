import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import type {ChartEditorFormValues} from './types';
import {ChartEditorForm} from './ChartEditorForm';

const meta: Meta<typeof ChartEditorForm> = {
    title: 'Components/ChartEditorForm',
    component: ChartEditorForm,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof ChartEditorForm>;

const DefaultChartEditor = () => {
    const [formValues, setFormValues] = useState({});

    return (
        <ChartEditorForm
            axisVariants={['category', 'datetime', 'linear', 'logarithmic']}
            formValues={formValues}
            onFormValuesChange={setFormValues}
        />
    );
};

export const Default: Story = {
    render: () => <DefaultChartEditor />,
};

const DefaultValuesChartEditor = () => {
    const [formValues, setFormValues] = useState<ChartEditorFormValues>({
        xTitle: 'Time',
        yTitle: 'Count',
        showLegend: true,
        axisType: 'category',
    });

    return (
        <ChartEditorForm
            axisVariants={['category', 'datetime', 'linear', 'logarithmic']}
            formValues={formValues}
            onFormValuesChange={setFormValues}
        />
    );
};

export const WithFilledValues: Story = {
    render: () => <DefaultValuesChartEditor />,
};

export const CustomLabels: Story = {
    render: () => (
        <ChartEditorForm
            formValues={{}}
            labels={{
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
            }}
        />
    ),
};

export const Disabled: Story = {
    render: () => (
        <ChartEditorForm
            disabled
            formValues={{
                axisType: 'linear',
                chartTitle: 'Disabled chart',
                xTitle: 'X',
                yTitle: 'Y',
                showLegend: true,
            }}
        />
    ),
};
