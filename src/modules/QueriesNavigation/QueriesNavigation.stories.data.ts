import type {NavigationCluster, NavigationItem, NavigationSortOrder} from '../../types/navigation';

export const CLUSTERS: NavigationCluster[] = [
    {
        id: 'northstar',
        title: 'Northstar',
        color: 'white',
        backgroundColor: 'rgba(218, 68, 83, 1)',
        description: 'Production',
    },
    {
        id: 'cedar',
        title: 'Cedar',
        color: 'white',
        backgroundColor: 'rgba(127, 130, 133, 1)',
        description: 'Production',
    },
    {
        id: 'sequoia',
        title: 'Sequoia',
        color: 'white',
        backgroundColor: 'rgba(215, 112, 173, 1)',
        description: 'Production',
    },
    {
        id: 'pioneer-test',
        title: 'Pioneer-Test',
        color: 'white',
        backgroundColor: 'rgba(150, 122, 220, 1)',
        description: 'Testing',
    },
    {
        id: 'orbit',
        title: 'Orbit',
        color: 'white',
        backgroundColor: 'rgba(233, 87, 63, 1)',
        description: 'Production',
    },
    {
        id: 'lighthouse',
        title: 'Lighthouse',
        color: 'white',
        backgroundColor: 'rgba(67, 68, 69, 1)',
        description: 'Production',
    },
    {
        id: 'northstar-gnd',
        title: 'Northstar-GND',
        color: 'white',
        backgroundColor: 'rgba(140, 193, 82, 1)',
        description: 'tesdting',
    },
    {
        id: 'harbor',
        title: 'Harbor',
        color: 'white',
        backgroundColor: 'rgba(55, 188, 155, 1)',
        description: 'Production',
    },
    {
        id: 'cedar-gnd',
        title: 'Cedar-GND',
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

export const getItemsForPath = (
    path: string | undefined,
    sort: NavigationSortOrder = 'asc',
): NavigationItem[] => {
    if (getPathDepth(path) > 1) {
        return [];
    }

    return [...ITEM_NAMES]
        .sort(({title: leftTitle}, {title: rightTitle}) =>
            sort === 'asc'
                ? leftTitle.localeCompare(rightTitle)
                : rightTitle.localeCompare(leftTitle),
        )
        .map(({title, kind, hasChildren, disabled}) => ({
            path: `${path ?? ''}/${title}`,
            title,
            kind,
            hasChildren,
            disabled,
        }));
};
