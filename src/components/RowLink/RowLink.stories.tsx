import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {RowLink} from './RowLink';

const meta: Meta<typeof RowLink> = {
    title: 'Components/RowLink',
    component: RowLink,
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
type Story = StoryObj<typeof RowLink>;

export const Default: Story = {args: {href: '#query', children: 'Open saved query'}};
export const Disabled: Story = {
    args: {href: '#query', disabled: true, children: 'Unavailable saved query'},
};
