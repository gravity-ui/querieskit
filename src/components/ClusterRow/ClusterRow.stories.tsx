import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ClusterRow} from './ClusterRow';

const meta: Meta<typeof ClusterRow> = {
    title: 'Components/ClusterRow',
    component: ClusterRow,
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
type Story = StoryObj<typeof ClusterRow>;

export const Default: Story = {
    args: {cluster: {id: 'production', title: 'Production', description: 'Primary cluster'}},
};
export const LongTitle: Story = {
    args: {
        cluster: {
            id: 'archive',
            title: 'Archive cluster with a deliberately long descriptive title',
            description: 'Read-only historical data',
        },
    },
};
