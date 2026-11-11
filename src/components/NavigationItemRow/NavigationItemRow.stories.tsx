import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {NavigationItemRow} from './NavigationItemRow';

const meta: Meta<typeof NavigationItemRow> = {
    title: 'Components/NavigationItemRow',
    component: NavigationItemRow,
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
type Story = StoryObj<typeof NavigationItemRow>;

export const Default: Story = {
    args: {
        item: {path: '/home/events', title: 'Events', kind: 'table'},
        description: 'Daily event records',
    },
};
export const Disabled: Story = {
    args: {
        item: {path: '/home/archive', title: 'Archived events', kind: 'table', disabled: true},
        actions: [{id: 'open', title: 'Open table', content: 'Open', onClick: () => {}}],
    },
};
export const BrokenLink: Story = {
    args: {
        item: {
            path: '/home/missing',
            title: 'Missing destination',
            kind: 'link',
            targetPathBroken: true,
        },
        description: 'The destination is unavailable',
    },
};
