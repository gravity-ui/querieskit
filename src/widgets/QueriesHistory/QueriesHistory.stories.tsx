import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueriesHistory} from './QueriesHistory';
import {QueryHistoryItem, QueryHistoryRow} from '../../types/history';

const now = Date.now();
const min = 60 * 1000;

const BASE_ITEMS: QueryHistoryItem<QueryHistoryRow>[] = [
    {header: 'Today', height: 28},
    {
        id: 1,
        title: 'Query 1',
        status: 'completed',
        engine: 'YQL',
        startTime: now - 2 * min,
        endTime: now - min,
        height: 64,
    },
    {
        id: 2,
        title: 'Query 2',
        status: 'failed',
        engine: 'YQL',
        startTime: now - 10 * min,
        endTime: now - 9 * min,
        height: 64,
    },
    {
        id: 3,
        title: 'Query 3',
        status: 'running',
        engine: 'YQL',
        startTime: now - min,
        height: 64,
    },
    {header: 'Yesterday', height: 28},
    {
        id: 4,
        title: 'Query 4',
        status: 'aborted',
        engine: 'YQL',
        startTime: now - 25 * 60 * min,
        endTime: now - 24 * 60 * min,
        height: 64,
    },
    {
        id: 5,
        title: 'Query 5',
        status: 'draft',
        engine: 'YQL',
        startTime: now - 30 * 60 * min,
        height: 64,
    },
];

const meta: Meta<typeof QueriesHistory> = {
    title: 'Widgets/QueriesHistory',
    component: QueriesHistory,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof QueriesHistory>;

const DefaultStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 420, height: 500}}>
            <QueriesHistory
                title="Query History"
                items={BASE_ITEMS}
                search={{
                    value: search.value,
                    fullSearch: search.fullSearch,
                    hasClear: true,
                    onUpdate: setSearch,
                }}
            />
        </div>
    );
};

const WithActionsStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 420, height: 500}}>
            <QueriesHistory
                title="Query History"
                items={BASE_ITEMS}
                search={{
                    value: search.value,
                    fullSearch: search.fullSearch,
                    hasClear: true,
                    onUpdate: setSearch,
                }}
                getRowActions={(_item) => [
                    {
                        text: 'Run again',
                        onClick: (row) => alert(`Run: ${row.title}`),
                    },
                    {
                        text: 'Copy query',
                        onClick: (row) => alert(`Copy: ${row.title}`),
                    },
                    {
                        text: 'Delete',
                        onClick: (row) => alert(`Delete: ${row.title}`),
                    },
                ]}
            />
        </div>
    );
};

const WithSelectionStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});
    const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

    const handleSelectionChange = (item: QueryHistoryRow, selected: boolean) => {
        setSelectedRowIds((prev) =>
            selected ? [...prev, item.id] : prev.filter((id) => id !== item.id),
        );
    };

    return (
        <div style={{width: 420, height: 500}}>
            <div style={{marginBottom: 8, fontSize: 12, color: '#888'}}>
                Selected: {selectedRowIds.join(', ') || 'none'}
            </div>
            <QueriesHistory
                title="Query History"
                items={BASE_ITEMS}
                search={{
                    value: search.value,
                    fullSearch: search.fullSearch,
                    hasClear: true,
                    onUpdate: setSearch,
                }}
                selection={{
                    enabled: true,
                    selectedRowIds,
                    onChange: handleSelectionChange,
                }}
            />
        </div>
    );
};

const WithEditingStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});
    const [editingRowId, setEditingRowId] = useState<number | undefined>(1);

    return (
        <div style={{width: 420, height: 500}}>
            <div style={{marginBottom: 8, fontSize: 12, color: '#888'}}>
                Editing row id: {editingRowId ?? 'none'} (row #1 is in edit mode by default)
            </div>
            <QueriesHistory
                title="Query History"
                items={BASE_ITEMS}
                search={{
                    value: search.value,
                    fullSearch: search.fullSearch,
                    hasClear: true,
                    onUpdate: setSearch,
                }}
                editing={{
                    rowId: editingRowId,
                    onSubmit: (item, title) => {
                        alert(`Renamed row ${item.id} to: "${title}"`);
                        setEditingRowId(undefined);
                    },
                    onCancel: () => setEditingRowId(undefined),
                }}
            />
        </div>
    );
};

const EmptyStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 420, height: 500}}>
            <QueriesHistory
                title="Query History"
                items={[]}
                search={{
                    value: search.value,
                    fullSearch: search.fullSearch,
                    hasClear: true,
                    onUpdate: setSearch,
                }}
            />
        </div>
    );
};

export const Default: Story = {render: () => <DefaultStory />};
export const WithActions: Story = {render: () => <WithActionsStory />};
export const WithSelection: Story = {render: () => <WithSelectionStory />};
export const WithEditing: Story = {render: () => <WithEditingStory />};
export const Empty: Story = {render: () => <EmptyStory />};
