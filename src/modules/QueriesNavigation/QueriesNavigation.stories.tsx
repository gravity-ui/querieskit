import {CLUSTERS, getItemsForPath} from './QueriesNavigation.stories.data';
import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueriesNavigation} from './QueriesNavigation';
import {createNavigationDetailResolver} from './helpers/createNavigationDetailResolver';
import {createTableDetailConfig} from './helpers/createTableDetailConfig';
import {action} from 'storybook/actions';
import {
    NavigationCluster,
    NavigationHeaderAction,
    NavigationItem,
    NavigationLocation,
    NavigationSortOrder,
    NavigationViewSection,
} from '../../types/navigation';
import {mockLoadPathSuggestions} from '../../components/PathEditor/PathEditor.stories.helpers';
import FileArrowRightOutIcon from '@gravity-ui/icons/svgs/file-arrow-right-out.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import CodeIcon from '@gravity-ui/icons/svgs/code.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import {
    Button,
    DropdownMenu,
    type DropdownMenuItem,
    Flex,
    Icon,
    Label,
    Text,
} from '@gravity-ui/uikit';
import {ClusterRow, NavigationItemRow} from '../../components';
import {SCHEMA_COLUMNS} from '../../modules/NavigationSchema/story/mockData';
import {PREVIEW_COLUMNS, PREVIEW_ROWS} from '../../modules/NavigationPreview/story/mockData';
import {META_GROUPS} from '../../modules/NavigationMeta/story/mockData';
import {VIEW_COLUMNS, makeViewRows} from '../../modules/NavigationView/story/mockData';

const meta: Meta<typeof QueriesNavigation> = {
    title: 'Modules/QueriesNavigation',
    component: QueriesNavigation,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

const onBreadcrumbsUpdate = action('onUpdate');
const logAction = action('actionClick');

const defaultActions: NavigationHeaderAction[] = [
    {
        id: 'paste',
        title: 'Paste path',
        content: <Icon data={FileArrowRightOutIcon} size={16} />,
        onClick: (location) => logAction('Paste', location),
    },
    {
        id: 'open',
        title: 'Open in new tab',
        content: <Icon data={ArrowUpRightFromSquareIcon} size={16} />,
        onClick: (location) => logAction('Open', location),
    },
];

export default meta;
type Story = StoryObj<typeof QueriesNavigation>;

const TABLE_VIEW_SECTIONS_WITH_ACTIONS: NavigationViewSection[] = [
    {
        id: 'general',
        title: 'General',
        columns: VIEW_COLUMNS,
        rows: makeViewRows(2),
        loaded: true,
        defaultExpanded: true,
        actions: [
            {
                id: 'code',
                title: 'Show code',
                content: <Icon data={CodeIcon} size={14} />,
                onClick: (section) => logAction('ViewShowCode', section.id),
            },
            {
                id: 'settings',
                title: 'Settings',
                content: <Icon data={GearIcon} size={14} />,
                onClick: (section) => logAction('ViewSettings', section.id),
            },
        ],
    },
    {
        id: 'attributes',
        title: 'Attributes',
        columns: VIEW_COLUMNS,
        rows: makeViewRows(2),
        loaded: true,
    },
];

const useLocationState = (initial: NavigationLocation) => {
    const [location, setLocation] = useState<NavigationLocation>(initial);
    const onUpdate = (next: NavigationLocation) => {
        onBreadcrumbsUpdate(next);
        setLocation(next);
    };
    return {location, onUpdate};
};

const useNavigationStoryState = (initial: NavigationLocation) => {
    const {location, onUpdate} = useLocationState(initial);
    const [sort, setSort] = useState<NavigationSortOrder>('asc');
    const items = getItemsForPath(location.path, sort);

    return {location, onUpdate, sort, setSort, items};
};

const ClustersToItemsStory = () => {
    const {location, onUpdate, sort, setSort, items} = useNavigationStoryState({
        cluster: undefined,
        path: undefined,
    });
    const [openedItem, setOpenedItem] = useState<NavigationItem | undefined>(undefined);

    const resolveDetail = createNavigationDetailResolver({
        table: createTableDetailConfig({
            resolveSchema: () => ({columns: SCHEMA_COLUMNS, loaded: true}),
            resolvePreview: () => ({
                columns: PREVIEW_COLUMNS,
                rows: PREVIEW_ROWS,
                loaded: true,
            }),
            resolveMeta: () => ({groups: META_GROUPS, loaded: true}),
            resolveView: () => ({sections: TABLE_VIEW_SECTIONS_WITH_ACTIONS, loaded: true}),
        }),
    });

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                clusters={CLUSTERS}
                items={items}
                sort={{value: sort, onUpdate: setSort}}
                detail={{
                    openedItem,
                    onItemOpen: (item) => {
                        action('onItemOpen')(item);
                        setOpenedItem(item);
                    },
                    onClose: () => setOpenedItem(undefined),
                    resolve: resolveDetail,
                }}
                onClusterClick={action('onClusterClick')}
                onItemClick={action('onItemClick')}
            />
        </div>
    );
};

const LoadingStory = () => {
    const {location, onUpdate} = useLocationState({cluster: undefined, path: undefined});

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                clusters={[]}
                listState={{loading: true}}
            />
        </div>
    );
};

const EmptyStory = () => {
    const {location, onUpdate} = useLocationState({cluster: 'northstar', path: '/home/empty'});

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                items={[]}
            />
        </div>
    );
};

const EmptySearchStory = () => {
    const {location, onUpdate} = useLocationState({cluster: 'northstar', path: '/home'});
    const [search, setSearch] = useState('no-such-item');

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                items={[]}
                search={{value: search, onUpdate: setSearch}}
            />
        </div>
    );
};

const ErrorStory = () => {
    const {location, onUpdate} = useLocationState({cluster: undefined, path: undefined});

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                clusters={[]}
                listState={{error: 'Custom load error message'}}
            />
        </div>
    );
};

type CustomCluster = NavigationCluster & {env: string};
type CustomItem = NavigationItem & {owner?: string};

const CUSTOM_CLUSTERS: CustomCluster[] = CLUSTERS.map((cluster) => ({
    ...cluster,
    env: cluster.description ?? 'Unknown',
}));

const getCustomItemsForPath = (path: string | undefined, sort: NavigationSortOrder): CustomItem[] =>
    getItemsForPath(path, sort).map((item, index) => ({
        ...item,
        owner: index % 2 === 0 ? 'robot' : 'user',
    }));

const CustomRowsStory = () => {
    const {location, onUpdate} = useLocationState({cluster: undefined, path: undefined});
    const [sort, setSort] = useState<NavigationSortOrder>('asc');

    return (
        <div style={{width: 340, height: 500}}>
            <QueriesNavigation<CustomItem, CustomCluster>
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                clusters={CUSTOM_CLUSTERS}
                items={getCustomItemsForPath(location.path, sort)}
                sort={{value: sort, onUpdate: setSort}}
                renderClusterItem={({cluster}) => (
                    <Flex alignItems="center" gap={2} style={{width: '100%', padding: '0 8px'}}>
                        <ClusterRow cluster={cluster} />
                        <Label theme="info">{cluster.env}</Label>
                    </Flex>
                )}
                renderNavigationItem={({item, isParentRow}) =>
                    isParentRow ? (
                        <NavigationItemRow item={item} />
                    ) : (
                        <Flex alignItems="center" gap={2} style={{width: '100%', padding: '0 8px'}}>
                            <NavigationItemRow item={item} />
                            {item.owner && (
                                <Text color="secondary" variant="caption-2">
                                    {item.owner}
                                </Text>
                            )}
                        </Flex>
                    )
                }
                onClusterClick={action('onClusterClick')}
                onItemClick={action('onItemClick')}
            />
        </div>
    );
};

const CustomDetailResolverStory = () => {
    const {location, onUpdate} = useLocationState({cluster: 'northstar', path: '/home'});
    const [openedItem, setOpenedItem] = useState<NavigationItem | undefined>(undefined);

    const resolveDetail = createNavigationDetailResolver({
        file: (item) => ({
            tabs: [
                {id: 'content', title: 'Content', content: `Content of ${item.title}`},
                {id: 'meta', title: 'Meta', content: 'Meta placeholder'},
            ],
            hasSearch: false,
        }),
    });

    return (
        <div style={{width: 340, height: 600}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                items={getItemsForPath(location.path)}
                detail={{
                    openedItem,
                    onItemOpen: setOpenedItem,
                    onClose: () => setOpenedItem(undefined),
                    resolve: resolveDetail,
                }}
                onItemClick={action('onItemClick')}
            />
        </div>
    );
};

const CustomHeaderActionsStory = () => {
    const {location, onUpdate, items} = useNavigationStoryState({
        cluster: 'northstar',
        path: '/home',
    });

    return (
        <div style={{width: 420, height: 500}}>
            <QueriesNavigation
                location={location}
                onUpdate={onUpdate}
                items={items}
                header={{
                    actions: defaultActions,
                    renderActions: ({location: actionLocation, actions}) => {
                        const menuItems = actions
                            .filter(({hidden}) => !hidden)
                            .map<DropdownMenuItem>(({title, disabled, onClick}) => ({
                                text: title,
                                disabled,
                                action: () => onClick(actionLocation),
                            }));
                        const href = `/navigation/${actionLocation.cluster}${actionLocation.path ?? ''}`;

                        return (
                            <Flex gap={1} shrink={0}>
                                <DropdownMenu
                                    size="s"
                                    items={menuItems}
                                    renderSwitcher={(props) => (
                                        <Button {...props} view="flat" size="s">
                                            Favorites
                                        </Button>
                                    )}
                                />
                                <Button view="flat" size="s" href={href} target="_blank">
                                    Open
                                </Button>
                            </Flex>
                        );
                    },
                }}
            />
        </div>
    );
};

const LinkedBreadcrumbsStory = () => {
    const {location, onUpdate, items} = useNavigationStoryState({
        cluster: 'northstar',
        path: '/home',
    });
    const [openedItem, setOpenedItem] = useState<NavigationItem | undefined>(undefined);

    return (
        <div style={{width: 420, height: 500}}>
            <QueriesNavigation
                location={location}
                onUpdate={onUpdate}
                items={items}
                header={{
                    actions: defaultActions,
                    getBreadcrumbHref: ({cluster, path}) =>
                        cluster ? `/navigation/${cluster}${path ?? ''}` : '/navigation',
                }}
                detail={{
                    openedItem,
                    onItemOpen: setOpenedItem,
                    onClose: () => setOpenedItem(undefined),
                }}
            />
        </div>
    );
};

const ParentRowDuringSearchStory = () => {
    const {location, onUpdate} = useLocationState({cluster: 'northstar', path: '/home'});
    const [search, setSearch] = useState('cluster');
    const items = getItemsForPath(location.path).filter(({title}) => title.includes(search));

    return (
        <div style={{width: 340, height: 500}}>
            <QueriesNavigation
                location={location}
                onUpdate={onUpdate}
                items={items}
                search={{value: search, onUpdate: setSearch}}
                parentRow={{showDuringSearch: true}}
                renderNavigationItem={({item, isParentRow}) => (
                    <div data-qa={isParentRow ? 'parent-row' : undefined}>
                        <NavigationItemRow item={item} />
                    </div>
                )}
            />
        </div>
    );
};

export const ClustersToItems: Story = {render: () => <ClustersToItemsStory />};
export const Loading: Story = {render: () => <LoadingStory />};
export const Empty: Story = {render: () => <EmptyStory />};
export const EmptySearch: Story = {render: () => <EmptySearchStory />};
export const Error: Story = {render: () => <ErrorStory />};
export const CustomRows: Story = {render: () => <CustomRowsStory />};
export const CustomDetailResolver: Story = {render: () => <CustomDetailResolverStory />};
export const CustomHeaderActions: Story = {render: () => <CustomHeaderActionsStory />};
export const LinkedBreadcrumbs: Story = {render: () => <LinkedBreadcrumbsStory />};
export const ParentRowDuringSearch: Story = {render: () => <ParentRowDuringSearchStory />};
