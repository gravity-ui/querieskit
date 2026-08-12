import {useMemo} from 'react';
import type {DashKitGroup, ReactGridLayoutProps} from '@gravity-ui/dashkit';
import {DashboardProps} from '../types';

const DEFAULT_COLUMNS = 4;
const DEFAULT_GRID: DashboardProps['grid'] = {
    cols: DEFAULT_COLUMNS,
    rowHeight: 64,
    gap: 8,
    compactType: 'vertical',
};

export const useGridState = (customerGridState?: ReactGridLayoutProps) => {
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

    return {gridProps, gridGroups};
};
