import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import {demoEdges, demoNodes} from '../../components/QueryGraph/QueryGraph.stories';
import {QueryProgress} from './QueryProgress';

const meta: Meta<typeof QueryProgress> = {
    title: 'Modules/QueryProgress',
    component: QueryProgress,
    tags: ['autodocs'],
    args: {graphProps: {nodes: demoNodes, edges: demoEdges}},
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
export const TimelinePlaceholder: Story = {args: {defaultView: 'timeline'}};
