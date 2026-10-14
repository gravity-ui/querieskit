// @vitest-environment jsdom
import React, {act, useEffect, useState} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Tab, TabList, ThemeProvider, configure} from '@gravity-ui/uikit';
import {QueriesSidebar} from '../../src/widgets/QueriesSidebar';
import type {QueriesSidebarProps, QueriesSidebarTab} from '../../src/types/queriesSidebar';
import {useLoadMoreSentinel} from '../../src/helpers/useLoadMoreSentinel';

vi.mock('../../src/modules/QueriesHistory', () => ({QueriesHistory: ListContent}));
vi.mock('../../src/modules/SavedQueries', () => ({SavedQueries: ListContent}));
vi.mock('../../src/modules/TutorialsHistory', () => ({TutorialsHistory: ListContent}));
vi.mock('../../src/modules/QueriesNavigation', () => ({
    QueriesNavigation: ({listState}: {listState: {onLoadMore?: () => void}}) => (
        <ListContent {...listState} />
    ),
}));

function ListContent({onLoadMore}: {onLoadMore?: () => void}) {
    const ref = useLoadMoreSentinel(true, onLoadMore, false, 1);
    return (
        <div ref={ref}>
            <Counter />
        </div>
    );
}
const lifecycle = {mount: vi.fn(), cleanup: vi.fn()};
function Counter() {
    useEffect(() => {
        lifecycle.mount();
        return () => {
            lifecycle.cleanup();
        };
    }, []);
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
}
const custom = (id: string): QueriesSidebarTab => ({
    id,
    type: 'custom',
    title: id,
    icon: <span>*</span>,
    renderContent: ({active}) => (
        <div data-active={String(active)}>
            <Counter />
        </div>
    ),
});

describe('QueriesSidebar', () => {
    let container: HTMLDivElement;
    let root: Root;
    const changes = vi.fn();
    const observers: {
        callback: IntersectionObserverCallback;
        disconnect: ReturnType<typeof vi.fn>;
    }[] = [];
    function render(props: Partial<QueriesSidebarProps> = {}) {
        act(() =>
            root.render(
                <React.StrictMode>
                    <ThemeProvider>
                        <QueriesSidebar
                            tabs={[custom('a'), custom('b')]}
                            onActiveTabChange={changes}
                            {...props}
                        />
                    </ThemeProvider>
                </React.StrictMode>,
            ),
        );
    }
    const tab = (name: string) =>
        container.querySelector<HTMLButtonElement>(`[role="tab"][aria-label="${name}"]`)!;
    const panel = () =>
        container.querySelector<HTMLElement>(
            '[role="tabpanel"]:not([hidden]), [role="region"]:not([hidden])',
        )!;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        changes.mockClear();
        lifecycle.mount.mockClear();
        lifecycle.cleanup.mockClear();
        observers.length = 0;
        vi.stubGlobal(
            'IntersectionObserver',
            class {
                disconnect = vi.fn();
                observe = vi.fn();
                constructor(callback: IntersectionObserverCallback) {
                    observers.push({callback, disconnect: this.disconnect});
                }
            },
        );
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('selects defaults, switches by keyboard and falls back when a tab is disabled or removed', () => {
        render({defaultActiveTab: 'b'});
        expect(tab('b').getAttribute('aria-selected')).toBe('true');
        expect(changes).not.toHaveBeenCalled();
        act(() =>
            tab('a').dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})),
        );
        expect(changes.mock.calls).toEqual([['a']]);
        render({tabs: [{...custom('a'), disabled: true}, custom('b')]});
        expect(tab('b').getAttribute('aria-selected')).toBe('true');
        expect(changes.mock.calls).toEqual([['a'], ['b']]);
        act(() => tab('a').click());
        expect(changes).toHaveBeenCalledTimes(2);
        render({tabs: [custom('c')]});
        expect(changes).toHaveBeenLastCalledWith('c');
        render({tabs: []});
        expect(panel()).toBeNull();
        render({tabs: [{...custom('c'), disabled: true}]});
        expect(panel()).toBeNull();
    });

    it('uses external selection without echoing prop changes and leaves controlled selection to the caller', () => {
        render({activeTab: 'b'});
        act(() => tab('a').click());
        expect(changes.mock.calls).toEqual([['a']]);
        expect(tab('b').getAttribute('aria-selected')).toBe('true');
        render({activeTab: 'a'});
        render({activeTab: 'missing'});
        expect(tab('a').getAttribute('aria-selected')).toBe('true');
        expect(changes).toHaveBeenCalledTimes(1);
    });

    it('renders icons, supports arrow navigation and isolates nested tab selection', () => {
        render();
        expect(tab('a').querySelector('[aria-hidden="true"]')?.textContent).toBe('*');
        act(() => tab('a').focus());
        act(() =>
            tab('a').dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'ArrowRight',
                    code: 'ArrowRight',
                    bubbles: true,
                }),
            ),
        );
        expect(document.activeElement).toBe(tab('b'));
        act(() => tab('b').dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true})));
        expect(changes).toHaveBeenLastCalledWith('b');

        const nestedChange = vi.fn();
        render({
            activeTab: 'nested',
            tabs: [
                {
                    ...custom('nested'),
                    type: 'custom',
                    renderContent: () => (
                        <TabList value="inner-a" onUpdate={nestedChange}>
                            <Tab value="inner-a">Inner A</Tab>
                            <Tab value="inner-b">Inner B</Tab>
                        </TabList>
                    ),
                },
            ],
        });
        const innerTabs = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        act(() => innerTabs.find((item) => item.textContent === 'Inner B')!.click());
        expect(nestedChange).toHaveBeenCalledWith('inner-b');
        expect(changes).toHaveBeenCalledTimes(1);
    });

    it('retains state, scroll and DOM when hiding tabs or switching externally, with valid ARIA associations', () => {
        render({keepMounted: true, activeTab: 'a', header: <div>Product</div>});
        const first = panel();
        expect(tab('a').getAttribute('aria-controls')).toBe(first.id);
        expect(first.getAttribute('aria-labelledby')).toBe(tab('a').id);
        expect(container.querySelectorAll('button:not([role="tab"])')).toHaveLength(1);
        first.scrollTop = 120;
        act(() => first.querySelector('button')!.click());
        render({keepMounted: true, activeTab: 'a', hideTabs: true, header: <div>Product</div>});
        expect(panel()).toBe(first);
        expect(panel().getAttribute('role')).toBe('region');
        expect(panel().getAttribute('aria-label')).toBe('a');
        expect(panel().hasAttribute('aria-labelledby')).toBe(false);
        expect(container.querySelector('[role="tablist"]')).toBeNull();
        expect(container.textContent).toContain('Product');
        render({keepMounted: true, activeTab: 'b', hideTabs: true});
        expect(first.hidden).toBe(true);
        expect(first.querySelector('[data-active]')!.getAttribute('data-active')).toBe('false');
        render({keepMounted: true, activeTab: 'a'});
        expect(panel()).toBe(first);
        expect(panel().textContent).toContain('Count 1');
        expect(panel().scrollTop).toBe(120);
        expect(changes).not.toHaveBeenCalled();
        render({keepMounted: true, activeTab: 'b', tabs: [custom('b')]});
        render({keepMounted: true, activeTab: 'a'});
        expect(panel()).not.toBe(first);
        expect(panel().textContent).toContain('Count 0');
    });

    it.each([undefined, false])(
        'unmounts inactive custom content with keepMounted=%s',
        (keepMounted) => {
            const renderA = vi.fn(() => <Counter />);
            const renderB = vi.fn(() => <Counter />);
            const tabs: QueriesSidebarTab[] = [
                {...custom('a'), type: 'custom', renderContent: renderA},
                {...custom('b'), type: 'custom', renderContent: renderB},
            ];
            render({tabs, keepMounted});
            expect(renderB).not.toHaveBeenCalled();
            expect(lifecycle.mount.mock.calls.length - lifecycle.cleanup.mock.calls.length).toBe(1);
            act(() => panel().querySelector('button')!.click());
            const cleanups = lifecycle.cleanup.mock.calls.length;
            act(() => tab('b').click());
            expect(lifecycle.cleanup.mock.calls.length).toBeGreaterThan(cleanups);
            expect(container.querySelector('[role="tabpanel"][hidden]')!.textContent).toBe('');
            expect(lifecycle.mount.mock.calls.length - lifecycle.cleanup.mock.calls.length).toBe(1);
            act(() => tab('a').click());
            expect(panel().textContent).toBe('Count 0');
        },
    );

    it.each(['history', 'saved', 'tutorials', 'navigation'] as const)(
        'unmounts %s on external selection and remounts with fresh state',
        (type) => {
            const section: QueriesSidebarTab =
                type === 'navigation'
                    ? {
                          id: 'list',
                          type,
                          props: {
                              location: {cluster: undefined, path: undefined},
                              onUpdate: vi.fn(),
                              listState: {},
                          },
                      }
                    : {id: 'list', type, props: {items: [], search: {onUpdate: vi.fn()}}};
            const tabs = [section, custom('other')];
            render({tabs, activeTab: 'other', keepMounted: false});
            expect(observers).toHaveLength(0);
            render({tabs, activeTab: 'list', keepMounted: false});
            const first = panel();
            expect(
                container
                    .querySelector('[role="tab"][aria-selected="true"]')!
                    .getAttribute('aria-controls'),
            ).toBe(first.id);
            act(() => first.querySelector('button')!.click());
            const cleanupCount = lifecycle.cleanup.mock.calls.length;
            render({tabs, activeTab: 'other', keepMounted: false});
            expect(first.textContent).toBe('');
            expect(lifecycle.cleanup.mock.calls.length).toBeGreaterThan(cleanupCount);
            expect(lifecycle.mount.mock.calls.length - lifecycle.cleanup.mock.calls.length).toBe(1);
            render({tabs, activeTab: 'list', keepMounted: false});
            expect(panel().textContent).toBe('Count 0');
            expect(changes).not.toHaveBeenCalled();
        },
    );

    it('cleans up removed active content and uses the selection fallback', () => {
        render();
        const first = panel();
        const cleanups = lifecycle.cleanup.mock.calls.length;
        render({tabs: [custom('b')]});
        expect(first.isConnected).toBe(false);
        expect(lifecycle.cleanup.mock.calls.length).toBeGreaterThan(cleanups);
        expect(lifecycle.mount.mock.calls.length - lifecycle.cleanup.mock.calls.length).toBe(1);
        expect(changes).toHaveBeenLastCalledWith('b');
        render({tabs: [{...custom('b'), disabled: true}]});
        expect(panel()).toBeNull();
        expect(lifecycle.mount.mock.calls.length).toBe(lifecycle.cleanup.mock.calls.length);
    });

    it('updates retention without remounting active content or resurrecting discarded tabs', () => {
        render({keepMounted: true, activeTab: 'a'});
        act(() => panel().querySelector('button')!.click());
        render({keepMounted: true, activeTab: 'b'});
        expect(lifecycle.mount.mock.calls.length - lifecycle.cleanup.mock.calls.length).toBe(2);
        const activeContent = panel().querySelector('button');
        const mounts = lifecycle.mount.mock.calls.length;
        const cleanups = lifecycle.cleanup.mock.calls.length;
        render({keepMounted: false, activeTab: 'b'});
        expect(lifecycle.cleanup).toHaveBeenCalledTimes(cleanups + 1);
        render({keepMounted: true, activeTab: 'b'});
        expect(lifecycle.mount).toHaveBeenCalledTimes(mounts);
        expect(panel().querySelector('button')).toBe(activeContent);
        expect(container.querySelector('[role="tabpanel"][hidden]')!.textContent).toBe('');
        render({keepMounted: true, activeTab: 'a'});
        expect(panel().textContent).toBe('Count 0');
        expect(lifecycle.mount.mock.calls.length - lifecycle.cleanup.mock.calls.length).toBe(2);
    });

    it('only changes navigation and ARIA when toggling hideTabs', () => {
        render();
        const first = panel();
        const button = first.querySelector('button')!;
        act(() => button.click());
        const mounts = lifecycle.mount.mock.calls.length;
        const cleanups = lifecycle.cleanup.mock.calls.length;
        render({hideTabs: true});
        expect(panel()).toBe(first);
        expect(panel().getAttribute('role')).toBe('region');
        expect(panel().hasAttribute('aria-labelledby')).toBe(false);
        render({hideTabs: false});
        expect(panel().querySelector('button')).toBe(button);
        expect(panel().textContent).toBe('Count 1');
        expect(panel().getAttribute('aria-labelledby')).toBe(tab('a').id);
        expect(lifecycle.mount).toHaveBeenCalledTimes(mounts);
        expect(lifecycle.cleanup).toHaveBeenCalledTimes(cleanups);
    });

    it('supports hidden tabs in uncontrolled mode and filters invalid IDs', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        render({
            hideTabs: true,
            defaultActiveTab: 'b',
            tabs: [custom(''), custom('a'), custom('a'), custom('b')],
        });
        expect(panel().getAttribute('aria-label')).toBe('b');
        expect(container.querySelectorAll('[role="region"]')).toHaveLength(2);
        expect(warn).toHaveBeenCalled();
    });

    it.each(['history', 'saved', 'tutorials', 'navigation'] as const)(
        'pauses %s pagination, including queued observer callbacks, then resumes on return',
        (type) => {
            const load = vi.fn();
            const section: QueriesSidebarTab =
                type === 'navigation'
                    ? {
                          id: 'list',
                          type,
                          props: {
                              location: {cluster: undefined, path: undefined},
                              onUpdate: vi.fn(),
                              listState: {hasMore: true, onLoadMore: load},
                          },
                      }
                    : {
                          id: 'list',
                          type,
                          props: {
                              items: [],
                              search: {onUpdate: vi.fn()},
                              hasMore: true,
                              onLoadMore: load,
                          },
                      };
            const tabs = [section, custom('other')];
            const intersect = (index: number) =>
                act(() =>
                    observers[index].callback(
                        [{isIntersecting: true}] as IntersectionObserverEntry[],
                        {} as IntersectionObserver,
                    ),
                );
            render({keepMounted: true, tabs, activeTab: 'list'});
            const beforeHide = observers.length - 1;
            intersect(beforeHide);
            expect(load).toHaveBeenCalledTimes(1);
            const first = panel();
            act(() => first.querySelector('button')!.click());
            render({keepMounted: true, tabs, activeTab: 'other'});
            expect(observers[beforeHide].disconnect).toHaveBeenCalled();
            intersect(beforeHide);
            expect(load).toHaveBeenCalledTimes(1);
            render({keepMounted: true, tabs, activeTab: 'list'});
            expect(panel()).toBe(first);
            expect(panel().textContent).toContain('Count 1');
            intersect(observers.length - 1);
            expect(load).toHaveBeenCalledTimes(2);
        },
    );
});
