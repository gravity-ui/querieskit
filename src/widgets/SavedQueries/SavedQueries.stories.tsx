import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {
    QueryListFieldKey,
    QueryListFilterConfig,
    QueryListItem,
    QueryListLinkRenderer,
    QueryListVisibleFieldsConfig,
} from '../../types/queryList';
import {SavedQuery} from '../../types/savedQueries';
import {SavedQueries} from './SavedQueries';
import {HistoryGroupHeader} from '../../components/HistoryGroupHeader';
import {RowLink} from '../../components/RowLink';

const QUERY = `SELECT
    session_id,
    COUNT(*) AS sessions_count
FROM visits
GROUP BY session_id;`;

const BASE_ITEMS: QueryListItem<SavedQuery>[] = [
    {
        id: 1,
        title: 'New Query',
        savedAt: '2026-04-29T12:00:00.000Z',
        engine: 'SQL',
        author: 'Anna Petrova',
        query: QUERY,
        height: 52,
    },
    {
        id: 2,
        title: 'Daily conversion report',
        savedAt: '2026-04-29T11:00:00.000Z',
        engine: 'YQL',
        author: 'Pavel Sidorov',
        query: QUERY,
        height: 52,
    },
    {
        id: 3,
        title: 'Product funnel',
        savedAt: '2026-04-28T09:00:00.000Z',
        engine: 'SQL',
        author: 'Maria Volkova',
        query: 'SELECT 1;',
        height: 52,
    },
];

const filterFields: QueryListFilterConfig['fields'] = [
    {id: 'onlyMine', type: 'switch', title: 'My queries only', initialValue: true},
    {id: 'range', type: 'rangeDatePicker', title: 'Period'},
    {
        id: 'engine',
        type: 'checkboxGroup',
        title: 'Engine',
        initialValue: [],
        items: [
            {id: 'yql', title: 'YQL'},
            {id: 'sql', title: 'SQL'},
        ],
    },
];

const fields: QueryListVisibleFieldsConfig<SavedQuery>['fields'] = [
    {id: 'savedAt', title: 'Saved date'},
    {id: 'engine', title: 'Engine'},
    {id: 'author', title: 'Author'},
];

const meta: Meta<typeof SavedQueries> = {
    title: 'Widgets/SavedQueries',
    component: SavedQueries,
    tags: ['autodocs'],
    parameters: {layout: 'padded'},
};

export default meta;
type Story = StoryObj<typeof SavedQueries>;

const SavedQueriesStory = () => {
    const [items, setItems] = useState(BASE_ITEMS);
    const [search, setSearch] = useState({value: '', fullSearch: false});
    const [visibleFields, setVisibleFields] = useState<QueryListFieldKey<SavedQuery>[]>([
        'savedAt',
        'engine',
        'author',
    ]);
    const [comparedRowIds, setComparedRowIds] = useState<(number | string)[]>([]);
    const [editingRowId, setEditingRowId] = useState<number | string>();

    const filteredItems = useMemo(() => {
        if (!search.value) return items;

        const value = search.value.toLowerCase();
        return items.filter((item) => {
            if ('header' in item) return false;

            return search.fullSearch
                ? item.title.toLowerCase().includes(value) ||
                      item.query?.toLowerCase().includes(value)
                : item.title.toLowerCase().includes(value);
        });
    }, [items, search]);

    const updateTitle = (item: SavedQuery, title: string) => {
        setItems((currentItems) =>
            currentItems.map((currentItem) =>
                'id' in currentItem && currentItem.id === item.id
                    ? {...currentItem, title}
                    : currentItem,
            ),
        );
        setEditingRowId(undefined);
    };

    return (
        <div style={{width: 360, height: 560}}>
            <SavedQueries
                items={filteredItems}
                search={{...search, hasClear: true, onUpdate: setSearch}}
                filter={{
                    fields: filterFields,
                    onApply: action('onFilterApply'),
                    onReset: action('onFilterReset'),
                }}
                visibleFields={{value: visibleFields, fields, onChange: setVisibleFields}}
                editing={{
                    rowId: editingRowId,
                    onSubmit: updateTitle,
                    onCancel: () => setEditingRowId(undefined),
                }}
                comparison={{
                    enabled: Boolean(comparedRowIds.length),
                    comparedRowIds,
                    onChange: (item, selected) => {
                        setComparedRowIds((currentIds) =>
                            selected
                                ? [...currentIds.filter((id) => id !== item.id).slice(-1), item.id]
                                : currentIds.filter((id) => id !== item.id),
                        );
                    },
                    onCancel: () => setComparedRowIds([]),
                    onCompare: () => action('onCompare')(comparedRowIds),
                }}
                getRowActions={(item) => [
                    {text: 'Copy to', onClick: () => action('onCopyTo')(item)},
                    {text: 'Show operations', onClick: () => action('onShowOperations')(item)},
                    {text: 'Edit', onClick: () => setEditingRowId(item.id)},
                    {
                        text: 'Compare with baseline',
                        onClick: () => setComparedRowIds([item.id]),
                    },
                    {text: 'Delete', theme: 'danger', onClick: () => action('onDelete')(item)},
                ]}
            />
        </div>
    );
};

type ExtendedSavedQuery = SavedQuery & {team: string};

const CustomAuthorStory = () => {
    const items: QueryListItem<ExtendedSavedQuery>[] = BASE_ITEMS.map((item) =>
        'header' in item ? item : {...item, team: 'Analytics'},
    );
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 360, height: 280}}>
            <SavedQueries
                items={items}
                search={{...search, hasClear: true, onUpdate: setSearch}}
                renderAuthor={(item) => <Text color="complementary">{item.team}</Text>}
            />
        </div>
    );
};

const EmptyStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <div style={{width: 360, height: 280}}>
            <SavedQueries items={[]} search={{...search, hasClear: true, onUpdate: setSearch}} />
        </div>
    );
};

export const Default: Story = {render: () => <SavedQueriesStory />};
export const CustomAuthor: Story = {render: () => <CustomAuthorStory />};
export const Empty: Story = {render: () => <EmptyStory />};

const LINK_ITEMS = BASE_ITEMS.map((item) =>
    'header' in item ? item : {...item, href: `/saved-queries/${item.id}`},
);

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
            )
                return;
            event.preventDefault();
            action('routerNavigate')(props.href);
        }}
    />
);

const PAGINATION_ITEMS: QueryListItem<SavedQuery>[] = Array.from({length: 24}, (_, index) => ({
    ...(BASE_ITEMS[0] as SavedQuery),
    id: `saved-${index + 1}`,
    title: `Saved report ${index + 1}`,
    href: `/saved-queries/saved-${index + 1}`,
}));

const PaginatedStory = () => {
    const [count, setCount] = useState(8);
    const [loading, setLoading] = useState(false);
    const timeout = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(timeout.current), []);
    return (
        <div style={{width: 360, height: 300}}>
            <SavedQueries
                items={PAGINATION_ITEMS.slice(0, count)}
                selectedRowId="saved-2"
                loading={loading}
                hasMore={count < PAGINATION_ITEMS.length}
                onLoadMore={() => {
                    if (loading || count >= PAGINATION_ITEMS.length) return;
                    action('onLoadMore')(count);
                    setLoading(true);
                    timeout.current = window.setTimeout(() => {
                        setCount((current) => current + 8);
                        setLoading(false);
                    }, 700);
                }}
                renderLink={renderRouterLink}
                search={{onUpdate: action('onSearchUpdate')}}
            />
        </div>
    );
};

const RouterLinksStory = () => {
    const [search, setSearch] = useState({value: 'SELECT', fullSearch: false});
    return (
        <div style={{width: 500, height: 500}}>
            <SavedQueries
                items={LINK_ITEMS}
                renderLink={renderRouterLink}
                search={{...search, hasClear: true, onUpdate: setSearch}}
            />
        </div>
    );
};

const CustomRowRendererStory = () => {
    const [search, setSearch] = useState({value: 'SELECT', fullSearch: false});
    return (
        <div style={{width: 500, height: 500}}>
            <SavedQueries
                items={[{header: 'Saved reports', height: 28}, ...LINK_ITEMS]}
                renderLink={renderRouterLink}
                renderRowItem={({item, variant, renderLink}) =>
                    'header' in item ? (
                        <HistoryGroupHeader title={item.header} />
                    ) : (
                        <RowLink href={item.href} renderLink={renderLink}>
                            <Text>{item.title}</Text>
                            {variant === 'search' && <pre>{item.query}</pre>}
                        </RowLink>
                    )
                }
                search={{...search, hasClear: true, onUpdate: setSearch}}
            />
        </div>
    );
};

const FullSearchUnavailableStory = () => {
    const [search, setSearch] = useState({value: 'report', fullSearch: true});
    return (
        <div style={{width: 360, height: 300}}>
            <SavedQueries
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

export const InitialLoading: Story = {
    args: {items: [], loading: true, search: {onUpdate: action('onSearchUpdate')}},
    decorators: [
        (StoryComponent) => (
            <div style={{width: 360, height: 300}}>
                <StoryComponent />
            </div>
        ),
    ],
};
export const Paginated: Story = {render: () => <PaginatedStory />};
export const RouterLinks: Story = {render: () => <RouterLinksStory />};
export const CustomRowRenderer: Story = {render: () => <CustomRowRendererStory />};
export const FullSearchUnavailable: Story = {render: () => <FullSearchUnavailableStory />};
