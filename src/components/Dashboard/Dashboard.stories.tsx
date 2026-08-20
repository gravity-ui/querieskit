import React from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import {Dashboard} from './Dashboard';
import type {DashboardRenderItem} from './types';

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

const baseItems: DashboardRenderItem[] = [
    {id: 'errors', content: <Chart data={errorsChart} />},
    {id: 'latency', content: <Chart data={latencyChart} />},
    {
        id: 'availability',
        content: (
            <Flex direction="column" gap={1}>
                <Text variant="display-3">98.7%</Text>
                <Text color="secondary">Availability during the last 24 hours</Text>
            </Flex>
        ),
    },
];

const operationalItems: DashboardRenderItem[] = [
    ...baseItems,
    {
        id: 'requests',
        content: (
            <Flex direction="column" gap={1}>
                <Text variant="display-3">12.4k</Text>
                <Text color="secondary">Requests per minute</Text>
            </Flex>
        ),
    },
];

const balancedLayout: ConfigLayout[] = [
    {i: 'errors', x: 0, y: 0, w: 2, h: 4},
    {i: 'latency', x: 2, y: 0, w: 2, h: 4},
    {i: 'availability', x: 0, y: 4, w: 2, h: 3},
    {i: 'requests', x: 2, y: 4, w: 2, h: 3},
];

const overviewLayout: ConfigLayout[] = [
    {i: 'errors', x: 0, y: 0, w: 4, h: 5},
    {i: 'latency', x: 0, y: 5, w: 2, h: 4},
    {i: 'availability', x: 2, y: 5, w: 1, h: 4},
    {i: 'requests', x: 3, y: 5, w: 1, h: 4},
];

function StoryFrame({
    title,
    description,
    actions,
    children,
    narrow = false,
}: {
    title: string;
    description: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    narrow?: boolean;
}) {
    return (
        <div className="qp-dashboard-story">
            <Flex direction="column" gap={1} className="qp-dashboard-story__header">
                <Flex alignItems="center" justifyContent="space-between" gap={4}>
                    <Text variant="header-1">{title}</Text>
                    {actions && <Flex gap={2}>{actions}</Flex>}
                </Flex>
                <Text color="secondary">{description}</Text>
            </Flex>
            <div
                className={
                    narrow
                        ? 'qp-dashboard-story__dashboard qp-dashboard-story__dashboard_narrow'
                        : 'qp-dashboard-story__dashboard'
                }
            >
                {children}
            </div>
        </div>
    );
}

function DynamicItemsStory() {
    const [items, setItems] = React.useState(baseItems);

    const handleAddItem = () => {
        setItems((currentItems) => {
            const itemNumber = currentItems.length + 1;

            return [
                ...currentItems,
                {
                    id: `metric-${itemNumber}`,
                    content: (
                        <Flex direction="column" gap={1}>
                            <Text variant="display-3">{itemNumber * 128}</Text>
                            <Text color="secondary">Dynamically added metric #{itemNumber}</Text>
                        </Flex>
                    ),
                },
            ];
        });
    };

    const handleRemoveItem = () => {
        setItems((currentItems) => currentItems.slice(0, -1));
    };

    return (
        <StoryFrame
            title="Dynamic items"
            description="Add and remove items: Dashboard creates layout entries for new stable ids automatically."
            actions={
                <>
                    <Button onClick={handleAddItem}>Add metric</Button>
                    <Button disabled={items.length === 0} onClick={handleRemoveItem}>
                        Remove last
                    </Button>
                </>
            }
        >
            <Dashboard items={items} onLayoutChange={action('onLayoutChange')} />
        </StoryFrame>
    );
}

function ControlledLayoutStory() {
    const [layout, setLayout] = React.useState(balancedLayout);

    return (
        <StoryFrame
            title="Controlled layout"
            description="Switch presets, then drag or resize a card: every change is saved back to the controlled layout."
            actions={
                <>
                    <Button
                        selected={layout === balancedLayout}
                        onClick={() => setLayout(balancedLayout)}
                    >
                        Balanced
                    </Button>
                    <Button
                        selected={layout === overviewLayout}
                        onClick={() => setLayout(overviewLayout)}
                    >
                        Overview
                    </Button>
                </>
            }
        >
            <Dashboard
                items={operationalItems}
                defaultLayout={layout}
                onLayoutChange={(nextLayout) => {
                    setLayout(nextLayout);
                    action('onLayoutChange')(nextLayout);
                }}
            />
        </StoryFrame>
    );
}

function NarrowGridStory() {
    return (
        <StoryFrame
            narrow
            title="Custom grid"
            description="A one-column grid with custom row height and gap fits the same items into a narrow container."
        >
            <Dashboard
                items={baseItems}
                grid={{cols: 1, rowHeight: 56, gap: 12, compactType: 'vertical'}}
                onLayoutChange={action('onLayoutChange')}
            />
        </StoryFrame>
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

/** A draggable and resizable dashboard with charts and arbitrary React content. */
export const Default: Story = {
    render: () => (
        <StoryFrame
            title="Service overview"
            description="Drag cards by the handle or resize them from the corner to rearrange the dashboard."
        >
            <Dashboard items={baseItems} onLayoutChange={action('onLayoutChange')} />
        </StoryFrame>
    ),
};

/** Dashboard manages a default layout and creates positions for items added at runtime. */
export const DynamicItems: Story = {render: () => <DynamicItemsStory />};

/** The layout can be fully controlled, persisted and replaced with a preset. */
export const ControlledLayout: Story = {render: () => <ControlledLayoutStory />};

/** Grid columns, row height, gaps and compaction can be adapted to the host container. */
export const CustomGrid: Story = {render: () => <NarrowGridStory />};
