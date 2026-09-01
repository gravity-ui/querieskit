import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import type {QueryStatisticsItem} from '../../../types/queryStatistics';
import {QueryStatistics} from '../QueryStatistics';

const data: QueryStatisticsItem[] = [
    {
        id: 'input',
        name: 'Input',
        children: [
            {
                id: 'input.rows',
                name: 'Rows',
                description: 'Number of rows read from the input',
                values: {min: 0, max: 1600, sum: 4200, count: 4, last: 1400},
            },
            {
                id: 'input.weight',
                name: 'Data weight',
                unit: 'bytes',
                values: {min: 1024, max: 1048576, avg: 120000.25, sum: 2097152, count: 4},
            },
        ],
    },
];

const largeData: QueryStatisticsItem[] = Array.from({length: 12}, (_group, groupIndex) => ({
    id: `group-${groupIndex}`,
    name: `Group ${groupIndex + 1} with a deliberately long name for horizontal scrolling`,
    children: Array.from({length: 25}, (_metric, metricIndex) => ({
        id: `group-${groupIndex}.metric-${metricIndex}`,
        name: `Metric ${metricIndex + 1}`,
        values: {
            min: metricIndex,
            max: metricIndex * 10,
            sum: metricIndex * 100,
            count: metricIndex + 1,
            last: metricIndex * 5,
        },
    })),
}));

const meta: Meta<typeof QueryStatistics> = {
    title: 'Modules/QueryStatistics',
    component: QueryStatistics,
    tags: ['autodocs'],
    args: {data},
};

export default meta;
type Story = StoryObj<typeof QueryStatistics>;

export const Default: Story = {};

export const ConfiguredColumns: Story = {
    args: {
        visibleColumns: ['last', 'avg', 'count'],
        columnConfig: {last: {title: 'Latest value', width: '20%'}},
        extraColumns: [{id: 'unit', title: 'Unit', render: ({item}) => item.unit ?? '—'}],
    },
};

export const VirtualAndFixed: Story = {
    args: {data: largeData, virtual: true, fixedHeader: true},
    render: (args) => (
        <div style={{height: 360, maxWidth: 1100, overflow: 'auto'}}>
            <QueryStatistics {...args} />
        </div>
    ),
};
