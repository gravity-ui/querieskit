import React from 'react';
import {NavigationActionsMenu} from '../../src/components/NavigationActionsMenu';
import type {NavigationActionGroup} from '../../src/types/navigationActionsMenuProps';
import {NavigationItemRow} from '../../src/components/NavigationItemRow';
import {QueriesNavigation} from '../../src/modules/QueriesNavigation';
import type {GetNavigationItemRowConfig, NavigationItem} from '../../src/types/navigation';

type AppItem = NavigationItem & {favorite: boolean; target: string; metadata: {owner: string}};
const item: AppItem = {
    path: '/example',
    title: 'Example',
    favorite: true,
    target: '/destination',
    metadata: {owner: 'user'},
};
const getItemRowConfig: GetNavigationItemRowConfig<AppItem> = (value) => ({
    renderMenuTrigger: ({item: original, disabled}) => (
        <button disabled={disabled}>{original.metadata.owner}</button>
    ),
    description: value.target,
    indicators: value.favorite ? '★' : undefined,
    actions: [
        {
            id: 'favorite',
            title: 'Favorite',
            content: '★',
            onClick: (original) => {
                const owner: string = original.metadata.owner;
                return owner;
            },
        },
    ],
});

<NavigationItemRow item={item} {...getItemRowConfig(item)} />;
<QueriesNavigation
    items={[item]}
    location={{cluster: 'cluster', path: '/'}}
    onUpdate={() => {}}
    getItemRowConfig={getItemRowConfig}
    header={{
        renderMenuTrigger: ({location, actions}) => (
            <button title={location.path}>{actions.length}</button>
        ),
    }}
/>;

const groups: NavigationActionGroup<AppItem>[] = [
    {
        id: 'copy',
        title: 'Copy',
        actions: [
            {
                id: 'owner',
                title: 'Owner',
                content: null,
                onClick: (original) => {
                    const owner: string = original.metadata.owner;
                    return owner;
                },
            },
        ],
    },
];
<NavigationItemRow
    item={item}
    menuActionGroups={groups}
    actionsVisibility="hover"
    actionsMenuOpen={false}
/>;
<NavigationActionsMenu
    arg={item}
    groups={groups}
    onOpenToggle={(open) => {
        const isOpen: boolean = open;
        return isOpen;
    }}
/>;
