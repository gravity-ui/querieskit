import type React from 'react';
import type {NavigationMetaConfig, NavigationMetaItem} from './navigation';

export type NavigationMetaViewConfig<TItem extends NavigationMetaItem = NavigationMetaItem> = {
    render?: (data: NavigationMetaConfig<TItem>) => React.ReactNode;
    extraContent?: React.ReactNode;
};

export type NavigationMetaProps<TItem extends NavigationMetaItem = NavigationMetaItem> = {
    data: NavigationMetaConfig<TItem>;
    view?: NavigationMetaViewConfig<TItem>;
    className?: string;
};
