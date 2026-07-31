import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryRow} from './HistoryRow';
import {QueryHistoryRow, QueryHistoryRowAction} from '../../types/history';

const now = Date.now();
const min = 60 * 1000;

const makeRow = (overrides: Partial<QueryHistoryRow>): QueryHistoryRow => ({
    id: 1,
    title: 'Query 1',
    status: 'completed',
    engine: 'YQL',
    mode: 'batch',
    isPrivate: false,
    startTime: now - 5 * min,
    endTime: now - min,
    height: 64,
    ...overrides,
});

const defaultActions: Array<QueryHistoryRowAction<QueryHistoryRow>> = [
    {text: 'Run again', onClick: (row) => alert(`Run: ${row.title}`)},
    {text: 'Copy', onClick: (row) => alert(`Copy: ${row.title}`)},
    {text: 'Delete', onClick: (row) => alert(`Delete: ${row.title}`)},
];

const meta: Meta<typeof HistoryRow> = {
    title: 'Modules/HistoryRow',
    component: HistoryRow,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    args: {
        item: makeRow({}),
        isActive: false,
        index: 0,
        actions: defaultActions,
    },
    decorators: [
        (Story) => (
            <div style={{width: 380}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof HistoryRow>;

/** Default row with a ready-to-use actions menu */
export const Default: Story = {};

/** Private query — shows the lock icon */
export const Private: Story = {
    args: {
        item: makeRow({isPrivate: true}),
    },
};

/** Selection mode — a checkbox is shown instead of the status icon */
export const SelectionMode: Story = {
    args: {
        selection: {
            enabled: true,
            checked: false,
            onChange: (_item, selected) => alert(`Selected: ${selected}`),
        },
    },
};

/** Row is selected in selection mode */
export const SelectionModeChecked: Story = {
    args: {
        selection: {
            enabled: true,
            checked: true,
            onChange: (_item, selected) => alert(`Selected: ${selected}`),
        },
    },
};

/** Title editing mode */
export const EditingMode: Story = {
    args: {
        editing: {
            enabled: true,
            onSubmit: (_item, title) => alert(`Saved: ${title}`),
            onCancel: () => alert('Cancelled'),
        },
    },
};
