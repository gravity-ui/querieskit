import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import {HistoryGroupHeader, RowLink} from '../../components';
import {QueriesHistory} from './QueriesHistory';
import {
    QueryListFieldKey,
    QueryListFilterConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListVisibleFieldsConfig,
} from '../../types/queryList';
import {QueryHistoryRow} from '../../types/history';
import {action} from 'storybook/actions';

const now = Date.now();
const min = 60 * 1000;

const QUERY = `use test;

SELECT
    "test_session" AS session_id,
    "test_task" AS task_id,
    SUBSTRING("test", 1, 1) AS truncated_char`;

const BASE_ITEMS: QueryListItem<QueryHistoryRow>[] = [
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
    {
        id: 6,
        title: 'Query 6',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
    {
        id: 7,
        title: 'Query 7',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
    {
        id: 8,
        title: 'Query 8',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
];

const LINK_ITEMS = BASE_ITEMS.map((item) =>
    'id' in item ? {...item, href: `/queries/${item.id}`} : item,
);

const PAGINATION_PAGES = [LINK_ITEMS.slice(0, 3), LINK_ITEMS.slice(3, 6), LINK_ITEMS.slice(6)];

type VisibleFields = QueryListVisibleFieldsConfig<QueryHistoryRow>['fields'];
const activeFields: QueryListFieldKey<QueryHistoryRow>[] = [
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

const filterFields: QueryListFilterConfig['fields'] = [
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

const renderRouterLink: QueryListLinkRenderer = ({onClick, ...props}) => (
    <a
        {...props}
        data-router-link
        onClick={(event) => {
            onClick?.(event);

            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            event.preventDefault();
            action('routerNavigate')(props.href);
        }}
    />
);

const meta: Meta<typeof QueriesHistory> = {
    title: 'Widgets/QueriesHistory',
    component: QueriesHistory,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

const operationFilterOptions = [
    {
        value: 'My',
        content: 'My',
    },
    {
        value: 'All',
        content: 'All',
    },
];

export default meta;
type Story = StoryObj<typeof QueriesHistory>;

const DefaultStory = () => {
    const [items, setItems] = useState([...LINK_ITEMS]);
    const [search, setSearch] = useState({value: '', fullSearch: false});
    const [visibleFields, setVisibleFields] =
        useState<QueryListFieldKey<QueryHistoryRow>[]>(activeFields);
    const [compareMode, setCompareMode] = useState(false);
    const [comparedRows, setComparedRows] = useState<(number | string)[]>([]);
    const [editingId, setEditingId] = useState<number | string | undefined>(undefined);

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
            setItems(LINK_ITEMS);
            return;
        }

        const newItems = LINK_ITEMS.filter((item) => {
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
                renderLink={renderRouterLink}
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

const WithHeaderStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});
    const [visibleFields, setVisibleFields] =
        useState<QueryListFieldKey<QueryHistoryRow>[]>(activeFields);

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesHistory
                items={BASE_ITEMS}
                logo={<SegmentedRadioGroup options={operationFilterOptions} />}
                visibleFields={{value: visibleFields, fields, onChange: setVisibleFields}}
                filter={{
                    fields: filterFields,
                    onApply: logFilterApply,
                    onReset: logFilterReset('reset'),
                }}
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

const PaginatedStory = () => {
    const [items, setItems] = useState<QueryListItem<QueryHistoryRow>[]>(PAGINATION_PAGES[0]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleLoadMore = () => {
        const nextPage = PAGINATION_PAGES[page];

        if (loading || !nextPage) {
            return;
        }

        action('onLoadMore')(page);
        setLoading(true);

        window.setTimeout(() => {
            setItems((currentItems) => [...currentItems, ...nextPage]);
            setPage((currentPage) => currentPage + 1);
            setLoading(false);
        }, 700);
    };

    return (
        <div style={{width: 300, height: 300}}>
            <QueriesHistory
                title="Paginated history"
                items={items}
                selectedRowId={2}
                loading={loading}
                hasMore={page < PAGINATION_PAGES.length}
                onLoadMore={handleLoadMore}
                search={{onUpdate: action('onSearchUpdate')}}
            />
        </div>
    );
};

const FullSearchUnavailableStory = () => {
    const [search, setSearch] = useState({value: 'Query', fullSearch: true});

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesHistory
                title="Basic search only"
                items={LINK_ITEMS}
                search={{
                    ...search,
                    fullSearchAvailable: false,
                    hasClear: true,
                    onUpdate: (data) => {
                        action('onSearchUpdate')(data);
                        setSearch(data);
                    },
                }}
            />
        </div>
    );
};

const RouterLinksStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 500, height: 500}}>
            <QueriesHistory
                title="Router links"
                items={LINK_ITEMS}
                renderLink={renderRouterLink}
                search={{...search, hasClear: true, onUpdate: setSearch}}
            />
        </div>
    );
};

const CustomRowRendererStory = () => (
    <div style={{width: 300, height: 300}}>
        <QueriesHistory
            title="Custom row renderer"
            items={LINK_ITEMS.slice(0, 3)}
            renderLink={renderRouterLink}
            renderRowItem={({item, renderLink}) =>
                'header' in item ? (
                    <HistoryGroupHeader title={item.header} />
                ) : (
                    <RowLink href={item.href} renderLink={renderLink}>
                        <Text>{item.title}</Text>
                    </RowLink>
                )
            }
            search={{onUpdate: action('onSearchUpdate')}}
        />
    </div>
);

export const Default: Story = {render: () => <DefaultStory />};
export const Empty: Story = {render: () => <EmptyStory />};
export const InitialLoading: Story = {
    args: {
        title: 'Loading history',
        items: [],
        loading: true,
        search: {onUpdate: action('onSearchUpdate')},
    },
    decorators: [
        (StoryComponent) => (
            <div style={{width: 300, height: 500}}>
                <StoryComponent />
            </div>
        ),
    ],
};
export const Paginated: Story = {render: () => <PaginatedStory />};
export const FullSearchUnavailable: Story = {
    render: () => <FullSearchUnavailableStory />,
};
export const RouterLinks: Story = {render: () => <RouterLinksStory />};
export const CustomRowRenderer: Story = {render: () => <CustomRowRendererStory />};
export const WithHeader: Story = {render: () => <WithHeaderStory />};
