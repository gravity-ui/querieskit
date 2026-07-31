import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistorySearchRow} from './HistorySearchRow';
import {QueryHistoryRow} from '../../types/history';

const now = Date.now();
const min = 60 * 1000;

const makeRow = (overrides: Partial<QueryHistoryRow>): QueryHistoryRow => ({
    id: 1,
    title: 'Query 1',
    query: 'SELECT *\nFROM `//home/some/table`\nWHERE status = "completed"\nLIMIT 100',
    status: 'completed',
    engine: 'YQL',
    startTime: now - 5 * min,
    endTime: now - min,
    height: 64,
    ...overrides,
});

const meta: Meta<typeof HistorySearchRow> = {
    title: 'Modules/HistorySearchRow',
    component: HistorySearchRow,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{width: 480}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof HistorySearchRow>;

/** Completed query, basic view */
export const Completed: Story = {
    args: {
        item: makeRow({status: 'completed'}),
    },
};

/** Row with mode and a private (locked) query */
export const WithModeAndPrivate: Story = {
    args: {
        item: makeRow({status: 'completed', mode: 'batch', isPrivate: true}),
    },
};
