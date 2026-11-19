// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {LazyList} from '../../src/components/LazyList/LazyList';
import {ListActivityContext} from '../../src/helpers/ListActivityContext';

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

    public intersect(isIntersecting = true) {
        this.callback([{isIntersecting} as IntersectionObserverEntry], this as never);
    }
}

const ITEMS = [{id: 1}];

describe('LazyList loading indicator', () => {
    let container: HTMLDivElement;
    let root: Root;

    const renderList = (
        props: Partial<React.ComponentProps<typeof LazyList<(typeof ITEMS)[number]>>>,
        active = true,
    ) => {
        act(() => {
            root.render(
                <ListActivityContext.Provider value={active}>
                    <LazyList
                        items={ITEMS}
                        itemHeight={() => 24}
                        renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.id}</div>}
                        {...props}
                    />
                </ListActivityContext.Provider>,
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

    it('waits for visibility and suppresses duplicate requests for an empty page', () => {
        const onLoadMore = vi.fn();
        const props = {items: [], hasMore: true, loading: false, onLoadMore};
        renderList(props);
        expect(onLoadMore).not.toHaveBeenCalled();
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect(false));
        expect(onLoadMore).not.toHaveBeenCalled();
        act(() => {
            IntersectionObserverMock.instances.at(-1)?.intersect();
            IntersectionObserverMock.instances.at(-1)?.intersect();
        });
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        renderList({...props, loading: true});
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        renderList(props);
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    it('pauses empty pagination while inactive and resumes after hidden loading completes', () => {
        const onLoadMore = vi.fn();
        const props = {items: [], hasMore: true, loading: false, onLoadMore};
        renderList(props, false);
        expect(IntersectionObserverMock.instances).toHaveLength(0);
        renderList(props);
        const observer = IntersectionObserverMock.instances.at(-1);
        act(() => observer?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        renderList({...props, loading: true});
        renderList({...props, loading: true}, false);
        renderList(props, false);
        act(() => observer?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        expect(observer?.disconnect).toHaveBeenCalled();
        renderList(props);
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    it.each([{hasMore: false}, {hasMore: true}, {}])(
        'preserves the final empty state without available pagination: %j',
        (props) => {
            renderList({items: [], emptyContent: <span>No results</span>, ...props});
            expect(container.textContent).toBe('No results');
            expect(IntersectionObserverMock.instances).toHaveLength(0);
        },
    );

    it('honors logical emptiness even when auxiliary rows exist', () => {
        const onLoadMore = vi.fn();
        renderList({isEmpty: true, hasMore: true, loading: false, onLoadMore});
        expect(container.querySelector('[data-testid="item-1"]')).toBeNull();
        expect(container.querySelector('[data-testid="spin"]')).not.toBeNull();
        act(() => IntersectionObserverMock.instances.at(-1)?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
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
    it('invalidates cached sizes when existing row heights change', () => {
        renderList({itemHeight: () => 32});
        resetAfterIndex.mockClear();
        renderList({itemHeight: () => 48});
        expect(resetAfterIndex).toHaveBeenCalledWith(0, true);
        resetAfterIndex.mockClear();
        renderList({itemHeight: () => 48});
        expect(resetAfterIndex).not.toHaveBeenCalled();
    });
});
