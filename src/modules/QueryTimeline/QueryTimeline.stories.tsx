import React, {useMemo, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, ThemeProvider} from '@gravity-ui/uikit';
import type {
    QueryTimelineItem,
    QueryTimelineRange,
    QueryTimelineStatus,
} from '../../types/queryTimeline';
import {QueryTimeline} from './QueryTimeline';

const start = Date.UTC(2026, 8, 25, 10);
export const timelineStatuses: QueryTimelineStatus[] = [
    {id: 'queued', label: 'Queued', color: 'var(--g-color-base-neutral-heavy)'},
    {id: 'executing', label: 'Executing', color: 'var(--g-color-base-info-heavy)'},
    {id: 'done', label: 'Done', color: 'var(--g-color-base-positive-heavy)'},
    {id: 'error', label: 'Error', color: 'var(--g-color-base-danger-heavy)'},
];
export const timelineItems: QueryTimelineItem[] = [
    {id: 'prepare', label: 'Prepare', status: 'done', interval: {start, end: start + 8000}},
    {
        id: 'fetch',
        label: 'Fetch source',
        status: 'done',
        href: 'https://gravity-ui.com',
        interval: {start: start + 8000, end: start + 50000},
        stages: [
            {id: 'connect', label: 'Connect', interval: {start: start + 8000, end: start + 15000}},
            {id: 'read', label: 'Read', interval: {start: start + 18000, end: start + 45000}},
            {id: 'decode', label: 'Decode', interval: {start: start + 40000, end: start + 50000}},
        ],
    },
    {
        id: 'aggregate',
        label: 'Aggregate',
        status: 'executing',
        progress: {completed: 72, total: 100},
        interval: {start: start + 50000},
        stages: [{id: 'reduce', label: 'Reduce', interval: {start: start + 52000}}],
    },
    {id: 'publish', label: 'Publish', status: 'queued'},
];

const meta: Meta<typeof QueryTimeline> = {
    title: 'Modules/QueryTimeline',
    component: QueryTimeline,
    tags: ['autodocs'],
    args: {items: timelineItems, statuses: timelineStatuses, now: start + 80000, timeZone: 'UTC'},
    decorators: [
        (Story) => (
            <div style={{height: 580, minWidth: 720, resize: 'both', overflow: 'auto'}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof QueryTimeline>;

export const Default: Story = {};
export const CustomContent: Story = {
    args: {
        renderItemLabel: ({item, stage, defaultContent}) => (
            <span title={stage?.id ?? item.id}>
                {defaultContent} {!stage && '↗'}
            </span>
        ),
        renderEventPopup: ({item, defaultContent}) => (
            <Flex direction="column">
                {defaultContent}
                <span>ID: {item.id}</span>
            </Flex>
        ),
    },
};
export const Live: Story = {
    args: {now: undefined},
    render: function Render(args) {
        const items = useMemo(
            () => [
                {
                    id: 'live',
                    label: 'Live task',
                    status: 'executing',
                    interval: {start: Date.now() - 10000},
                },
            ],
            [],
        );
        return <QueryTimeline {...args} items={items} />;
    },
};
export const ControlledRange: Story = {
    render: function Render(args) {
        const [range, setRange] = useState<QueryTimelineRange>({from: start, to: start + 100000});
        return (
            <Flex direction="column" gap={2} style={{height: '100%'}}>
                <Button onClick={() => setRange({from: start + 10000, to: start + 20000})}>
                    Focus externally
                </Button>
                <QueryTimeline {...args} range={range} onRangeChange={setRange} />
            </Flex>
        );
    },
};
export const Loading: Story = {args: {loading: true}};
export const Error: Story = {args: {errorContent: 'Could not load execution data'}};
export const Empty: Story = {args: {items: []}};
export const NoIntervals: Story = {
    args: {items: [{id: 'pending', label: 'Waiting for execution', status: 'queued'}]},
};
export const InvalidData: Story = {
    args: {items: [{id: 'bad', label: 'Invalid interval', interval: {start: 100, end: 0}}]},
};
export const Dark: Story = {
    decorators: [
        (Story) => (
            <ThemeProvider theme="dark">
                <div style={{height: '100%'}}>
                    <Story />
                </div>
            </ThemeProvider>
        ),
    ],
};
export const FiveThousandRows: Story = {
    args: {
        items: Array.from({length: 1000}, (_, index) => ({
            id: `task-${index}`,
            label: `Task ${index}`,
            status: 'done',
            interval: {start: start + index * 100, end: start + index * 100 + 20000},
            stages: Array.from({length: 4}, (_stage, stage) => ({
                id: `stage-${stage}`,
                label: `Stage ${stage}`,
                interval: {
                    start: start + index * 100 + stage * 5000,
                    end: start + index * 100 + (stage + 1) * 5000,
                },
            })),
        })),
    },
};
