import {Flex, List, Loader} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useLoadMoreSentinel} from '../../helpers/useLoadMoreSentinel';
import type {LazyListProps} from '../../types/lazyListProps';
import {ListSpinner} from '../ListSpinner';
import './LazyList.scss';
export type {LazyListProps} from '../../types/lazyListProps';

const block = cn('qp-lazy-list');

const SENTINEL_ROW_HEIGHT = 1;
const LOADING_ROW_HEIGHT = 40;

type SentinelRow = {__sentinel: true};
type LazyListRow<T> = T | SentinelRow;

const isSentinelRow = <T,>(row: LazyListRow<T>): row is SentinelRow =>
    Boolean(row) && typeof row === 'object' && '__sentinel' in (row as object);

export const LazyList = <T extends object>({
    items,
    itemHeight,
    renderItem,
    hasMore,
    onLoadMore,
    onItemClick,
    selectedItemIndex,
    filterable = false,
    loading,
    error,
    emptyContent,
    isEmpty,
    className,
}: LazyListProps<T>) => {
    const listRef = useRef<List<LazyListRow<T>>>(null);
    const sentinelRef = useLoadMoreSentinel(hasMore, onLoadMore, loading, items.length);

    const rows: LazyListRow<T>[] = useMemo(
        () => (hasMore || loading ? [...items, {__sentinel: true}] : items),
        [items, hasMore, loading],
    );

    const getRowHeight = (row: LazyListRow<T>) => {
        if (isSentinelRow(row)) {
            return loading ? LOADING_ROW_HEIGHT : SENTINEL_ROW_HEIGHT;
        }

        return itemHeight(row);
    };

    const rowHeights = rows.map(getRowHeight);
    const previousListStateRef = useRef({rowHeights, loading, hasMore});

    useLayoutEffect(() => {
        const previous = previousListStateRef.current;
        const firstChangedIndex = rowHeights.findIndex(
            (height, index) => height !== previous.rowHeights[index],
        );
        const sizesChanged =
            firstChangedIndex !== -1 || rowHeights.length !== previous.rowHeights.length;

        if (sizesChanged || previous.loading !== loading || previous.hasMore !== hasMore) {
            listRef.current?.refContainer.current?.resetAfterIndex(
                firstChangedIndex === -1
                    ? Math.min(previous.rowHeights.length, rowHeights.length)
                    : firstChangedIndex,
                true,
            );
        }
        previousListStateRef.current = {rowHeights, loading, hasMore};
    });

    if (error) {
        return <React.Fragment>{error}</React.Fragment>;
    }

    const empty = isEmpty ?? !items.length;

    if (loading && empty) {
        return <ListSpinner className={block('spinner', className)} />;
    }

    if (empty) {
        return <React.Fragment>{emptyContent}</React.Fragment>;
    }

    return (
        <List<LazyListRow<T>>
            ref={listRef}
            className={block(null, className)}
            itemClassName={block('item')}
            filterable={filterable}
            items={rows}
            itemHeight={getRowHeight}
            itemsHeight={(listRows) =>
                listRows.reduce((total, row) => total + getRowHeight(row), 0)
            }
            renderItem={(row, isActive, index) =>
                isSentinelRow(row) ? (
                    <div
                        ref={sentinelRef}
                        className={block('sentinel', {loading: Boolean(loading)})}
                    >
                        {loading && (
                            <Flex
                                alignItems="center"
                                justifyContent="center"
                                width="100%"
                                height="100%"
                            >
                                <Loader />
                            </Flex>
                        )}
                    </div>
                ) : (
                    renderItem(row, isActive, index)
                )
            }
            selectedItemIndex={selectedItemIndex as never}
            onItemClick={(row, index) => {
                if (!isSentinelRow(row)) {
                    onItemClick?.(row, index);
                }
            }}
        />
    );
};
