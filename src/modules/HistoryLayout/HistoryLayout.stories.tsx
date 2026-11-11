import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryLayout} from './HistoryLayout';
import {HistoryHeader} from '../HistoryHeader';
const meta = {
    title: 'Modules/HistoryLayout',
    component: HistoryLayout,
    decorators: [
        (Story) => (
            <div style={{width: 340, height: 260}}>
                <Story />
            </div>
        ),
    ],
    args: {
        title: 'Query history',
        header: <HistoryHeader search="" onUpdate={() => {}} />,
        children: <div>Query results area</div>,
        footer: <div>2 queries</div>,
    },
} satisfies Meta<typeof HistoryLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Panel: Story = {args: {variant: 'panel', logo: <span>Workspace</span>}};
