import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryPrivateIcon} from './HistoryPrivateIcon';

const meta: Meta<typeof HistoryPrivateIcon> = {
    title: 'Components/HistoryPrivateIcon',
    component: HistoryPrivateIcon,
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
type Story = StoryObj<typeof HistoryPrivateIcon>;

export const Public: Story = {args: {isPrivate: false}};
export const Private: Story = {args: {isPrivate: true}};
