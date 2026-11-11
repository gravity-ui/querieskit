import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {RowsList} from './RowsList';
import {HistoryRow} from '../HistoryRow';
import type {QueryHistoryRow} from '../../types/history';
import type {RowsListProps} from '../../types/rowsListProps';
const items: QueryHistoryRow[] = [
    {id: 1, title: 'Completed query', status: 'completed', height: 52, engine: 'YQL'},
    {id: 2, title: 'Failed query', status: 'failed', height: 52, engine: 'YQL'},
];
function Example(args: RowsListProps<QueryHistoryRow>) {
    return <RowsList {...args} />;
}
const meta = {
    title: 'Modules/RowsList',
    component: Example,
    decorators: [
        (Story) => (
            <div style={{width: 340, height: 260}}>
                <Story />
            </div>
        ),
    ],
    args: {
        items,
        selectedRowId: 1,
        renderRow: (data) =>
            'header' in data.item ? (
                <span>{data.item.header}</span>
            ) : (
                <HistoryRow {...data} item={data.item} />
            ),
    },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Selected: Story = {};
export const Empty: Story = {args: {items: [], emptyContent: <span>No query rows</span>}};
export const Loading: Story = {args: {items: [], loading: true}};
