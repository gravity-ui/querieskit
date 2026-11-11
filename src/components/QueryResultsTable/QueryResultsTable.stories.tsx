import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueryResultsTable} from './QueryResultsTable';

const meta: Meta<typeof QueryResultsTable> = {
    title: 'Components/QueryResultsTable',
    component: QueryResultsTable,
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
type Story = StoryObj<typeof QueryResultsTable>;

export const Default: Story = {
    args: {
        columns: [
            {name: 'name', type: ['DataType', 'Utf8']},
            {name: 'count', type: ['DataType', 'Int64']},
        ],
        rows: [
            {name: 'Alpha', count: 12},
            {name: 'Beta', count: 7},
        ],
        loaded: true,
    },
};
export const Empty: Story = {args: {...Default.args, rows: []}};
export const Error: Story = {args: {...Default.args, errorContent: 'Result is unavailable'}};
