import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueriesHistory} from './QueriesHistory';
import {
    QueryHistoryFieldKey,
    QueryHistoryFilterConfig,
    QueryHistoryItem,
    QueryHistoryRow,
    QueryHistoryVisibleFieldsConfig,
} from '../../types/history';
import {action} from 'storybook/actions';

const now = Date.now();
const min = 60 * 1000;

const QUERY = `use test;

SELECT
    "test_session" AS session_id,
    "test_task" AS task_id,
    SUBSTRING("test", 1, 1) AS truncated_char`;

const BASE_ITEMS: QueryHistoryItem<QueryHistoryRow>[] = [
    {header: 'Today', height: 28},
    {
        id: 1,
        title: 'Query 1',
        status: 'completed',
        engine: 'YQL',
        mode: 'Validation',
        startTime: now - 2 * min,
        endTime: now - min,
        query: QUERY,
        height: 52,
    },
    {
        id: 2,
        title: 'Query 2',
        status: 'failed',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 10 * min,
        endTime: now - 9 * min,
        query: QUERY,
        height: 52,
    },
    {
        id: 3,
        title: 'Query 3',
        status: 'running',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - min,
        query: QUERY,
        height: 52,
    },
    {header: 'Yesterday', height: 28},
    {
        id: 4,
        title: 'Query 4',
        status: 'aborted',
        engine: 'YQL',
        mode: 'Validation',
        startTime: now - 25 * 60 * min,
        endTime: now - 24 * 60 * min,
        query: 'SELECT 1',
        height: 52,
    },
    {
        id: 5,
        title: 'Query 5',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
];

type VisibleFields = QueryHistoryVisibleFieldsConfig<QueryHistoryRow>['fields'];
const activeFields: QueryHistoryFieldKey<QueryHistoryRow>[] = [
    'duration',
    'mode',
    'startTime',
    'engine',
    'isPrivate',
];
const fields: VisibleFields = [
    {
        id: 'duration',
        title: 'Duration',
    },
    {
        id: 'mode',
        title: 'Mode',
    },
    {
        id: 'startTime',
        title: 'Start time',
    },
    {
        id: 'engine',
        title: 'Engine',
    },
    {
        id: 'isPrivate',
        title: 'ACO',
    },
];

const filterFields: QueryHistoryFilterConfig['fields'] = [
    {id: 'onlyMine', type: 'switch', title: 'My queries only', initialValue: true},
    {id: 'range', type: 'rangeDatePicker', title: 'Period'},
    {
        id: 'dialect',
        type: 'checkboxGroup',
        title: 'Dialect',
        initialValue: [],
        items: [
            {id: 'yql', title: 'YQL'},
            {id: 'sql', title: 'SQL'},
        ],
    },
];

const logFilterApply = action('onFilterApply');
const logFilterReset = action('onFilterReset');

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
    const [items, setItems] = useState([...BASE_ITEMS]);
    const [search, setSearch] = useState({value: '', fullSearch: false});
    const [visibleFields, setVisibleFields] =
        useState<QueryHistoryFieldKey<QueryHistoryRow>[]>(activeFields);
    const [compareMode, setCompareMode] = useState(false);
    const [comparedRows, setComparedRows] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | undefined>(undefined);

    const handleCompareChange = (item: QueryHistoryRow, selected: boolean) => {
        const result = selected
            ? [...comparedRows.slice(0, 1), item.id]
            : comparedRows.filter((id) => id !== item.id);
        setComparedRows(result);

        if (!result.length) setCompareMode(false);
    };

    const handleCompareCancel = () => {
        setComparedRows([]);
        setCompareMode(false);
    };

    const handleEditSubmit = (item: QueryHistoryRow, title: string) => {
        const index = items.findIndex((i) => 'id' in i && i.id === item.id);
        if (index < 0) return;

        const result = [...items];
        result[index] = {...result[index], title};
        setItems(result);
        setEditingId(undefined);
    };

    const handleEditCancel = () => {
        setEditingId(undefined);
    };

    const handleCompare = () => {
        action('onCompare')(comparedRows);
    };

    const handleOnSearch = (data: {value: string; fullSearch: boolean}) => {
        setSearch(data);

        if (!data.value) {
            setItems(BASE_ITEMS);
            return;
        }

        const newItems = BASE_ITEMS.filter((item) => {
            if (!('id' in item)) return false;

            const title = item.title.toLowerCase();
            const query = item.query?.toLowerCase();
            const searchValue = data.value.toLowerCase();

            if (data.fullSearch) {
                return title.includes(searchValue) || query?.includes(searchValue);
            }

            return title.includes(searchValue);
        });
        setItems(newItems);
    };

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesHistory
                title="History"
                items={items}
                visibleFields={{value: visibleFields, fields, onChange: setVisibleFields}}
                search={{
                    value: search.value,
                    fullSearch: search.fullSearch,
                    hasClear: true,
                    onUpdate: handleOnSearch,
                }}
                filter={{
                    fields: filterFields,
                    onApply: logFilterApply,
                    onReset: logFilterReset('reset'),
                }}
                getRowActions={() => [
                    {
                        text: 'Compare',
                        onClick: (item) => {
                            setCompareMode(true);
                            setComparedRows([item.id]);
                        },
                    },
                    {
                        text: 'Edit',
                        onClick: (item) => {
                            setEditingId(item.id);
                        },
                    },
                ]}
                comparison={{
                    enabled: compareMode,
                    comparedRowIds: comparedRows,
                    onChange: handleCompareChange,
                    onCancel: handleCompareCancel,
                    onCompare: handleCompare,
                }}
                editing={{
                    rowId: editingId,
                    onSubmit: handleEditSubmit,
                    onCancel: handleEditCancel,
                }}
            />
        </div>
    );
};

const EmptyStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesHistory
                title="History"
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
export const Empty: Story = {render: () => <EmptyStory />};
