import type {DashboardRenderItem} from '../types';
import type {ConfigLayout} from '@gravity-ui/dashkit';

const DEFAULT_ITEM_HEIGHT = 4;

export const createDefaultLayout = (
    items: DashboardRenderItem[],
    columns: number,
    defaultLayout?: ConfigLayout[],
): ConfigLayout[] => {
    const itemCount = items.length;

    const width = Math.min(Math.ceil(columns / 2), columns);
    const height = DEFAULT_ITEM_HEIGHT;

    const itemsPerRow = Math.max(Math.floor(columns / width), 1);

    return Array.from({length: itemCount}, (_, index) => {
        if (defaultLayout?.[index]) {
            return defaultLayout?.[index];
        }

        return {
            i: items[index].id,
            x: (index % itemsPerRow) * width,
            y: Math.floor(index / itemsPerRow) * height,
            w: width,
            h: height,
        };
    });
};
