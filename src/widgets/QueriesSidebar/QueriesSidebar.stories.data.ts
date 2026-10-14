import {useState} from 'react';
import {action} from 'storybook/actions';
import type {NavigationItem, NavigationLocation, NavigationSortOrder} from '../../types/navigation';
import type {
    QueryListFieldKey,
    QueryListItem,
    QueryListRow,
    QueryListSearchConfig,
} from '../../types/queryList';
import type {QueryHistoryRow} from '../../types/history';
import type {SavedQuery} from '../../types/savedQueries';
import {BASE_ITEMS as HISTORY_ITEMS} from '../../modules/QueriesHistory/QueriesHistory.stories.data';
import {BASE_ITEMS as SAVED_ITEMS} from '../../modules/SavedQueries/SavedQueries.stories.data';
import {BASE_ITEMS as TUTORIAL_ITEMS} from '../../modules/TutorialsHistory/TutorialsHistory.stories.data';
import {
    CLUSTERS,
    getItemsForPath,
} from '../../modules/QueriesNavigation/QueriesNavigation.stories.data';
import {
    createNavigationDetailResolver,
    createTableDetailConfig,
} from '../../modules/QueriesNavigation';
import {SCHEMA_COLUMNS} from '../../modules/NavigationSchema/story/mockData';
import {PREVIEW_COLUMNS, PREVIEW_ROWS} from '../../modules/NavigationPreview/story/mockData';
import {META_GROUPS} from '../../modules/NavigationMeta/story/mockData';
import {VIEW_COLUMNS, makeViewRows} from '../../modules/NavigationView/story/mockData';
import type {QueriesSidebarTab} from '../../types/queriesSidebar';

const resolveDetail = createNavigationDetailResolver({
    table: createTableDetailConfig({
        resolveSchema: () => ({columns: SCHEMA_COLUMNS, loaded: true}),
        resolvePreview: () => ({columns: PREVIEW_COLUMNS, rows: PREVIEW_ROWS, loaded: true}),
        resolveMeta: () => ({groups: META_GROUPS, loaded: true}),
        resolveView: () => ({
            sections: [
                {
                    id: 'general',
                    title: 'General',
                    columns: VIEW_COLUMNS,
                    rows: makeViewRows(2),
                    loaded: true,
                    defaultExpanded: true,
                },
            ],
            loaded: true,
        }),
    }),
});

function filterItems<T extends QueryListRow>(
    items: QueryListItem<T>[],
    search: QueryListSearchConfig,
) {
    const value = search.value?.trim().toLowerCase();
    if (!value) return items;
    return items.filter(
        (item) =>
            'id' in item &&
            (item.title.toLowerCase().includes(value) ||
                (search.fullSearch && item.query?.toLowerCase().includes(value))),
    );
}

function useSearch() {
    const [value, onUpdate] = useState({value: '', fullSearch: false});
    return {...value, onUpdate, hasClear: true};
}

/** Shared interactive sidebar demo for the widget and the page showcase. */
export function useQueriesSidebarTabs(): QueriesSidebarTab[] {
    const historySearch = useSearch();
    const savedSearch = useSearch();
    const tutorialSearch = useSearch();
    const [historyFields, setHistoryFields] = useState<QueryListFieldKey<QueryHistoryRow>[]>([
        'duration',
        'mode',
        'startTime',
        'engine',
        'isPrivate',
    ]);
    const [navigationSearch, setNavigationSearch] = useState('');
    const [sort, setSort] = useState<NavigationSortOrder>('asc');
    const [openedItem, setOpenedItem] = useState<NavigationItem>();
    const [selectedHistory, setSelectedHistory] = useState<QueryHistoryRow['id']>();
    const [selectedSaved, setSelectedSaved] = useState<SavedQuery['id']>();
    const [selectedTutorial, setSelectedTutorial] = useState<QueryListRow['id']>();
    const [location, setLocation] = useState<NavigationLocation>({
        cluster: undefined,
        path: undefined,
    });
    const tabs: QueriesSidebarTab[] = [
        {
            id: 'history',
            type: 'history',
            props: {
                items: filterItems(HISTORY_ITEMS, historySearch),
                search: historySearch,
                selectedRowId: selectedHistory,
                onListItemClick: (item) => {
                    if ('id' in item) setSelectedHistory(item.id);
                    action('history.onListItemClick')(item);
                },
                visibleFields: {
                    value: historyFields,
                    onChange: setHistoryFields,
                    fields: [
                        {id: 'duration', title: 'Duration'},
                        {id: 'mode', title: 'Mode'},
                        {id: 'startTime', title: 'Start time'},
                        {id: 'engine', title: 'Engine'},
                        {id: 'isPrivate', title: 'ACO'},
                    ],
                },
            },
        },
        {
            id: 'saved',
            type: 'saved',
            props: {
                items: filterItems(SAVED_ITEMS, savedSearch),
                search: savedSearch,
                selectedRowId: selectedSaved,
                onListItemClick: (item) => {
                    if ('id' in item) setSelectedSaved(item.id);
                    action('saved.onListItemClick')(item);
                },
            },
        },
        {
            id: 'navigation',
            type: 'navigation',
            props: {
                location,
                onUpdate: (next) => {
                    setLocation(next);
                    setNavigationSearch('');
                },
                clusters: CLUSTERS.filter((cluster) =>
                    cluster.title.toLowerCase().includes(navigationSearch.toLowerCase()),
                ),
                items: getItemsForPath(location.path, sort).filter((item) =>
                    item.title.toLowerCase().includes(navigationSearch.toLowerCase()),
                ),
                search: {value: navigationSearch, onUpdate: setNavigationSearch},
                sort: {value: sort, onUpdate: setSort},
                detail: {
                    openedItem,
                    onItemOpen: setOpenedItem,
                    onClose: () => setOpenedItem(undefined),
                    resolve: resolveDetail,
                },
            },
        },
        {
            id: 'tutorials',
            type: 'tutorials',
            props: {
                items: filterItems(TUTORIAL_ITEMS, tutorialSearch),
                search: tutorialSearch,
                selectedRowId: selectedTutorial,
                onListItemClick: (item) => {
                    if ('id' in item) setSelectedTutorial(item.id);
                    action('tutorials.onListItemClick')(item);
                },
            },
        },
    ];
    return tabs;
}
