import React from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react';

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

function DashboardStory() {
    const [items, setItems] = React.useState([
        {id: 'errors', content: <Chart data={errorsChart} />},
        {id: 'latency', content: <Chart data={latencyChart} />},
        {
            id: 'summary',
            content: (
                <Flex direction="column" gap={1}>
                    <Text variant="display-3">98.7%</Text>
                    <Text color="secondary">Last 24 hours</Text>
                </Flex>
            ),
        },
    ]);

    const handleAddItem = () => {
        setItems((prevItems) => {
            return [
                ...prevItems,
                {id: `latency-${prevItems.length}`, content: <Chart data={latencyChart} />},
            ];
        });
    };

    return (
        <div className="qp-dashboard-story">
            <Button onClick={handleAddItem}>Add chart</Button>

            <Dashboard
                items={items}
                onLayoutChange={(payload) => {
                    console.log('payload :>> ', payload);
                }}
            />
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
