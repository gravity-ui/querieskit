import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {Flex, List, Loader} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {useLoadMoreSentinel} from '../../helpers/useLoadMoreSentinel';
import {ListSpinner} from '../ListSpinner';
import './LazyList.scss';

const block = cn('qp-lazy-list');

const SENTINEL_ROW_HEIGHT = 1;
const LOADING_ROW_HEIGHT = 40;

type SentinelRow = {__sentinel: true};
type LazyListRow<T> = T | SentinelRow;

const isSentinelRow = <T,>(row: LazyListRow<T>): row is SentinelRow =>
    Boolean(row) && typeof row === 'object' && '__sentinel' in (row as object);

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
    const previousListStateRef = useRef({itemsLength: items.length, loading, hasMore});
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

    useLayoutEffect(() => {
        const previousListState = previousListStateRef.current;
        const listStateChanged =
            previousListState.itemsLength !== items.length ||
            previousListState.loading !== loading ||
            previousListState.hasMore !== hasMore;

        if (listStateChanged) {
            listRef.current?.refContainer.current?.resetAfterIndex(
                Math.min(previousListState.itemsLength, items.length),
                true,
            );
            previousListStateRef.current = {itemsLength: items.length, loading, hasMore};
        }
    }, [hasMore, items.length, loading]);

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
