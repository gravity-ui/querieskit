import {useCallback, useEffect, useRef} from 'react';

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
