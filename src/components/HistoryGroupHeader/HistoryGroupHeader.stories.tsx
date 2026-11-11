import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryGroupHeader} from './HistoryGroupHeader';

const meta: Meta<typeof HistoryGroupHeader> = {
    title: 'Components/HistoryGroupHeader',
    component: HistoryGroupHeader,
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
type Story = StoryObj<typeof HistoryGroupHeader>;

export const Default: Story = {args: {title: 'Today'}};
export const LongTitle: Story = {args: {title: 'Queries from the previous reporting period'}};
