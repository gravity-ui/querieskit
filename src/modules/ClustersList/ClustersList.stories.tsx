import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ClustersList} from './ClustersList';

const meta: Meta<typeof ClustersList> = {
    title: 'Modules/ClustersList',
    component: ClustersList,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 360, height: 320}}>
                <Story />
            </div>
        ),
    ],
    args: {
        items: [
            {id: 'production', title: 'Production', description: 'Primary analytics cluster'},
            {id: 'development', title: 'Development', description: 'Queries and experiments'},
            {id: 'archive', title: 'Archive'},
        ],
    },
};

export default meta;
type Story = StoryObj<typeof ClustersList>;

export const Default: Story = {};
export const Empty: Story = {args: {items: [], emptyContent: 'No clusters available'}};
export const Error: Story = {args: {items: [], error: 'Unable to load clusters'}};
