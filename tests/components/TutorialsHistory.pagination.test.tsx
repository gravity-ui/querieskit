// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {TutorialsHistory} from '../../src/modules/TutorialsHistory';
import type {TutorialHistoryRow} from '../../src/types/tutorial';
import type {TutorialsHistoryProps} from '../../src/types/tutorialsHistory';

// Exercise the complete pagination chain, replacing only virtualization and
// unrelated controls that need browser measurements or external CSS handling.
vi.mock('../../src/components/HistoryFilter', () => ({HistoryFilter: () => null}));
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: () => null,
    MonacoLanguage: {YQL: 'yql'},
}));
vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    const ReactModule = await import('react');
    return {
        ...actual,
        List: ReactModule.forwardRef(function TestList(
            {
                items,
                renderItem,
            }: {
                items: object[];
                renderItem: (item: object, active: boolean, index: number) => React.ReactNode;
            },
            ref,
        ) {
            ReactModule.useImperativeHandle(ref, () => ({
                refContainer: {current: {resetAfterIndex: () => undefined}},
            }));
            return (
                <div data-testid="list">
                    {items.map((item, index) => (
                        <div key={index}>{renderItem(item, false, index)}</div>
                    ))}
                </div>
            );
        }),
    };
});

class IntersectionObserverMock {
    static current: IntersectionObserverMock | undefined;
    observe = vi.fn();
    disconnect = vi.fn();
    private callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        IntersectionObserverMock.current = this;
    }
    public intersect() {
        this.callback([{isIntersecting: true} as IntersectionObserverEntry], this as never);
    }
}

const EMPTY_ITEMS: TutorialHistoryRow[] = [];
const MATCH: TutorialHistoryRow = {id: 'match', title: 'Matching tutorial', height: 28};

describe.each(['search', 'engine'] as const)('TutorialsHistory %s filtered pagination', (mode) => {
    let container: HTMLDivElement;
    let root: Root;
    let onLoadMore: ReturnType<typeof vi.fn>;

    const render = (props: Partial<TutorialsHistoryProps> = {}) => {
        act(() => {
            root.render(
                <ThemeProvider>
                    <TutorialsHistory
                        items={EMPTY_ITEMS}
                        search={{value: mode === 'search' ? 'Matching' : '', onUpdate: vi.fn()}}
                        engineFilter={
                            mode === 'engine'
                                ? {
                                      engines: [{id: 'yql', title: 'YQL'}],
                                      value: 'yql',
                                      onUpdate: vi.fn(),
                                  }
                                : undefined
                        }
                        hasMore
                        loading={false}
                        onLoadMore={onLoadMore}
                        renderRowItem={({item}) => <span>{'title' in item ? item.title : ''}</span>}
                        {...props}
                    />
                </ThemeProvider>,
            );
        });
    };
    const intersect = () => {
        expect(IntersectionObserverMock.current).toBeDefined();
        act(() => IntersectionObserverMock.current?.intersect());
    };
    const expectPending = () => {
        expect(container.querySelector('.qp-list-spinner')).not.toBeNull();
        expect(container.querySelector('.qp-empty-content')).toBeNull();
    };

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
        IntersectionObserverMock.current = undefined;
        onLoadMore = vi.fn();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });

    it('loads successive pages without matches and resumes normal pagination after a match', () => {
        render();
        expectPending();
        expect(onLoadMore).not.toHaveBeenCalled();

        for (let page = 1; page <= 3; page++) {
            intersect();
            intersect();
            expect(onLoadMore).toHaveBeenCalledTimes(page);
            render({loading: true});
            expectPending();
            intersect();
            expect(onLoadMore).toHaveBeenCalledTimes(page);
            // The same empty array survives two completed requests.
            render({items: page === 3 ? [MATCH] : EMPTY_ITEMS});
        }

        expect(container.textContent).toContain(MATCH.title);
        expect(container.querySelector('[data-testid="list"]')).not.toBeNull();
        expect(container.querySelector('.qp-list-spinner')).toBeNull();
        intersect();
        expect(onLoadMore).toHaveBeenCalledTimes(4);
        render({items: [MATCH], loading: true});
        intersect();
        expect(onLoadMore).toHaveBeenCalledTimes(4);
        render({items: [MATCH], hasMore: false});
        intersect();
        expect(onLoadMore).toHaveBeenCalledTimes(4);
        expect(container.querySelector('.qp-lazy-list__sentinel')).toBeNull();
    });

    it('shows the final empty state only after exhausting pages without matches', () => {
        render();
        for (let page = 1; page <= 3; page++) {
            expectPending();
            intersect();
            expect(onLoadMore).toHaveBeenCalledTimes(page);
            render({loading: true});
            intersect();
            expect(onLoadMore).toHaveBeenCalledTimes(page);
            render({hasMore: page < 3});
        }
        expect(container.querySelector('.qp-empty-content')).not.toBeNull();
        expect(container.textContent).toContain('Nothing found');
        expect(container.querySelector('.qp-list-spinner')).toBeNull();
        intersect();
        expect(onLoadMore).toHaveBeenCalledTimes(3);
    });
});
