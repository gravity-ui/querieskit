import {useMemo} from 'react';
import {DashboardItem} from '../types';
import {ConfigLayout} from '@gravity-ui/dashkit';

export const DASHBOARD_PLUGIN_TYPE = 'querieskit-dashboard-item';

export const useDashboardConfig = (items: DashboardItem[], layout: ConfigLayout[]) => {
    return useMemo(
        () => ({
            salt: 'querieskit-dashboard',
            counter: 0,
            aliases: {},
            connections: [],
            items: items.map(({id}) => ({
                id,
                type: DASHBOARD_PLUGIN_TYPE,
                namespace: 'default',
                data: {},
            })),
            layout,
        }),
        [layout, items],
    );
};
