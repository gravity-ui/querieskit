import cn from 'bem-cn-lite';
import React from 'react';
import {LazyList} from '../../components/LazyList';
import {NavigationItemRow} from '../../components/NavigationItemRow';
import {NAVIGATION_DESCRIPTION_ROW_HEIGHT, NAVIGATION_ROW_HEIGHT} from '../../constants/row';
import type {NavigationItem} from '../../types/navigation';
import type {NavigationItemsListProps} from '../../types/navigationItemsListProps';
import {NavigationItemsListEmptyState} from './internal/NavigationItemsListEmptyState';
import {NavigationItemsListHeader} from './internal/NavigationItemsListHeader';
import {useParentRow} from './internal/useParentRow';
import './NavigationItemsList.scss';
export type {NavigationItemsListProps} from '../../types/navigationItemsListProps';

const block = cn('qp-navigation-items-list');

export const NavigationItemsList = <T extends NavigationItem = NavigationItem>({
    items,
    path,
    search,
    parentRow: parentRowConfig,
    sort,
    onSortUpdate,
    titleLabel,
    loading,
    error,
    hasMore,
    onLoadMore,
    emptyContent,
    renderRowItem,
    getItemRowConfig,
    onItemClick,
    className,
}: NavigationItemsListProps<T>) => {
    const parentRow = useParentRow(path, search, parentRowConfig?.showDuringSearch);

    // UIKit List can retain old item references when a replacement array is deeply equal.
    const rowConfigs = new Map(
        items.map((item) => [item.path, {item, config: getItemRowConfig?.(item)}]),
    );
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
                itemHeight={(item) =>
                    item !== parentRow && rowConfigs.get(item.path)?.config?.description
                        ? NAVIGATION_DESCRIPTION_ROW_HEIGHT
                        : NAVIGATION_ROW_HEIGHT
                }
                renderItem={(item, isActive, index) => {
                    const isParentRow = Boolean(parentRow) && item === (parentRow as T);

                    const current = isParentRow ? undefined : rowConfigs.get(item.path);

                    return (
                        renderRowItem?.({item, index, isActive, isParentRow}) ?? (
                            <NavigationItemRow item={current?.item ?? item} {...current?.config} />
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
