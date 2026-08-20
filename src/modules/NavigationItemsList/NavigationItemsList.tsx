import React from 'react';
import cn from 'bem-cn-lite';
import {NavigationItem, NavigationSortOrder, RenderNavigationItem} from '../../types/navigation';
import {LazyList} from '../../components';
import {NavigationItemRow} from './internal/NavigationItemRow';
import {NavigationItemsListHeader} from './internal/NavigationItemsListHeader';
import {NavigationItemsListEmptyState} from './internal/NavigationItemsListEmptyState';
import {useParentRow} from './internal/useParentRow';
import {NAVIGATION_ROW_HEIGHT} from '../../constants/row';
import './NavigationItemsList.scss';

const block = cn('qp-navigation-items-list');

export type NavigationItemsListProps<T extends NavigationItem = NavigationItem> = {
    items: T[];
    path?: string;
    search?: string;
    sort?: NavigationSortOrder;
    onSortUpdate?: (sort: NavigationSortOrder) => void;
    titleLabel: string;
    loading?: boolean;
    error?: React.ReactNode;
    hasMore?: boolean;
    onLoadMore?: () => void;
    emptyContent?: React.ReactNode;
    renderRowItem?: RenderNavigationItem<T>;
    onItemClick?: (item: T) => void;
    className?: string;
};

export const NavigationItemsList = <T extends NavigationItem = NavigationItem>({
    items,
    path,
    search,
    sort,
    onSortUpdate,
    titleLabel,
    loading,
    error,
    hasMore,
    onLoadMore,
    emptyContent,
    renderRowItem,
    onItemClick,
    className,
}: NavigationItemsListProps<T>) => {
    const parentRow = useParentRow(path, search);

    const rows = (parentRow ? [parentRow as T, ...items] : items) as T[];

    return (
        <div className={block(null, className)}>
            <NavigationItemsListHeader
                titleLabel={titleLabel}
                sort={sort}
                onSortUpdate={onSortUpdate}
                className={block('header')}
            />
            <LazyList<T>
                className={block('list')}
                items={rows}
                isEmpty={!items.length}
                itemHeight={() => NAVIGATION_ROW_HEIGHT}
                renderItem={(item, isActive, index) => {
                    const isParentRow = Boolean(parentRow) && item === (parentRow as T);

                    return (
                        renderRowItem?.({item, index, isActive, isParentRow}) ?? (
                            <NavigationItemRow item={item} />
                        )
                    );
                }}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
                loading={loading}
                error={error}
                emptyContent={
                    <NavigationItemsListEmptyState
                        parentRow={parentRow as T | undefined}
                        emptyContent={emptyContent}
                        renderRowItem={renderRowItem}
                        onItemClick={onItemClick}
                    />
                }
                onItemClick={(item) => {
                    if (!item.disabled) {
                        onItemClick?.(item);
                    }
                }}
            />
        </div>
    );
};
