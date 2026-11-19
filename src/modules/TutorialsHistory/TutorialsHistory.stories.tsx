import {BASE_ITEMS, QUERY} from './TutorialsHistory.stories.data';
import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import BookOpenIcon from '@gravity-ui/icons/svgs/book-open.svg';
import {HistoryGroupHeader, RowLink} from '../../components';
import {TutorialsHistory} from './TutorialsHistory';
import type {QueryListItem, QueryListLinkRenderer} from '../../types/queryList';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {action} from 'storybook/actions';

const ENGINES = [
    {id: 'yql', title: 'YQL'},
    {id: 'chyt', title: 'CHYT'},
];
const ENGINE_ITEMS = BASE_ITEMS.map((item) =>
    'id' in item ? {...item, engineId: item.id === 3 ? 'chyt' : 'yql'} : item,
);
const logEngineUpdate = action('onEngineUpdate');

const LINK_ITEMS = BASE_ITEMS.map((item) =>
    'id' in item ? {...item, href: `/tutorials/${item.id}`} : item,
);

const PAGINATION_PAGES: QueryListItem<TutorialHistoryRow>[][] = [
    Array.from({length: 8}, (_, index) => ({
        id: `basics-${index + 1}`,
        number: index + 1,
        title: `YQL basics: lesson ${index + 1}`,
        query: QUERY,
        href: `/tutorials/basics-${index + 1}`,
        height: 28,
    })),
    Array.from({length: 8}, (_, index) => ({
        id: `advanced-${index + 1}`,
        number: index + 9,
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
    title: 'Modules/TutorialsHistory',
    component: TutorialsHistory,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof TutorialsHistory>;

const DefaultStory = () => {
    const [engineId, setEngineId] = useState<string | null>(null);
    const [search, setSearch] = useState({value: '', fullSearch: false});
    const searchValue = search.value.trim().toLowerCase();
    const items = ENGINE_ITEMS.filter((item) => {
        if (!('id' in item)) return !engineId && !searchValue;
        if (engineId && item.engineId !== engineId) return false;
        return (
            item.title.toLowerCase().includes(searchValue) ||
            (search.fullSearch && item.query?.toLowerCase().includes(searchValue))
        );
    });

    return (
        <div style={{width: 300, height: 500}}>
            <TutorialsHistory
                title="Tutorials"
                items={items}
                engineFilter={{
                    engines: ENGINES,
                    value: engineId,
                    onUpdate: (value) => {
                        setEngineId(value);
                        logEngineUpdate(value);
                    },
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

const DESIGN_ITEMS: QueryListItem<TutorialHistoryRow>[] = [
    'Select all columns',
    'Select specific columns',
    'Basic filter',
    'String filter',
    'Sort and get top N',
    'Basic aggregation',
    'Conditional values and UDF',
    'Named nodes and subqueries',
    'Save and insert results',
    'Join tables',
    'Window functions',
    'Containers',
    'Table concatenation',
    'Sampling',
    'Flatten by',
    'Lambda functions',
    'Yson and Json',
    'Regexp capture',
    'Inline Python',
    'Attached Javascript',
    'Statistics',
    'User Defined Aggregation Functions',
].map((title, index) => ({id: `lesson-${index + 1}`, number: index + 1, title, height: 28}));

/** Reference dimensions and content from the Tutorials Figma frame. */
export const DesignReference: Story = {
    args: {
        items: DESIGN_ITEMS,
        logo: <Text>YQL UI</Text>,
        search: {onUpdate: action('onSearchUpdate')},
        engineFilter: {engines: ENGINES, onUpdate: logEngineUpdate},
    },
    decorators: [
        (StoryComponent) => (
            <div style={{width: 347, height: 720}}>
                <StoryComponent />
            </div>
        ),
    ],
};

export const DesignEmpty: Story = {
    ...DesignReference,
    args: {
        ...DesignReference.args,
        items: [],
        engineFilter: {engines: ENGINES, value: 'chyt', onUpdate: logEngineUpdate},
    },
};

export const DesignSelected: Story = {
    ...DesignReference,
    args: {...DesignReference.args, selectedRowId: 'lesson-2'},
};
export const DesignEngineSelected: Story = {
    ...DesignReference,
    args: {
        ...DesignReference.args,
        engineFilter: {engines: ENGINES, value: 'yql', onUpdate: logEngineUpdate},
    },
};

export const MissingEngines: Story = {
    ...DesignReference,
    args: {
        ...DesignReference.args,
        engineFilter: {value: 'yql', onUpdate: logEngineUpdate},
    },
};

export const EmptyEngines: Story = {
    ...DesignReference,
    args: {
        ...DesignReference.args,
        engineFilter: {engines: [], value: 'yql', onUpdate: logEngineUpdate},
    },
};

export const LongEngineName: Story = {
    ...DesignReference,
    args: {
        ...DesignReference.args,
        engineFilter: {
            engines: [{id: 'custom', title: 'Custom analytics query engine'}],
            value: 'custom',
            onUpdate: logEngineUpdate,
        },
    },
};

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
