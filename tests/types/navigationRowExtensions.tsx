import React from 'react';
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
