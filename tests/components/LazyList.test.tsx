// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {LazyList} from '../../src/components/LazyList/LazyList';

const {resetAfterIndex} = vi.hoisted(() => ({resetAfterIndex: vi.fn()}));

vi.mock('@gravity-ui/uikit', async () => {
    const ReactModule = await import('react');

    return {
        Flex: ({children, width}: React.HTMLAttributes<HTMLDivElement> & {width?: string}) => (
            <div data-width={width}>{children}</div>
        ),
        Loader: () => <div data-testid="loader" />,
        Spin: () => <div data-testid="spin" />,
        List: ReactModule.forwardRef(
            (
                {
                    items,
                    itemHeight,
                    renderItem,
                    onItemClick,
                }: {
                    items: object[];
                    itemHeight: (item: object) => number;
                    renderItem: (item: object, active: boolean, index: number) => React.ReactNode;
                    onItemClick: (item: object, index: number) => void;
                },
                ref,
            ) => {
                ReactModule.useImperativeHandle(ref, () => ({
                    refContainer: {current: {resetAfterIndex}},
                }));

                return (
                    <div data-testid="list">
                        {items.map((item, index) => (
                            <div
                                data-row-height={itemHeight(item)}
                                key={index}
                                onClick={() => onItemClick(item, index)}
                            >
                                {renderItem(item, false, index)}
                            </div>
                        ))}
                    </div>
                );
            },
        ),
    };
});

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

class IntersectionObserverMock {
    static instances: IntersectionObserverMock[] = [];

    readonly callback: ObserverCallback;
    disconnect = vi.fn();
    observe = vi.fn();
    root = null;
    rootMargin = '';
    takeRecords = vi.fn(() => []);
    thresholds = [];
    unobserve = vi.fn();

    constructor(callback: ObserverCallback) {
        this.callback = callback;
        IntersectionObserverMock.instances.push(this);
    }

    public intersect() {
        this.callback([{isIntersecting: true} as IntersectionObserverEntry], this as never);
    }
}

const ITEMS = [{id: 1}];

describe('LazyList loading indicator', () => {
    let container: HTMLDivElement;
    let root: Root;

    const renderList = (
        props: Partial<React.ComponentProps<typeof LazyList<(typeof ITEMS)[number]>>>,
    ) => {
        act(() => {
            root.render(
                <LazyList
                    items={ITEMS}
                    itemHeight={() => 24}
                    renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.id}</div>}
                    {...props}
                />,
            );
        });
    };

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
        IntersectionObserverMock.instances = [];
        resetAfterIndex.mockClear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });

    it('keeps the initial empty-state spinner', () => {
        renderList({items: [], loading: true});

        expect(container.querySelector('[data-testid="spin"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="list"]')).toBeNull();
    });

    it('shows a 40px loader row after existing items while loading', () => {
        renderList({hasMore: true, loading: true});

        expect(container.querySelector('[data-testid="item-1"]')).not.toBeNull();
        const loader = container.querySelector('[data-testid="loader"]');
        expect(loader).not.toBeNull();
        expect(loader?.parentElement?.getAttribute('data-width')).toBe('100%');
        expect(loader?.closest('[data-row-height]')?.getAttribute('data-row-height')).toBe('40');
    });

    it('switches the loader row back to a 1px sentinel and then removes it', () => {
        renderList({hasMore: true, loading: true});
        renderList({hasMore: true, loading: false});

        expect(container.querySelector('[data-testid="loader"]')).toBeNull();
        expect(container.querySelector('.qp-lazy-list__sentinel')).not.toBeNull();
        expect(
            container
                .querySelector('.qp-lazy-list__sentinel')
                ?.closest('[data-row-height]')
                ?.getAttribute('data-row-height'),
        ).toBe('1');
        expect(resetAfterIndex).toHaveBeenCalledWith(1, true);

        renderList({hasMore: false, loading: false});
        expect(container.querySelector('.qp-lazy-list__sentinel')).toBeNull();
    });

    it('does not call onLoadMore again while a request is in progress', () => {
        const onLoadMore = vi.fn();
        renderList({hasMore: true, loading: false, onLoadMore});

        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);

        renderList({hasMore: true, loading: true, onLoadMore});
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('does not call onLoadMore when there are no more pages', () => {
        const onLoadMore = vi.fn();
        renderList({hasMore: false, loading: false, onLoadMore});

        expect(IntersectionObserverMock.instances).toHaveLength(0);
        expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('allows another load after items are appended and loading finishes', () => {
        const onLoadMore = vi.fn();
        renderList({hasMore: true, loading: false, onLoadMore});
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());

        renderList({hasMore: true, loading: true, onLoadMore});
        renderList({
            items: [...ITEMS, {id: 2}],
            hasMore: true,
            loading: true,
            onLoadMore,
        });
        renderList({
            items: [...ITEMS, {id: 2}],
            hasMore: true,
            loading: false,
            onLoadMore,
        });
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());

        expect(onLoadMore).toHaveBeenCalledTimes(2);
    });
});
