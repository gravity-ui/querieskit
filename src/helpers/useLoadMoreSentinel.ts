import {useCallback, useEffect, useRef} from 'react';

export function useLoadMoreSentinel(
    hasMore: boolean | undefined,
    onLoadMore?: () => void,
    loading?: boolean,
    itemsCount?: number,
) {
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
    }, [loading, itemsCount]);

    return useCallback(
        (node: HTMLElement | null) => {
            observerRef.current?.disconnect();

            if (!node) {
                return;
            }

            observerRef.current = new IntersectionObserver((entries) => {
                if (
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
        [loading, preventRepeatedLoad],
    );
}
