import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueriesNavigation} from './QueriesNavigation';
import {createNavigationDetailResolver} from './helpers/createNavigationDetailResolver';
import {action} from 'storybook/actions';
import {
    NavigationCluster,
    NavigationHeaderAction,
    NavigationItem,
    NavigationLocation,
    NavigationSortOrder,
} from '../../types/navigation';
import {mockLoadPathSuggestions} from '../../components/PathEditor/PathEditor.stories.helpers';
import FileArrowRightOutIcon from '@gravity-ui/icons/svgs/file-arrow-right-out.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {Flex, Icon, Label, Text} from '@gravity-ui/uikit';
import {ClusterRow, NavigationItemRow} from '../../modules';

const meta: Meta<typeof QueriesNavigation> = {
    title: 'Widgets/QueriesNavigation',
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

const CLUSTERS: NavigationCluster[] = [
    {
        id: 'arnold',
        title: 'Arnold',
        color: 'white',
        backgroundColor: 'rgba(218, 68, 83, 1)',
        description: 'Production',
    },
    {
        id: 'freud',
        title: 'Freud',
        color: 'white',
        backgroundColor: 'rgba(127, 130, 133, 1)',
        description: 'Production',
    },
    {
        id: 'hahn',
        title: 'Hahn',
        color: 'white',
        backgroundColor: 'rgba(215, 112, 173, 1)',
        description: 'Production',
    },
    {
        id: 'yp-sas-test',
        title: 'YP-Sas-Test',
        color: 'white',
        backgroundColor: 'rgba(150, 122, 220, 1)',
        description: 'Testing',
    },
    {
        id: 'zeno',
        title: 'Zeno',
        color: 'white',
        backgroundColor: 'rgba(233, 87, 63, 1)',
        description: 'Production',
    },
    {
        id: 'ada',
        title: 'Ada',
        color: 'white',
        backgroundColor: 'rgba(67, 68, 69, 1)',
        description: 'Production',
    },
    {
        id: 'arnold-gnd',
        title: 'Arnold-GND',
        color: 'white',
        backgroundColor: 'rgba(140, 193, 82, 1)',
        description: 'tesdting',
    },
    {
        id: 'deimos',
        title: 'Deimos',
        color: 'white',
        backgroundColor: 'rgba(55, 188, 155, 1)',
        description: 'Production',
    },
    {
        id: 'freud-gnd',
        title: 'Freud-GND',
        color: 'white',
        backgroundColor: 'rgba(140, 193, 82, 1)',
        description: 'Prestable',
    },
];

const ITEM_NAMES: Array<Pick<NavigationItem, 'title' | 'kind' | 'hasChildren' | 'disabled'>> = [
    {title: 'abcdapter', kind: 'folder', hasChildren: true},
    {title: 'access_control_object', kind: 'file'},
    {title: 'account_tree', kind: 'folder', hasChildren: true, disabled: true},
    {title: 'cell_balancers', kind: 'folder', hasChildren: true},
    {title: 'clusters', kind: 'folder', hasChildren: true},
    {title: 'doctors_table', kind: 'table'},
];

const getPathDepth = (path: string | undefined): number =>
    (path ?? '').split('/').filter(Boolean).length;

// Depth-aware mock: nested folders are empty so the empty state is reachable
// by navigating into any folder from the initial listing.
const getItemsForPath = (path: string | undefined): NavigationItem[] => {
    if (getPathDepth(path) > 1) {
        return [];
    }

    return ITEM_NAMES.map(({title, kind, hasChildren, disabled}) => ({
        path: `${path ?? ''}/${title}`,
        title,
        kind,
        hasChildren,
        disabled,
    }));
};

export default meta;
type Story = StoryObj<typeof QueriesNavigation>;

const useLocationState = (initial: NavigationLocation) => {
    const [location, setLocation] = useState<NavigationLocation>(initial);
    const onUpdate = (next: NavigationLocation) => {
        onBreadcrumbsUpdate(next);
        setLocation(next);
    };
    return {location, onUpdate};
};

const ClustersToItemsStory = () => {
    const {location, onUpdate} = useLocationState({cluster: undefined, path: undefined});
    const [sort, setSort] = useState<NavigationSortOrder>('asc');

    return (
        <div style={{width: 300, height: 500}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                clusters={CLUSTERS}
                items={getItemsForPath(location.path)}
                sort={{value: sort, onUpdate: setSort}}
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
    const {location, onUpdate} = useLocationState({cluster: 'arnold', path: '/home/empty'});

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
    const {location, onUpdate} = useLocationState({cluster: 'arnold', path: '/home'});
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
                listState={{errorContent: 'Custom load error message'}}
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

const getCustomItemsForPath = (path: string | undefined): CustomItem[] =>
    getItemsForPath(path).map((item, index) => ({
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
                items={getCustomItemsForPath(location.path)}
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

const DetailViewStory = () => {
    const {location, onUpdate} = useLocationState({cluster: 'arnold', path: '/home'});
    const [openedItem, setOpenedItem] = useState<NavigationItem | undefined>(undefined);
    const [sort, setSort] = useState<NavigationSortOrder>('asc');

    const resolveDetail = createNavigationDetailResolver();

    return (
        <div style={{width: 340, height: 600}}>
            <QueriesNavigation
                location={location}
                header={{actions: defaultActions, onLoadSuggestions: mockLoadPathSuggestions}}
                onUpdate={onUpdate}
                items={getItemsForPath(location.path)}
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
                onItemClick={action('onItemClick')}
            />
        </div>
    );
};

const CustomDetailResolverStory = () => {
    const {location, onUpdate} = useLocationState({cluster: 'arnold', path: '/home'});
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

export const ClustersToItems: Story = {render: () => <ClustersToItemsStory />};
export const Loading: Story = {render: () => <LoadingStory />};
export const Empty: Story = {render: () => <EmptyStory />};
export const EmptySearch: Story = {render: () => <EmptySearchStory />};
export const Error: Story = {render: () => <ErrorStory />};
export const CustomRows: Story = {render: () => <CustomRowsStory />};
export const DetailView: Story = {render: () => <DetailViewStory />};
export const CustomDetailResolver: Story = {render: () => <CustomDetailResolverStory />};
