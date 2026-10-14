import type React from 'react';

export type LazyListProps<T extends object> = {
    items: T[];
    itemHeight: (item: T) => number;
    renderItem: (item: T, isActive: boolean, index: number) => React.ReactNode;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onItemClick?: (item: T, index: number) => void;
    selectedItemIndex?: T[keyof T] | number;
    filterable?: boolean;
    loading?: boolean;
    error?: React.ReactNode;
    emptyContent?: React.ReactNode;
    isEmpty?: boolean;
    className?: string;
};
