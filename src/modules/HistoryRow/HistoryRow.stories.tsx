import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryRow} from './HistoryRow';
import {QueryHistoryRow} from '../../types/history';

const now = Date.now();
const min = 60 * 1000;

const makeRow = (overrides: Partial<QueryHistoryRow>): QueryHistoryRow => ({
    id: 1,
    title: 'SELECT * FROM users WHERE active = true',
    status: 'completed',
    engine: 'YQL',
    startTime: now - 5 * min,
    endTime: now - min,
    height: 64,
    ...overrides,
});

const meta: Meta<typeof HistoryRow> = {
    title: 'Modules/HistoryRow',
    component: HistoryRow,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
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

/** Завершённый запрос, базовый вид */
export const Completed: Story = {
    args: {
        item: makeRow({status: 'completed'}),
        isActive: false,
        index: 0,
    },
};

/** Запрос завершился с ошибкой */
export const Failed: Story = {
    args: {
        item: makeRow({status: 'failed', title: 'INSERT INTO logs VALUES (...)'}),
        isActive: false,
        index: 0,
    },
};

/** Прерванный запрос */
export const Aborted: Story = {
    args: {
        item: makeRow({status: 'aborted', title: 'DROP TABLE temp_data'}),
        isActive: false,
        index: 0,
    },
};

/** Черновик — время показывает --:-- */
export const Draft: Story = {
    args: {
        item: makeRow({status: 'draft', title: 'Draft query', startTime: now, endTime: undefined}),
        isActive: false,
        index: 0,
    },
};

/** Активный (hovered) запрос — показывает меню действий */
export const ActiveWithActions: Story = {
    args: {
        item: makeRow({status: 'completed'}),
        isActive: true,
        index: 0,
        actions: [
            {text: 'Run again', onClick: (row) => alert(`Run: ${row.title}`)},
            {text: 'Copy', onClick: (row) => alert(`Copy: ${row.title}`)},
            {text: 'Delete', onClick: (row) => alert(`Delete: ${row.title}`)},
        ],
    },
};

/** Режим selection — вместо иконки статуса показывается чекбокс */
export const SelectionMode: Story = {
    args: {
        item: makeRow({status: 'completed'}),
        isActive: false,
        index: 0,
        selection: {
            enabled: true,
            checked: false,
            onChange: (_item, selected) => alert(`Selected: ${selected}`),
        },
    },
};

/** Строка выбрана в режиме selection */
export const SelectionModeChecked: Story = {
    args: {
        item: makeRow({status: 'completed'}),
        isActive: false,
        index: 0,
        selection: {
            enabled: true,
            checked: true,
            onChange: (_item, selected) => alert(`Selected: ${selected}`),
        },
    },
};

/** Режим редактирования заголовка */
export const EditingMode: Story = {
    args: {
        item: makeRow({status: 'completed'}),
        isActive: false,
        index: 0,
        editing: {
            enabled: true,
            onSubmit: (_item, title) => alert(`Saved: ${title}`),
            onCancel: () => alert('Cancelled'),
        },
    },
};

/** Интерактивный пример с живым переключением selection */
const InteractiveSelectionStory = () => {
    const [checked, setChecked] = useState(false);
    const item = makeRow({status: 'completed'});

    return (
        <div style={{width: 380}}>
            <HistoryRow
                item={item}
                isActive={false}
                index={0}
                selection={{
                    enabled: true,
                    checked,
                    onChange: (_row, selected) => setChecked(selected),
                }}
            />
        </div>
    );
};

export const InteractiveSelection: Story = {render: () => <InteractiveSelectionStory />};
