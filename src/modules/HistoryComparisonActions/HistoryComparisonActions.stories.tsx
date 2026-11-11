import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryComparisonActions} from './HistoryComparisonActions';
const meta = {
    title: 'Modules/HistoryComparisonActions',
    component: HistoryComparisonActions,
    decorators: [
        (Story) => (
            <div style={{width: 300}}>
                <Story />
            </div>
        ),
    ],
    args: {
        comparison: {
            enabled: true,
            comparedRowIds: [1],
            onChange: () => {},
            onCancel: () => {},
            onCompare: () => {},
        },
    },
} satisfies Meta<typeof HistoryComparisonActions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const OneSelected: Story = {};
export const TwoSelected: Story = {
    args: {comparison: {...meta.args.comparison, comparedRowIds: [1, 2]}},
};
