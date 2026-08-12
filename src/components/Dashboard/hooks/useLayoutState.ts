import {useMemo, useState} from 'react';
import {ConfigLayout} from '@gravity-ui/dashkit';
import {DashboardItem} from '../types';
import {createDefaultLayout, createDefaultLayoutForItem} from '../helpers/createDefaultLayout';

export const useLayoutState = (
    items: DashboardItem[],
    colsOnGrid: number,
    customerLayoutState?: ConfigLayout[],
) => {
    const [internalLayoutState, setInternalLayoutState] = useState(
        customerLayoutState ?? createDefaultLayout(items, colsOnGrid),
    );

    const actualLayoutState = customerLayoutState ?? internalLayoutState;

    const currentLayout = useMemo(() => {
        const layoutForEachItem: ConfigLayout[] = [];

        items.forEach((item, index) => {
            const itemLayout = actualLayoutState[index];
            if (itemLayout) {
                layoutForEachItem.push(itemLayout);
                return;
            }
            const defaultLayoutForItem = createDefaultLayoutForItem(item, colsOnGrid, index);
            layoutForEachItem.push(defaultLayoutForItem);
        });

        return layoutForEachItem;
    }, [actualLayoutState, colsOnGrid, items]);

    return {layout: currentLayout, setLayout: setInternalLayoutState};
};
