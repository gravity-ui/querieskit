// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {SavedQueries, type SavedQueriesProps} from '../../src/widgets/SavedQueries';
import type {SavedQuery} from '../../src/types/savedQueries';
import type {QueryListItem, QueryListRowRenderData} from '../../src/types/queryList';

// Keep the widget, QueriesList, RowsList, LazyList and row implementations real.
// Replace virtualization (which requires browser measurements), Monaco and the
// unrelated filter popup (its date picker imports CSS outside Vitest's pipeline).
vi.mock('../../src/components/HistoryFilter', () => ({HistoryFilter: () => null}));
vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    const ReactModule = await import('react');
    return {
        ...actual,
        List: ReactModule.forwardRef(function TestList(
            {
                items,
                renderItem,
                onItemClick,
                selectedItemIndex,
            }: {
                items: QueryListItem<SavedQuery>[];
                renderItem: (
                    item: QueryListItem<SavedQuery>,
                    active: boolean,
                    index: number,
                ) => React.ReactNode;
                onItemClick: (item: QueryListItem<SavedQuery>, index: number) => void;
                selectedItemIndex?: number;
            },
            ref,
        ) {
            ReactModule.useImperativeHandle(ref, () => ({
                refContainer: {current: {resetAfterIndex: () => undefined}},
            }));
            return (
                <div data-testid="list" data-selected-index={selectedItemIndex}>
                    {items.map((item, index) => (
                        <div key={index} data-row={index} onClick={() => onItemClick(item, index)}>
                            {renderItem(item, index === selectedItemIndex, index)}
                        </div>
                    ))}
                </div>
            );
        }),
    };
});
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: ({value}: {value?: string}) => <pre data-testid="query">{value}</pre>,
    MonacoLanguage: {YQL: 'yql'},
}));

type ExtendedSavedQuery = SavedQuery & {team: string};
const HEADER = {header: 'Saved reports', height: 28};
const FIRST: ExtendedSavedQuery = {
    id: 'saved-one',
    title: 'First report',
    href: '/saved/one',
    height: 52,
    query: 'SELECT 1',
    author: 'Anna',
    engine: 'SQL',
    team: 'Analytics',
    savedAt: '2026-04-29T12:00:00.000Z',
};
const SECOND: ExtendedSavedQuery = {...FIRST, id: 2, title: 'Second report', href: '/saved/two'};

class IntersectionObserverMock {
    static current: IntersectionObserverMock | undefined;
    private callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        IntersectionObserverMock.current = this;
    }
    public observe() {}
    public disconnect() {}
    public intersect() {
        this.callback([{isIntersecting: true} as IntersectionObserverEntry], this as never);
    }
}

const routerLink = vi.fn((props: React.ComponentPropsWithoutRef<'a'>) => (
    <a {...props} data-router-link />
));

describe('SavedQueries integration', () => {
    let container: HTMLDivElement;
    let root: Root;
    const render = (props: Partial<SavedQueriesProps<ExtendedSavedQuery>> = {}) => {
        act(() =>
            root.render(
                <ThemeProvider theme="light">
                    <SavedQueries items={[HEADER, FIRST]} search={{onUpdate: vi.fn()}} {...props} />
                </ThemeProvider>,
            ),
        );
    };
    const click = (element: Element | null) => {
        expect(element).not.toBeNull();
        act(() => element?.dispatchEvent(new MouseEvent('click', {bubbles: true})));
    };
    const updateInput = (input: HTMLInputElement | null, value: string) => {
        expect(input).not.toBeNull();
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                value,
            );
            input?.dispatchEvent(new Event('input', {bubbles: true}));
        });
    };
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
        IntersectionObserverMock.current = undefined;
        routerLink.mockClear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });

    it('connects initial loading, page loading and the load callback', () => {
        const onLoadMore = vi.fn();
        render({items: [], loading: true, hasMore: true, onLoadMore});
        expect(container.querySelector('.qp-list-spinner')).not.toBeNull();
        expect(container.querySelector('[data-testid="list"]')).toBeNull();
        render({loading: false, hasMore: true, onLoadMore});
        act(() => IntersectionObserverMock.current?.intersect());
        act(() => IntersectionObserverMock.current?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        render({loading: true, hasMore: true, onLoadMore});
        expect(container.textContent).toContain(FIRST.title);
        expect(container.querySelector('.qp-lazy-list__sentinel_loading')).not.toBeNull();
        act(() => IntersectionObserverMock.current?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        render({items: [HEADER, FIRST, SECOND], loading: false, hasMore: false, onLoadMore});
        expect(container.querySelector('.qp-lazy-list__sentinel')).toBeNull();
        act(() => IntersectionObserverMock.current?.intersect());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        render({items: [], loading: false});
        expect(container.querySelector('.qp-list-spinner')).toBeNull();
        expect(container.querySelector('.qp-empty-content')).not.toBeNull();
    });

    it('preserves the list on append and resets it on replacement or variant change', () => {
        const onLoadMore = vi.fn();
        render({onLoadMore, selectedRowId: FIRST.id});
        const initialList = container.querySelector('[data-testid="list"]');
        expect(initialList?.getAttribute('data-selected-index')).toBe('1');
        render({items: [HEADER, FIRST, SECOND], onLoadMore, selectedRowId: SECOND.id});
        expect(container.querySelector('[data-testid="list"]')).toBe(initialList);
        expect(initialList?.getAttribute('data-selected-index')).toBe('2');
        render({items: [HEADER, SECOND], onLoadMore});
        const replacedList = container.querySelector('[data-testid="list"]');
        expect(replacedList).not.toBe(initialList);
        render({
            items: [HEADER, SECOND],
            onLoadMore,
            search: {value: 'SELECT', fullSearch: true, onUpdate: vi.fn()},
        });
        expect(container.querySelector('[data-testid="list"]')).not.toBe(replacedList);
    });

    it.each([false, true])('renders router links and metadata with fullSearch=%s', (fullSearch) => {
        const search = {value: 'SELECT', fullSearch, onUpdate: vi.fn()};
        const renderAuthor = vi.fn((item: ExtendedSavedQuery) => <span>{item.team}</span>);
        render({search, renderLink: routerLink, renderAuthor});
        expect(container.querySelector('a[data-router-link]')?.getAttribute('href')).toBe(
            FIRST.href,
        );
        expect(container.textContent).toContain('Analytics');
        expect(container.textContent).toContain('SQL');
        expect(container.textContent).toContain(HEADER.header);
        if (fullSearch)
            expect(container.querySelector('[data-testid="query"]')?.textContent).toContain(
                'SELECT 1',
            );
        render({
            search,
            renderLink: routerLink,
            renderAuthor,
            visibleFields: {fields: [], value: [], onChange: vi.fn()},
        });
        expect(container.textContent).not.toContain('Analytics');
        expect(container.textContent).not.toContain('SQL');
        expect(container.textContent).not.toContain('2026');
        render({search});
        expect(container.querySelector('a')?.getAttribute('href')).toBe(FIRST.href);
        routerLink.mockClear();
        render({search, items: [{...FIRST, href: undefined}], renderLink: routerLink});
        expect(container.querySelector('a')).toBeNull();
        expect(routerLink).not.toHaveBeenCalled();
    });

    it.each([false, true])(
        'disables links for editing and comparison with fullSearch=%s',
        (fullSearch) => {
            const search = {value: 'SELECT', fullSearch, onUpdate: vi.fn()};
            render({search, renderLink: routerLink, editing: {rowId: FIRST.id, onSubmit: vi.fn()}});
            expect(container.querySelector('a')).toBeNull();
            expect(routerLink).not.toHaveBeenCalled();
            const onChange = vi.fn();
            const onListItemClick = vi.fn();
            render({
                search,
                renderLink: routerLink,
                onListItemClick,
                comparison: {
                    enabled: true,
                    comparedRowIds: [],
                    onChange,
                    onCancel: vi.fn(),
                    onCompare: vi.fn(),
                },
            });
            expect(container.querySelector('a')).toBeNull();
            expect(routerLink).not.toHaveBeenCalled();
            click(container.querySelector('[data-row="1"]'));
            expect(onChange).toHaveBeenCalledWith(FIRST, true);
            expect(onListItemClick).not.toHaveBeenCalled();
        },
    );

    it('keeps title editing and row clicks working', () => {
        const onSubmit = vi.fn();
        render({renderLink: routerLink, editing: {rowId: FIRST.id, onSubmit}});
        const input = container.querySelector('.qp-saved-query-row input') as HTMLInputElement;
        updateInput(input, 'Updated report');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));
        expect(onSubmit).toHaveBeenCalledWith(FIRST, 'Updated report');
        const onListItemClick = vi.fn();
        render({renderLink: routerLink, onListItemClick});
        click(container.querySelector('[data-row="1"]'));
        expect(onListItemClick).toHaveBeenCalledTimes(1);
        expect(onListItemClick.mock.calls[0][0]).toBe(FIRST);
    });

    it.each([false, true])('passes complete custom row data with fullSearch=%s', (fullSearch) => {
        const renderRowItem = vi.fn((_data: QueryListRowRenderData<ExtendedSavedQuery>) => null);
        render({
            renderLink: routerLink,
            renderRowItem,
            selectedRowId: FIRST.id,
            search: {value: 'SELECT', fullSearch, onUpdate: vi.fn()},
        });
        expect(renderRowItem).toHaveBeenCalledWith(
            expect.objectContaining({
                item: FIRST,
                index: 1,
                isActive: true,
                variant: fullSearch ? 'search' : 'default',
                renderLink: routerLink,
            }),
        );
        expect(renderRowItem.mock.calls.find(([data]) => data.item === FIRST)?.[0].item).toBe(
            FIRST,
        );
        expect(renderRowItem).toHaveBeenCalledWith(
            expect.objectContaining({item: HEADER, index: 0}),
        );
        expect(container.querySelector('.qp-saved-query-row')).toBeNull();
        expect(container.querySelector('.qp-saved-query-search-row')).toBeNull();
        expect(routerLink).not.toHaveBeenCalled();
    });

    it('honors fullSearchAvailable and normalizes search updates', () => {
        const onUpdate = vi.fn();
        render({search: {value: 'SELECT', fullSearch: true, onUpdate}});
        expect(container.querySelector('.qp-search-with-buttons__inner-buttons')).not.toBeNull();
        render({search: {value: 'SELECT', fullSearch: true, fullSearchAvailable: false, onUpdate}});
        expect(container.querySelector('.qp-search-with-buttons__inner-buttons')).toBeNull();
        expect(container.querySelector('.qp-saved-query-row')).not.toBeNull();
        expect(container.querySelector('.qp-saved-query-search-row')).toBeNull();
        updateInput(container.querySelector('input'), 'report');
        expect(onUpdate).toHaveBeenLastCalledWith({value: 'report', fullSearch: false});
    });
});
