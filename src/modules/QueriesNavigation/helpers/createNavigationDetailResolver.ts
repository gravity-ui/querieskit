import type {
    NavigationDetailConfigFactory,
    NavigationItem,
    NavigationItemKind,
    ResolveNavigationDetail,
} from '../../../types/navigation';
import {createTableDetailConfig} from './createTableDetailConfig';

const defaultDetailRegistry: Partial<Record<NavigationItemKind, NavigationDetailConfigFactory>> = {
    table: createTableDetailConfig(),
};

export const createNavigationDetailResolver = <T extends NavigationItem = NavigationItem>(
    registry?: Partial<Record<NavigationItemKind, NavigationDetailConfigFactory<T>>>,
    fallback?: NavigationDetailConfigFactory<T>,
): ResolveNavigationDetail<T> => {
    const merged = {
        ...(defaultDetailRegistry as Partial<
            Record<NavigationItemKind, NavigationDetailConfigFactory<T>>
        >),
        ...registry,
    };

    return (item) => {
        const factory = (item.kind && merged[item.kind]) ?? fallback;
        return factory?.(item);
    };
};
