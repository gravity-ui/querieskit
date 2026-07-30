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
        title: 'SELECT * FROM users WHERE active = true',
        status: 'completed',
        engine: 'YQL',
        startTime: now - 2 * min,
        endTime: now - min,
        height: 64,
    },
    {
        id: 2,
        title: 'INSERT INTO logs VALUES (...)',
        status: 'failed',
        engine: 'YQL',
        startTime: now - 10 * min,
        endTime: now - 9 * min,
        height: 64,
    },
    {
        id: 3,
        title: 'Running analytics query',
        status: 'running',
        engine: 'YQL',
        startTime: now - min,
        height: 64,
    },
    {header: 'Yesterday', height: 28},
    {
        id: 4,
        title: 'DROP TABLE temp_data',
        status: 'aborted',
        engine: 'YQL',
        startTime: now - 25 * 60 * min,
        endTime: now - 24 * 60 * min,
        height: 64,
    },
    {
        id: 5,
        title: 'Draft query — not yet executed',
        status: 'draft',
        engine: 'YQL',
        startTime: now - 30 * 60 * min,
        height: 64,
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

/** Базовый список с группами и всеми статусами */
export const Default: Story = {
    args: {
        items: ITEMS,
    },
};

/** Пустой список */
export const Empty: Story = {
    args: {
        items: [],
    },
};

/** С действиями на строке (видны при наведении) */
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

/** Интерактивный режим выбора строк */
const WithSelectionStory = () => {
    const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

    const handleChange = (item: QueryHistoryRow, selected: boolean) => {
        setSelectedRowIds((prev) =>
            selected ? [...prev, item.id] : prev.filter((id) => id !== item.id),
        );
    };

    return (
        <div style={{width: 420, height: 480}}>
            <div style={{marginBottom: 8, fontSize: 12, color: '#888'}}>
                Selected ids: {selectedRowIds.join(', ') || 'none'}
            </div>
            <HistoryList
                items={ITEMS}
                selection={{
                    enabled: true,
                    selectedRowIds,
                    onChange: handleChange,
                }}
            />
        </div>
    );
};

export const WithSelection: Story = {render: () => <WithSelectionStory />};

/** Интерактивный режим редактирования заголовка строки */
const WithEditingStory = () => {
    const [editingRowId, setEditingRowId] = useState<number | undefined>(1);

    return (
        <div style={{width: 420, height: 480}}>
            <div style={{marginBottom: 8, fontSize: 12, color: '#888'}}>
                Editing row id: {editingRowId ?? 'none'} (строка #1 открыта для редактирования)
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
