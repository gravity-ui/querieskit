import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import type {ChartData} from '@gravity-ui/charts';
import {Copy, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';

import {Chart} from './Chart';

const data: ChartData = {
    title: {text: 'Query duration'},
    xAxis: {type: 'category', categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']},
    series: {
        data: [
            {
                type: 'line',
                name: 'Duration',
                data: [
                    {x: 0, y: 12},
                    {x: 1, y: 18},
                    {x: 2, y: 10},
                    {x: 3, y: 24},
                    {x: 4, y: 16},
                ],
            },
        ],
    },
};

const meta: Meta<typeof Chart> = {
    title: 'Components/Chart',
    component: Chart,
    tags: ['autodocs'],
    parameters: {layout: 'padded'},
    args: {
        data,
        controlsVisibility: 'always',
        onPencilEdit: action('onPencilEdit'),
        actions: [
            {
                text: 'Duplicate',
                icon: <Icon data={Copy} size={16} />,
                onClick: action('duplicate'),
            },
            {
                text: 'Delete',
                icon: <Icon data={TrashBin} size={16} />,
                onClick: action('delete'),
            },
        ],
    },
    render: (args) => (
        <div style={{height: 400}}>
            <Chart {...args} />
        </div>
    ),
};

export default meta;
type Story = StoryObj<typeof Chart>;

export const Default: Story = {};

export const ControlsOnHover: Story = {
    args: {
        controlsVisibility: 'hover',
    },
};

export const WithoutOptionalActions: Story = {
    args: {
        actions: undefined,
        onPencilEdit: undefined,
    },
};
