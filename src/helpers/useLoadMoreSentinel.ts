import {useCallback, useEffect, useRef} from 'react';

/**
 * Observes a sentinel DOM node and calls `onLoadMore` once it becomes visible,
 * as long as `hasMore` is true. Returns a ref callback to attach to the sentinel node.
 */
export function useLoadMoreSentinel(hasMore: boolean | undefined, onLoadMore?: () => void) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const hasMoreRef = useRef(hasMore);
    hasMoreRef.current = hasMore;
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;

    useEffect(() => {
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    return useCallback((node: HTMLElement | null) => {
        observerRef.current?.disconnect();

        if (!node) {
            return;
        }

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting) && hasMoreRef.current) {
                onLoadMoreRef.current?.();
            }
        });

        observerRef.current.observe(node);
    }, []);
}
