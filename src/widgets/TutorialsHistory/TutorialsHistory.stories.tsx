import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TutorialsHistory} from './TutorialsHistory';
import {QueryHistoryFilterConfig, QueryHistoryItem} from '../../types/history';
import {TutorialHistoryRow} from '../../types/tutorial';
import {action} from 'storybook/actions';

const QUERY = `use test;

SELECT
    "test_session" AS session_id,
    "test_task" AS task_id,
    SUBSTRING("test", 1, 1) AS truncated_char`;

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

const BASE_ITEMS: QueryHistoryItem<TutorialHistoryRow>[] = [
    {
        id: 1,
        title: 'Getting started with YQL',
        query: QUERY,
        height: 28,
    },
    {
        id: 2,
        title: 'Working with tables',
        query: QUERY,
        height: 28,
    },
    {
        id: 3,
        title: 'Window functions',
        query: QUERY,
        height: 28,
    },
];

const meta: Meta<typeof TutorialsHistory> = {
    title: 'Widgets/TutorialsHistory',
    component: TutorialsHistory,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof TutorialsHistory>;

const DefaultStory = () => {
    const [items, setItems] = useState([...BASE_ITEMS]);
    const [search, setSearch] = useState({value: '', fullSearch: false});

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
            <TutorialsHistory
                title="Tutorials"
                items={items}
                filter={{
                    fields: filterFields,
                    onApply: logFilterApply,
                    onReset: logFilterReset('reset'),
                }}
                search={{
                    value: search.value,
                    fullSearch: search.fullSearch,
                    hasClear: true,
                    onUpdate: handleOnSearch,
                }}
            />
        </div>
    );
};

const EmptyStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 300, height: 500}}>
            <TutorialsHistory
                title="Tutorials"
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
