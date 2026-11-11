import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {NavigationActionButtons} from './NavigationActionButtons';

const meta: Meta<typeof NavigationActionButtons> = {
    title: 'Components/NavigationActionButtons',
    component: NavigationActionButtons,
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
type Story = StoryObj<typeof NavigationActionButtons>;

export const Default: Story = {
    args: {
        arg: 'events',
        actions: [
            {id: 'open', title: 'Open table', content: 'Open', onClick: () => {}},
            {id: 'copy', title: 'Copy path', content: 'Copy', onClick: () => {}},
        ],
    },
};
export const Disabled: Story = {
    args: {
        arg: 'events',
        actions: [
            {id: 'open', title: 'Open table', content: 'Open', disabled: true, onClick: () => {}},
            {id: 'copy', title: 'Copy path', content: 'Copy', onClick: () => {}},
        ],
    },
};
