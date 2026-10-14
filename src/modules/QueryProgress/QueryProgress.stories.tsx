import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import {demoEdges, demoNodes} from '../../components/QueryGraph/QueryGraph.stories';
import {timelineItems, timelineStatuses} from '../QueryTimeline/QueryTimeline.stories';
import {QueryProgress} from './QueryProgress';

const meta: Meta<typeof QueryProgress> = {
    title: 'Modules/QueryProgress',
    component: QueryProgress,
    tags: ['autodocs'],
    args: {
        graphProps: {nodes: demoNodes, edges: demoEdges},
        timelineProps: {
            items: timelineItems,
            statuses: timelineStatuses,
            now: Date.UTC(2026, 8, 25, 10, 1, 20),
        },
    },
    decorators: [
        (Story) => (
            <div style={{height: 640}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof QueryProgress>;

export const Default: Story = {};
export const Timeline: Story = {args: {defaultView: 'timeline'}};

export const WithoutTimelineData: Story = {
    args: {defaultView: 'timeline', timelineProps: undefined},
};
