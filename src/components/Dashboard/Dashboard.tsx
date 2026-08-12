import React, {useCallback, useMemo, useRef} from 'react';
import type {Config, ConfigItem, DashKitGroup, ReactGridLayoutProps} from '@gravity-ui/dashkit';
import {DashKit} from '@gravity-ui/dashkit';
import {DashPlate} from './DashPlate';
import cn from 'bem-cn-lite';

import type {DashboardItem, DashboardLayoutItem, DashboardProps} from './types';

import './Dashboard.scss';

const block = cn('qp-dashboard');
const DASHBOARD_PLUGIN_TYPE = 'querieskit-dashboard-item';

const DEFAULT_GRID: DashboardProps['grid'] = {
    cols: 4,
    rowHeight: 64,
    gap: 8,
    compactType: 'vertical',
};

function createConfig(items: readonly DashboardItem[], counter: number, columns: number): Config {
    return {
        salt: 'querieskit-dashboard',
        counter,
        aliases: {},
        connections: [],
        items: items.map(({id}) => ({
            id,
            type: DASHBOARD_PLUGIN_TYPE,
            namespace: 'default',
            data: {},
        })),
        layout: items.map(({id, x, y, width, height}) => ({
            i: id,
            x,
            y,
            w: width ?? columns,
            h: height,
        })),
    };
}

export const Dashboard = ({
    items,
    grid,
    focusable = false,
    className,
    onItemsChange,
    onLayoutChange,
    onItemFocus,
    onItemBlur,
}: DashboardProps) => {
    const gridProperties: ReactGridLayoutProps = useMemo(() => {
        const gap = grid?.gap ?? DEFAULT_GRID.gap;

        return {
            containerPadding: [0, 0],
            margin: typeof gap === 'number' ? [gap, gap] : gap,
            ...DEFAULT_GRID,
            ...grid,
        };
    }, [grid]);

    useMemo(() => {
        DashKit.reloadPlugins({
            type: DASHBOARD_PLUGIN_TYPE,
            renderer: DashPlate,
            defaultLayout: {minW: 1, minH: 1},
        });
    }, []);

    const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

    const counterRef = useRef(items.length);
    counterRef.current = Math.max(counterRef.current, items.length);

    const config = useMemo(
        () => createConfig(items, counterRef.current, gridProperties.columns),
        [items, gridProperties.columns],
    );

    const groups = useMemo<DashKitGroup[]>(
        () => [{gridProperties: () => gridProperties}],
        [gridProperties],
    );

    const context = useMemo(() => ({dashboardItems: itemsById}), [itemsById]);

    const handleChange = ({config: nextConfig}: {config: Config}) => {
        const nextItems: DashboardItem[] = [];
        const nextLayout: DashboardLayoutItem[] = [];

        for (const {i, x, y, w, h} of nextConfig.layout) {
            const item = itemsById.get(i);
            if (!item) continue;
            nextItems.push({...item, x, y, width: w, height: h});
            nextLayout.push({id: i, x, y, width: w, height: h});
        }

        onItemsChange?.(nextItems);
        onLayoutChange?.(nextLayout);
    };

    const getItem = useCallback(({id}: ConfigItem) => itemsById.get(id), [itemsById]);

    const handleItemFocus = (item: ConfigItem) => {
        const dashboardItem = getItem(item);
        if (dashboardItem) {
            onItemFocus?.(dashboardItem);
        }
    };

    const handleItemBlur = (item: ConfigItem) => {
        const dashboardItem = getItem(item);
        if (dashboardItem) {
            onItemBlur?.(dashboardItem);
        }
    };

    return (
        <div className={block(null, className)}>
            <DashKit
                config={config}
                groups={groups}
                editMode
                noOverlay
                draggableHandleClassName={block('draggable-handle')}
                focusable={focusable}
                context={context}
                onChange={handleChange}
                onItemFocus={handleItemFocus}
                onItemBlur={handleItemBlur}
            />
        </div>
    );
};
