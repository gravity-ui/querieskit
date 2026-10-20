import type {NavigationItem, NavigationItemRowConfig} from './navigation';

export type NavigationItemRowProps<T extends NavigationItem = NavigationItem> =
    NavigationItemRowConfig<T> & {
        item: T;
        className?: string;
    };
