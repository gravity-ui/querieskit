import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryList} from './HistoryList';
import {QueryHistoryItem, QueryHistoryRow} from '../../types/history';

const now = Date.now();
const min = 60 * 1000;

const ITEMS: QueryHistoryItem<QueryHistoryRow>[] = [
    {header: 'Today', height: 28},
    {
        id: 1,
        title: 'Query 1',
        status: 'completed',
        engine: 'YQL',
        startTime: now - 2 * min,
        endTime: now - min,
        height: 52,
    },
    {
        id: 2,
        title: 'Query 2',
        status: 'failed',
        engine: 'YQL',
        startTime: now - 10 * min,
        endTime: now - 9 * min,
        height: 52,
    },
    {
        id: 3,
        title: 'Query 3',
        status: 'running',
        engine: 'YQL',
        startTime: now - min,
        height: 52,
    },
    {header: 'Yesterday', height: 28},
    {
        id: 4,
        title: 'Query 4',
        status: 'aborted',
        engine: 'YQL',
        startTime: now - 25 * 60 * min,
        endTime: now - 24 * 60 * min,
        height: 52,
    },
    {
        id: 5,
        title: 'Query 5',
        status: 'draft',
        engine: 'YQL',
        startTime: now - 30 * 60 * min,
        height: 52,
    },
];

const meta: Meta<typeof HistoryList> = {
    title: 'Modules/HistoryList',
    component: HistoryList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{width: 420, height: 480}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof HistoryList>;

/** Basic list with groups and all statuses */
export const Default: Story = {
    args: {
        items: ITEMS,
    },
};

/** Empty list */
export const Empty: Story = {
    args: {
        items: [],
    },
};

/** With row actions (visible on hover) */
export const WithActions: Story = {
    args: {
        items: ITEMS,
        getRowActions: (_item) => [
            {text: 'Run again', onClick: (row) => alert(`Run: ${row.title}`)},
            {text: 'Copy', onClick: (row) => alert(`Copy: ${row.title}`)},
            {text: 'Delete', onClick: (row) => alert(`Delete: ${row.title}`)},
        ],
    },
};

/** Interactive row comparison mode */
const WithSelectionStory = () => {
    const [comparedRowIds, setComparedRowIds] = useState<number[]>([]);

    const handleChange = (item: QueryHistoryRow, selected: boolean) => {
        setComparedRowIds((prev) =>
            selected ? [...prev, item.id] : prev.filter((id) => id !== item.id),
        );
    };

    return (
        <div style={{width: 420, height: 480}}>
            <div style={{marginBottom: 8, fontSize: 12, color: '#888'}}>
                Selected ids: {comparedRowIds.join(', ') || 'none'}
            </div>
            <HistoryList
                items={ITEMS}
                comparison={{
                    enabled: true,
                    comparedRowIds,
                    onChange: handleChange,
                    onCancel: () => setComparedRowIds([]),
                    onCompare: () => {},
                }}
            />
        </div>
    );
};

export const WithSelection: Story = {render: () => <WithSelectionStory />};

/** Row highlighted via selectedRowId */
const WithSelectedRowStory = () => {
    const [selectedRowId, setSelectedRowId] = useState<number | undefined>(1);

    return (
        <div style={{width: 420, height: 480}}>
            <div style={{marginBottom: 8, fontSize: 12, color: '#888'}}>
                Selected row id: {selectedRowId ?? 'none'}
            </div>
            <HistoryList
                items={ITEMS}
                selectedRowId={selectedRowId}
                onItemClick={(item) => {
                    if (!('header' in item)) {
                        setSelectedRowId(item.id);
                    }
                }}
            />
        </div>
    );
};

export const WithSelectedRow: Story = {render: () => <WithSelectedRowStory />};

/** Interactive row title editing mode */
const WithEditingStory = () => {
    const [editingRowId, setEditingRowId] = useState<number | undefined>(1);

    return (
        <div style={{width: 420, height: 480}}>
            <div style={{marginBottom: 8, fontSize: 12, color: '#888'}}>
                Editing row id: {editingRowId ?? 'none'} (row #1 is open for editing)
            </div>
            <HistoryList
                items={ITEMS}
                editing={{
                    rowId: editingRowId,
                    onSubmit: (item, title) => {
                        alert(`Saved row ${item.id}: "${title}"`);
                        setEditingRowId(undefined);
                    },
                    onCancel: () => setEditingRowId(undefined),
                }}
            />
        </div>
    );
};

export const WithEditing: Story = {render: () => <WithEditingStory />};
