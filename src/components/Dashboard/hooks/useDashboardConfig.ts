import {useEffect, useMemo, useState} from 'react';
import {createDefaultLayout} from '../helpers/createDefaultLayout';
import type {DashboardProps, DashboardRenderItem} from '../../../types/dashboard';
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
    controlledLayout?: ConfigLayout[],
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

    const [localLayout, setLocalLayout] = useState(() =>
        createDefaultLayout(items, cols, defaultLayout),
    );
    const [layoutRevision, setLayoutRevision] = useState(0);
    const layout = useMemo(
        () => createDefaultLayout(items, cols, controlledLayout ?? localLayout),
        // A fresh layout reference tells DashKit to restore a rejected controlled drag.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [controlledLayout, localLayout, items, cols, layoutRevision],
    );
    useEffect(() => {
        if (controlledLayout === undefined) {
            setLocalLayout((previous) =>
                JSON.stringify(previous) === JSON.stringify(layout) ? previous : layout,
            );
        }
    }, [controlledLayout, layout]);
    const changeLayout = (next: ConfigLayout[]) => {
        // DashKit keeps drag coordinates internally. Reassert even a rejected controlled edit.
        if (controlledLayout !== undefined) setLayoutRevision((revision) => revision + 1);
        const normalized = createDefaultLayout(items, cols, next);
        if (JSON.stringify(normalized) === JSON.stringify(layout)) return undefined;
        if (controlledLayout === undefined) setLocalLayout(normalized);
        return normalized;
    };

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

    return {config, gridGroups, changeLayout};
};
