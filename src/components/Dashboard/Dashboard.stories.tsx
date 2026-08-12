import React, {useState} from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Flex, Text} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react';

import type {DashboardItem} from './types';
import {Dashboard} from './Dashboard';

import './Dashboard.stories.scss';

const errorsChart: ChartData = {
    legend: {enabled: false},
    xAxis: {type: 'linear'},
    yAxis: [{type: 'linear', min: 0}],
    series: {
        data: [
            {
                type: 'line',
                name: 'Errors',
                data: [82, 76, 79, 68, 84, 61, 74, 44, 71, 59, 66, 63, 77, 72, 80, 75].map(
                    (y, x) => ({x, y}),
                ),
            },
        ],
    },
};

const latencyChart: ChartData = {
    legend: {enabled: false},
    xAxis: {type: 'linear'},
    yAxis: [{type: 'linear', min: 0}],
    series: {
        data: [
            {
                type: 'area',
                name: 'Latency',
                data: [42, 58, 47, 69, 52, 74, 63, 78, 68, 81, 73, 86, 79, 88, 83, 91].map(
                    (y, x) => ({x, y}),
                ),
            },
        ],
    },
};

function createItems(): DashboardItem[] {
    return [
        {
            id: 'errors',
            x: 0,
            y: 0,
            width: 4,
            height: 4,
            contentPadding: false,
            content: <Chart data={errorsChart} />,
        },
        {
            id: 'latency',
            x: 0,
            y: 4,
            width: 2,
            height: 4,
            contentPadding: false,
            content: <Chart data={latencyChart} />,
        },
        {
            id: 'summary',
            x: 2,
            y: 4,
            width: 2,
            height: 2,
            content: (
                <Flex direction="column" gap={1}>
                    <Text variant="display-3">98.7%</Text>
                    <Text color="secondary">Last 24 hours</Text>
                </Flex>
            ),
        },
    ];
}

function DashboardStory() {
    const [items, setItems] = useState(createItems);

    console.log('items :>> ', items);

    return (
        <div className="qp-dashboard-story">
            <Dashboard ariaLabel="Query charts" items={items} onItemsChange={setItems} />
        </div>
    );
}

const meta: Meta<typeof Dashboard> = {
    title: 'Components/Dashboard',
    component: Dashboard,
    tags: ['autodocs'],
    parameters: {layout: 'fullscreen'},
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

export const Default: Story = {render: () => <DashboardStory />};
