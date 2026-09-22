import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import BookOpenIcon from '@gravity-ui/icons/svgs/book-open.svg';
import {HistoryGroupHeader, RowLink} from '../../components';
import {TutorialsHistory} from './TutorialsHistory';
import type {
    QueryListFilterConfig,
    QueryListItem,
    QueryListLinkRenderer,
} from '../../types/queryList';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {action} from 'storybook/actions';

const QUERY = `use test;

SELECT
    "test_session" AS session_id,
    "test_task" AS task_id,
    SUBSTRING("test", 1, 1) AS truncated_char`;

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

const BASE_ITEMS: QueryListItem<TutorialHistoryRow>[] = [
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

const LINK_ITEMS = BASE_ITEMS.map((item) =>
    'id' in item ? {...item, href: `/tutorials/${item.id}`} : item,
);

const PAGINATION_PAGES: QueryListItem<TutorialHistoryRow>[][] = [
    Array.from({length: 8}, (_, index) => ({
        id: `basics-${index + 1}`,
        title: `YQL basics: lesson ${index + 1}`,
        query: QUERY,
        href: `/tutorials/basics-${index + 1}`,
        height: 28,
    })),
    Array.from({length: 8}, (_, index) => ({
        id: `advanced-${index + 1}`,
        title: `Advanced YQL: lesson ${index + 1}`,
        query: QUERY,
        href: `/tutorials/advanced-${index + 1}`,
        height: 28,
    })),
];

const CUSTOM_ROW_ITEMS: QueryListItem<TutorialHistoryRow>[] = [
    {header: 'Getting started', height: 28},
    {
        id: '01HZXB4K8P7Y2Q9T6M3N5R1C0A',
        title: 'Getting started with YQL',
        href: '/tutorials/getting-started',
        height: 32,
    },
];

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

const PaginatedStory = () => {
    const [items, setItems] = useState<QueryListItem<TutorialHistoryRow>[]>(PAGINATION_PAGES[0]);
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
        }, 1500);
    };

    return (
        <div style={{width: 300, height: 300}}>
            <TutorialsHistory
                title="Paginated tutorials"
                items={items}
                selectedRowId="basics-2"
                loading={loading}
                hasMore={page < PAGINATION_PAGES.length}
                onLoadMore={handleLoadMore}
                renderLink={renderRouterLink}
                search={{onUpdate: action('onSearchUpdate')}}
            />
        </div>
    );
};

const RouterLinksStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 500, height: 500}}>
            <TutorialsHistory
                title="Router links"
                items={LINK_ITEMS}
                renderLink={renderRouterLink}
                search={{...search, hasClear: true, onUpdate: setSearch}}
            />
        </div>
    );
};

const CustomRowRendererStory = () => (
    <div style={{width: 400, height: 300}}>
        <TutorialsHistory
            title="Custom tutorial rows"
            items={CUSTOM_ROW_ITEMS}
            selectedRowId="01HZXB4K8P7Y2Q9T6M3N5R1C0A"
            renderLink={renderRouterLink}
            renderRowItem={({item, renderLink}) =>
                'header' in item ? (
                    <HistoryGroupHeader title={item.header} />
                ) : (
                    <RowLink href={item.href} renderLink={renderLink}>
                        <Flex alignItems="center" gap={2}>
                            <Icon data={BookOpenIcon} size={16} />
                            <Text ellipsis>{item.title}</Text>
                        </Flex>
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
        title: 'Loading tutorials',
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
export const LoadingMore: Story = {
    args: {
        title: 'Loading next page',
        items: PAGINATION_PAGES[0],
        loading: true,
        hasMore: true,
        onLoadMore: action('onLoadMore'),
        search: {onUpdate: action('onSearchUpdate')},
    },
    decorators: [
        (StoryComponent) => (
            <div style={{width: 300, height: 300}}>
                <StoryComponent />
            </div>
        ),
    ],
};
export const RouterLinks: Story = {render: () => <RouterLinksStory />};
export const CustomRowRenderer: Story = {render: () => <CustomRowRendererStory />};
