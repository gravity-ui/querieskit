import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {SavedQueryRow} from './SavedQueryRow';
const meta = {
    title: 'Modules/SavedQueryRow',
    component: SavedQueryRow,
    decorators: [
        (Story) => (
            <div style={{width: 420}}>
                <Story />
            </div>
        ),
    ],
    args: {
        item: {
            id: 1,
            title: 'Daily report',
            query: 'SELECT count(*) FROM events;',
            height: 110,
            author: 'Anna Petrova',
            engine: 'YQL',
            savedAt: '2026-04-29T12:00:00Z',
        },
        index: 0,
        isActive: false,
    },
} satisfies Meta<typeof SavedQueryRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongTitle: Story = {
    args: {
        item: {
            ...meta.args.item,
            title: 'Daily report with a long title spanning several data sources and teams',
        },
    },
};
