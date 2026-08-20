import React from 'react';
import type {Config} from '@gravity-ui/dashkit';
import type {DashboardProps} from './types';
import {Flex} from '@gravity-ui/uikit';
import {DRAG_HANDLE_CLASSNAME, DashPlate} from './internal/DashPlate';
import {DashboardProvider} from './internal/DashboardProvider';
import {DashKit} from '@gravity-ui/dashkit';
import {useDashboardConfig} from './hooks/useDashboardConfig';
import cn from 'bem-cn-lite';

import './Dashboard.scss';

const block = cn('qp-dashboard');
const DASHBOARD_PLUGIN_TYPE = 'querieskit-dashboard-item';

DashKit.reloadPlugins({
    type: DASHBOARD_PLUGIN_TYPE,
    renderer: DashPlate,
    defaultLayout: {minW: 1, minH: 1},
});

export const Dashboard = ({
    items,
    defaultLayout,
    grid: customerGridState,
    focusable = false,
    className,
    onLayoutChange,
}: DashboardProps) => {
    const {config, gridGroups} = useDashboardConfig(items, customerGridState, defaultLayout);

    const handleChange = ({config: nextConfig}: {config: Config}) => {
        onLayoutChange?.(nextConfig.layout);
    };

    return (
        <Flex width="100%" height="100%" className={block(null, className)}>
            <DashboardProvider items={items}>
                <DashKit
                    config={config}
                    groups={gridGroups}
                    editMode
                    noOverlay
                    draggableHandleClassName={DRAG_HANDLE_CLASSNAME}
                    focusable={focusable}
                    onChange={handleChange}
                />
            </DashboardProvider>
        </Flex>
    );
};
