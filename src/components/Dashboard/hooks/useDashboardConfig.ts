import {useMemo} from 'react';
import {createDefaultLayout} from '../helpers/createDefaultLayout';
import type {DashboardProps, DashboardRenderItem} from '../types';
import type {Config, ConfigLayout, DashKitGroup, ReactGridLayoutProps} from '@gravity-ui/dashkit';

export const DASHBOARD_PLUGIN_TYPE = 'querieskit-dashboard-item';

export const DEFAULT_COLUMNS = 4;

export const DEFAULT_GRID: DashboardProps['grid'] = {
    cols: DEFAULT_COLUMNS,
    rowHeight: 64,
    gap: 8,
    compactType: 'vertical',
};

export const useDashboardConfig = (
    items: DashboardRenderItem[],
    customerGridState?: ReactGridLayoutProps,
    defaultLayout?: ConfigLayout[],
) => {
    const gridProps: ReactGridLayoutProps = useMemo(() => {
        const gap = customerGridState?.gap ?? DEFAULT_GRID.gap;

        return {
            containerPadding: [0, 0],
            margin: typeof gap === 'number' ? [gap, gap] : gap,
            ...DEFAULT_GRID,
            ...customerGridState,
        };
    }, [customerGridState]);

    const gridGroups = useMemo<DashKitGroup[]>(
        () => [{gridProperties: () => gridProps}],
        [gridProps],
    );

    const cols = gridProps.cols;

    const layout = useMemo(
        () => defaultLayout ?? createDefaultLayout(items, cols),
        [defaultLayout, items, cols],
    );

    const config: Config = useMemo(
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

    return {config, gridGroups};
};
