import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ListSpinner} from './ListSpinner';

const meta: Meta<typeof ListSpinner> = {
    title: 'Components/ListSpinner',
    component: ListSpinner,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 400, height: 320}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof ListSpinner>;

export const Default: Story = {};
