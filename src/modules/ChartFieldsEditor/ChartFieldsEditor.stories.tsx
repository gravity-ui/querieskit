import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';
import {ChartFieldsEditor} from './ChartFieldsEditor';
import {
    fieldsEditorProps,
    getInitialFormValues,
} from '../../widgets/DashboardCharts/story/fieldsData';

const meta: Meta<typeof ChartFieldsEditor> = {
    title: 'Modules/ChartFieldsEditor',
    component: ChartFieldsEditor,
    tags: ['autodocs'],
    args: {
        ...fieldsEditorProps,
        formValues: getInitialFormValues('line'),
        onChange: fn(),
        onSubmit: fn(),
        onCancel: fn(),
    },
    decorators: [
        (Story) => (
            <div style={{height: 720}}>
                <Story />
            </div>
        ),
    ],
    render: function Render(args) {
        const [formValues, setFormValues] = useState(args.formValues);
        useEffect(() => setFormValues(args.formValues), [args.formValues]);
        return (
            <ChartFieldsEditor
                {...args}
                formValues={formValues}
                onChange={(value) => {
                    setFormValues(value);
                    args.onChange?.(value);
                }}
            />
        );
    },
};
export default meta;
type Story = StoryObj<typeof ChartFieldsEditor>;
export const Default: Story = {};
export const Incomplete: Story = {
    args: {
        formValues: {
            chartType: 'line',
            dimensionAxisType: 'category',
            measureItems: [{id: 'measure'}],
        },
    },
};
export const EmptyData: Story = {args: {getChartData: () => undefined}};
export const Disabled: Story = {args: {formProps: {disabled: true}}};
export const Pie: Story = {args: {formValues: getInitialFormValues('pie')}};
export const Narrow: Story = {
    decorators: [
        (Story) => (
            <div style={{width: 480}}>
                <Story />
            </div>
        ),
    ],
};
