import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ChartConfigFields} from './ChartConfigFields';

const meta: Meta<typeof ChartConfigFields> = {
    title: 'Components/ChartConfigFields',
    component: ChartConfigFields,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 400}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof ChartConfigFields>;

export const Default: Story = {
    args: {formValues: {chartTitle: 'Revenue', xTitle: 'Month', yTitle: 'Total', showLegend: true}},
};
export const WithoutAxes: Story = {
    args: {formValues: {chartTitle: 'Revenue by region', showLegend: false}, showAxes: false},
};
export const Disabled: Story = {args: {...Default.args, disabled: true}};
