import {useCallback, useContext, useEffect, useRef} from 'react';
import {ListActivityContext} from './ListActivityContext';

export function useLoadMoreSentinel(
    hasMore: boolean | undefined,
    onLoadMore?: () => void,
    loading?: boolean,
    itemsCount?: number,
) {
    const active = useContext(ListActivityContext);
    const activeRef = useRef(active);
    activeRef.current = active;
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadRequestedRef = useRef(false);
    const hasMoreRef = useRef(hasMore);
    hasMoreRef.current = hasMore;
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;
    const preventRepeatedLoad = loading !== undefined;

    useEffect(() => {
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!loading) {
            // Cached pages can add items without changing the loading state.
            loadRequestedRef.current = false;
        }
    }, [loading, itemsCount, active]);

    return useCallback(
        (node: HTMLElement | null) => {
            observerRef.current?.disconnect();

            if (!node || !active) {
                return;
            }

            observerRef.current = new IntersectionObserver((entries) => {
                if (
                    activeRef.current &&
                    entries.some((entry) => entry.isIntersecting) &&
                    hasMoreRef.current &&
                    !loading &&
                    (!preventRepeatedLoad || !loadRequestedRef.current) &&
                    onLoadMoreRef.current
                ) {
                    loadRequestedRef.current = preventRepeatedLoad;
                    onLoadMoreRef.current?.();
                }
            });

            observerRef.current.observe(node);
        },
        [loading, preventRepeatedLoad, active],
    );
}
