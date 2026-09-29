// @vitest-environment jsdom
import React, {act, useState} from 'react';
import {createRoot, type Root} from 'react-dom/client';
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
function Counter() {
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
        render({activeTab: 'a', header: <div>Product</div>});
        const first = panel();
        expect(tab('a').getAttribute('aria-controls')).toBe(first.id);
        expect(first.getAttribute('aria-labelledby')).toBe(tab('a').id);
        expect(container.querySelectorAll('button:not([role="tab"])')).toHaveLength(1);
        first.scrollTop = 120;
        act(() => first.querySelector('button')!.click());
        render({activeTab: 'a', hideTabs: true, header: <div>Product</div>});
        expect(panel()).toBe(first);
        expect(panel().getAttribute('role')).toBe('region');
        expect(panel().getAttribute('aria-label')).toBe('a');
        expect(panel().hasAttribute('aria-labelledby')).toBe(false);
        expect(container.querySelector('[role="tablist"]')).toBeNull();
        expect(container.textContent).toContain('Product');
        render({activeTab: 'b', hideTabs: true});
        expect(first.hidden).toBe(true);
        expect(first.querySelector('[data-active]')!.getAttribute('data-active')).toBe('false');
        render({activeTab: 'a'});
        expect(panel()).toBe(first);
        expect(panel().textContent).toContain('Count 1');
        expect(panel().scrollTop).toBe(120);
        expect(changes).not.toHaveBeenCalled();
        render({activeTab: 'b', tabs: [custom('b')]});
        render({activeTab: 'a'});
        expect(panel()).not.toBe(first);
        expect(panel().textContent).toContain('Count 0');
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
            render({tabs, activeTab: 'list'});
            const beforeHide = observers.length - 1;
            intersect(beforeHide);
            expect(load).toHaveBeenCalledTimes(1);
            const first = panel();
            act(() => first.querySelector('button')!.click());
            render({tabs, activeTab: 'other'});
            expect(observers[beforeHide].disconnect).toHaveBeenCalled();
            intersect(beforeHide);
            expect(load).toHaveBeenCalledTimes(1);
            render({tabs, activeTab: 'list'});
            expect(panel()).toBe(first);
            expect(panel().textContent).toContain('Count 1');
            intersect(observers.length - 1);
            expect(load).toHaveBeenCalledTimes(2);
        },
    );
});
