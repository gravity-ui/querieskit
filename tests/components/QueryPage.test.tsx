// @vitest-environment jsdom
import React, {act, useState} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryPage} from '../../src/pages/QueryPage';
import type {QueryPageProps, QueryPageTab} from '../../src/types/queryPage';

const editorPropsSeen = vi.hoisted(() => vi.fn());
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: (props: Record<string, unknown>) => {
        editorPropsSeen(props);
        return <Counter name="editor" />;
    },
}));
vi.mock('../../src/modules/QueryResults', () => ({QueryResults: () => null}));
vi.mock('../../src/modules/QueryProgress', () => ({QueryProgress: () => null}));
vi.mock('../../src/modules/QueryStatistics', () => ({QueryStatistics: () => null}));
vi.mock('../../src/modules/NavigationMeta', () => ({NavigationMeta: () => null}));

function Counter({name}: {name: string}) {
    const [count, setCount] = useState(0);
    return (
        <button data-counter={name} onClick={() => setCount(count + 1)}>
            {name}: {count}
        </button>
    );
}

function createProps(): QueryPageProps {
    return {
        sidebarProps: {
            className: 'consumer-sidebar',
            tabs: [
                {
                    id: 'custom',
                    type: 'custom',
                    title: 'Sidebar',
                    icon: <span>S</span>,
                    renderContent: () => <Counter name="sidebar" />,
                },
            ],
        },
        tabsProps: {
            activeTab: 'query-a',
            onActiveTabChange: vi.fn(),
            onAddTab: vi.fn(),
            onCloseTab: vi.fn(),
            items: [
                {
                    id: 'query-a',
                    type: 'query',
                    title: 'Query A',
                    status: 'draft',
                    editorProps: {
                        className: 'consumer-editor',
                        value: 'select 1',
                        onChange: vi.fn(),
                        clusters: [],
                        engines: [],
                        clusterId: '',
                        engineId: '',
                        onClusterChange: vi.fn(),
                        onEngineChange: vi.fn(),
                        onRun: vi.fn(),
                        onFormat: vi.fn(),
                        onValidate: vi.fn(),
                    },
                    executionPanelProps: {
                        className: 'consumer-results',
                        tabs: [
                            {
                                id: 'custom',
                                type: 'custom',
                                title: 'Results',
                                renderContent: () => <Counter name="results" />,
                            },
                        ],
                    },
                },
            ],
        },
        className: 'consumer-page',
    };
}

describe('QueryPage', () => {
    let container: HTMLDivElement;
    let root: Root;
    function render(value: QueryPageProps) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryPage {...value} />
                </ThemeProvider>,
            ),
        );
    }
    function button(label: string) {
        const node = container.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`);
        expect(node, label).not.toBeNull();
        return node!;
    }
    function click(label: string) {
        act(() => button(label).click());
    }
    function separator(label: string) {
        return container.querySelector<HTMLElement>(`[role="separator"][aria-label="${label}"]`)!;
    }
    function key(label: string, keyName: string, shiftKey = false) {
        act(() =>
            separator(label).dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: keyName,
                    shiftKey,
                    bubbles: true,
                    cancelable: true,
                }),
            ),
        );
    }
    function editorHidden() {
        return container.querySelector<HTMLElement>('.qp-query-workspace__editor-region')!.hidden;
    }
    function sidebarHidden() {
        return container.querySelector<HTMLElement>('.qp-query-page__sidebar')!.hidden;
    }
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        );
        editorPropsSeen.mockClear();
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
            this: HTMLElement,
        ) {
            return this.classList.contains('qp-query-page') ? 1000 : 0;
        });
        vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
            this: HTMLElement,
        ) {
            if (this.classList.contains('qp-query-page')) return 800;
            if (this.classList.contains('qp-query-workspace')) return 760;
            return 0;
        });
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

    it('places the sidebar toggle in tab actions and retains consumer actions', () => {
        const value = createProps();
        const customAction = vi.fn();
        value.tabsProps.actions = (
            <button aria-label="Custom action" onClick={customAction}>
                Action
            </button>
        );
        render(value);
        const actions = container.querySelector('.qp-query-tabs__actions');
        expect(actions?.contains(button('Hide sidebar'))).toBe(true);
        expect(actions?.contains(button('Custom action'))).toBe(true);
        click('Custom action');
        expect(customAction).toHaveBeenCalledOnce();
        click('Hide sidebar');
        expect(sidebarHidden()).toBe(true);
        expect(actions?.contains(button('Show sidebar'))).toBe(true);
        expect(button('Show sidebar').getAttribute('aria-expanded')).toBe('false');
        click('Show sidebar');
        expect(sidebarHidden()).toBe(false);
    });

    it('preserves widget state through hiding, expansion and collapse, and forwards classes and editor props', () => {
        const value = createProps();
        render(value);
        const counters = Array.from(
            container.querySelectorAll<HTMLButtonElement>('[data-counter]'),
        );
        expect(counters).toHaveLength(3);
        act(() => counters.forEach((counter) => counter.click()));
        click('Hide sidebar');
        expect(sidebarHidden()).toBe(true);
        click('Expand panel');
        expect(editorHidden()).toBe(true);
        click('Collapse content');
        expect(editorHidden()).toBe(false);
        expect(container.querySelector('.qp-query-workspace_collapsed')).not.toBeNull();
        click('Expand content');
        click('Show sidebar');
        for (const counter of counters) {
            expect(container.contains(counter)).toBe(true);
            expect(counter.textContent).toContain(': 1');
        }
        for (const className of [
            'consumer-page',
            'consumer-sidebar',
            'consumer-editor',
            'consumer-results',
        ]) {
            expect(container.querySelector(`.${className}`)).not.toBeNull();
        }
        expect(editorPropsSeen.mock.calls.at(-1)?.[0].value).toBe('select 1');
    });

    it('calls original layout callbacks exactly once, including legacy onClose', () => {
        const value = createProps();
        const expanded = vi.fn();
        const collapsed = vi.fn();
        const closed = vi.fn();
        const sidebar = vi.fn();
        value.onSidebarCollapsedChange = sidebar;
        Object.assign(value.tabsProps.items[0].executionPanelProps, {
            onExpandedChange: expanded,
            onCollapsedChange: collapsed,
            onClose: closed,
        });
        render(value);
        click('Hide sidebar');
        click('Expand panel');
        click('Collapse content');
        expect(expanded.mock.calls).toEqual([[true], [false]]);
        expect(collapsed.mock.calls).toEqual([[true]]);
        expect(closed).toHaveBeenCalledOnce();
        expect(sidebar.mock.calls).toEqual([[true]]);
        click('Expand content');
        expect(collapsed.mock.calls).toEqual([[true], [false]]);
        expect(closed).toHaveBeenCalledOnce();
    });

    it('leaves controlled visibility and dimensions unchanged until the parent rerenders', () => {
        const value = createProps();
        value.sidebarCollapsed = false;
        value.sidebarWidth = 300;
        value.tabsProps.items[0].executionPanelHeight = 300;
        value.onSidebarCollapsedChange = vi.fn();
        value.onSidebarWidthChange = vi.fn();
        value.tabsProps.items[0].onExecutionPanelHeightChange = vi.fn();
        value.tabsProps.items[0].executionPanelProps.expanded = false;
        value.tabsProps.items[0].executionPanelProps.collapsed = false;
        value.tabsProps.items[0].executionPanelProps.onExpandedChange = vi.fn();
        value.tabsProps.items[0].executionPanelProps.onCollapsedChange = vi.fn();
        render(value);
        click('Hide sidebar');
        click('Expand panel');
        click('Collapse content');
        key('Resize sidebar', 'ArrowRight');
        key('Resize results', 'ArrowUp');
        expect(sidebarHidden()).toBe(false);
        expect(editorHidden()).toBe(false);
        expect(separator('Resize sidebar').getAttribute('aria-valuenow')).toBe('300');
        expect(separator('Resize results').getAttribute('aria-valuenow')).toBe('300');
        expect(value.onSidebarWidthChange).toHaveBeenCalledExactlyOnceWith(316);
        expect(
            value.tabsProps.items[0].onExecutionPanelHeightChange,
        ).toHaveBeenCalledExactlyOnceWith(316);
        render({
            ...value,
            sidebarCollapsed: true,
            sidebarWidth: 400,
            tabsProps: {
                ...value.tabsProps,
                items: [
                    {
                        ...value.tabsProps.items[0],
                        executionPanelHeight: 400,
                        executionPanelProps: {
                            ...value.tabsProps.items[0].executionPanelProps,
                            expanded: true,
                        },
                    },
                ],
            },
        });
        expect(sidebarHidden()).toBe(true);
        expect(editorHidden()).toBe(true);
        expect(
            value.tabsProps.items[0].executionPanelProps.onExpandedChange,
        ).toHaveBeenCalledExactlyOnceWith(true);
        expect(
            value.tabsProps.items[0].executionPanelProps.onCollapsedChange,
        ).toHaveBeenCalledExactlyOnceWith(true);
        render({
            ...value,
            tabsProps: {
                ...value.tabsProps,
                items: [
                    {
                        ...value.tabsProps.items[0],
                        executionPanelProps: {
                            ...value.tabsProps.items[0].executionPanelProps,
                            expanded: true,
                            collapsed: true,
                        },
                    },
                ],
            },
        });
        expect(editorHidden()).toBe(false);
        expect(container.querySelector('.qp-query-workspace_collapsed')).not.toBeNull();
    });

    it('supports keyboard steps and minimum/maximum constraints while preserving callbacks on no-op changes', () => {
        const value = createProps();
        value.onSidebarWidthChange = vi.fn();
        value.tabsProps.items[0].onExecutionPanelHeightChange = vi.fn();
        render(value);
        key('Resize sidebar', 'ArrowRight');
        expect(separator('Resize sidebar').getAttribute('aria-valuenow')).toBe('316');
        key('Resize sidebar', 'ArrowRight', true);
        expect(separator('Resize sidebar').getAttribute('aria-valuenow')).toBe('380');
        key('Resize sidebar', 'Home');
        key('Resize sidebar', 'ArrowLeft');
        key('Resize sidebar', 'End');
        expect(vi.mocked(value.onSidebarWidthChange!).mock.calls).toEqual([
            [316],
            [380],
            [240],
            [674],
        ]);
        key('Resize results', 'ArrowUp', true);
        key('Resize results', 'ArrowDown');
        key('Resize results', 'Home');
        key('Resize results', 'ArrowDown');
        key('Resize results', 'End');
        expect(
            vi.mocked(value.tabsProps.items[0].onExecutionPanelHeightChange!).mock.calls,
        ).toEqual([[364], [348], [120], [594]]);
        expect(separator('Resize results').getAttribute('aria-valuenow')).toBe('594');
    });

    it('resizes with captured pointer movement and stops after release or cancellation', () => {
        const value = createProps();
        render(value);
        const handle = separator('Resize sidebar');
        handle.setPointerCapture = vi.fn();
        handle.releasePointerCapture = vi.fn();
        function pointer(type: string, x: number, id = 1) {
            const event = new MouseEvent(type, {clientX: x, button: 0, bubbles: true});
            Object.defineProperty(event, 'pointerId', {value: id});
            act(() => handle.dispatchEvent(event));
        }
        pointer('pointerdown', 300);
        expect(handle.setPointerCapture).toHaveBeenCalledWith(1);
        pointer('pointermove', 360, 2);
        expect(handle.getAttribute('aria-valuenow')).toBe('300');
        pointer('pointermove', 360);
        expect(handle.getAttribute('aria-valuenow')).toBe('360');
        pointer('pointerup', 360);
        expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
        pointer('pointermove', 400);
        expect(handle.getAttribute('aria-valuenow')).toBe('360');
        pointer('pointerdown', 360);
        pointer('pointercancel', 360);
        pointer('pointermove', 400);
        expect(handle.getAttribute('aria-valuenow')).toBe('360');
    });

    it('initializes uncontrolled collapse defaults without emitting events', () => {
        const value = createProps();
        value.defaultSidebarCollapsed = true;
        value.tabsProps.items[0].executionPanelProps.defaultCollapsed = true;
        value.onSidebarCollapsedChange = vi.fn();
        value.tabsProps.items[0].executionPanelProps.onCollapsedChange = vi.fn();
        render(value);
        expect(sidebarHidden()).toBe(true);
        expect(editorHidden()).toBe(false);
        expect(container.querySelector('.qp-query-workspace_collapsed')).not.toBeNull();
        expect(value.onSidebarCollapsedChange).not.toHaveBeenCalled();
        expect(
            value.tabsProps.items[0].executionPanelProps.onCollapsedChange,
        ).not.toHaveBeenCalled();
    });
    function panel(title: string) {
        return container.querySelector<HTMLElement>(
            `.qp-query-page__panel[aria-label="${title}"]`,
        )!;
    }
    function addSecondTab(value: QueryPageProps): QueryPageTab {
        const second = {...createProps().tabsProps.items[0], id: 'query-b', title: 'Query B'};
        value.tabsProps.items.push(second);
        return second;
    }

    it('lazily retains independent workspaces, preserves keys on reorder, and disposes only removed tabs', () => {
        const value = createProps();
        const first = value.tabsProps.items[0];
        const second = addSecondTab(value);
        render(value);
        expect(container.querySelectorAll('[data-counter="editor"]')).toHaveLength(1);
        const sidebar = container.querySelector<HTMLButtonElement>('[data-counter="sidebar"]')!;
        const editorA =
            panel('Query A').querySelector<HTMLButtonElement>('[data-counter="editor"]')!;
        const resultsA = panel('Query A').querySelector<HTMLButtonElement>(
            '[data-counter="results"]',
        )!;
        act(() => {
            sidebar.click();
            editorA.click();
            resultsA.click();
        });
        key('Resize results', 'ArrowUp');
        click('Expand panel');
        expect(container.querySelector('[role="tab"][aria-label="Query B"]')).not.toBeNull();
        value.tabsProps.activeTab = 'query-b';
        render(value);
        expect(panel('Query A').hidden).toBe(true);
        expect(panel('Query B').hidden).toBe(false);
        const editorB =
            panel('Query B').querySelector<HTMLButtonElement>('[data-counter="editor"]')!;
        expect(editorB.textContent).toBe('editor: 0');
        act(() => editorB.click());
        expect(sidebar.textContent).toBe('sidebar: 1');
        value.tabsProps.items = [second, first];
        value.tabsProps.activeTab = 'query-a';
        render(value);
        expect(panel('Query A').querySelector('[data-counter="editor"]')).toBe(editorA);
        expect(editorA.textContent).toBe('editor: 1');
        expect(resultsA.textContent).toBe('results: 1');
        expect(panel('Query A').querySelector('.qp-query-workspace_expanded')).not.toBeNull();
        act(() =>
            panel('Query A')
                .querySelector<HTMLButtonElement>('[aria-label="Collapse panel"]')!
                .click(),
        );
        expect(
            panel('Query A')
                .querySelector('[aria-label="Resize results"]')
                ?.getAttribute('aria-valuenow'),
        ).toBe('316');
        value.tabsProps.items = [second];
        value.tabsProps.activeTab = 'query-b';
        render(value);
        expect(container.contains(editorA)).toBe(false);
        expect(panel('Query B').querySelector('[data-counter="editor"]')).toBe(editorB);
        value.tabsProps.items = [second, first];
        value.tabsProps.activeTab = 'query-a';
        render(value);
        expect(panel('Query A').querySelector('[data-counter="editor"]')).not.toBe(editorA);
        expect(panel('Query A').querySelector('[data-counter="editor"]')?.textContent).toBe(
            'editor: 0',
        );
    });

    it('keeps selection controlled and uses the strip fallback for missing selection and empty items', () => {
        const value = createProps();
        addSecondTab(value);
        render(value);
        click('Query B');
        expect(value.tabsProps.onActiveTabChange).toHaveBeenCalledExactlyOnceWith('query-b');
        expect(panel('Query A').hidden).toBe(false);
        expect(panel('Query B').hidden).toBe(true);
        expect(panel('Query A').getAttribute('role')).toBe('tabpanel');
        expect(button('Query A').getAttribute('aria-controls')).toBe(panel('Query A').id);
        expect(button('Query B').getAttribute('aria-controls')).toBe(panel('Query B').id);
        expect(button('Query A').getAttribute('aria-selected')).toBe('true');

        click('Close tab Query A');
        expect(value.tabsProps.onCloseTab).toHaveBeenCalledExactlyOnceWith('query-a');
        expect(panel('Query A')).not.toBeNull();
        value.tabsProps.activeTab = 'missing';
        render(value);
        expect(panel('Query A').hidden).toBe(false);
        expect(value.tabsProps.onActiveTabChange).toHaveBeenCalledTimes(1);
        value.tabsProps.items = [];
        render(value);
        expect(container.querySelector('[data-counter="editor"]')).toBeNull();
        expect(container.querySelector('[data-counter="sidebar"]')).not.toBeNull();
        click('New query');
        expect(value.tabsProps.onAddTab).toHaveBeenCalledOnce();
    });

    it('reports inactive retained results and respects explicit consumer inactivity', () => {
        const value = createProps();
        const second = addSecondTab(value);
        const activityA = vi.fn(({active}: {active: boolean}) => <span>{String(active)}</span>);
        const activityB = vi.fn(({active}: {active: boolean}) => <span>{String(active)}</span>);
        value.tabsProps.items[0].executionPanelProps.tabs = [
            {id: 'custom', type: 'custom', title: 'Results', renderContent: activityA},
        ];
        second.executionPanelProps.tabs = [
            {id: 'custom', type: 'custom', title: 'Results', renderContent: activityB},
        ];
        render(value);
        expect(activityA).toHaveBeenLastCalledWith({active: true});
        expect(activityB).not.toHaveBeenCalled();
        value.tabsProps.activeTab = 'query-b';
        render(value);
        expect(activityA).toHaveBeenLastCalledWith({active: false});
        expect(activityB).toHaveBeenLastCalledWith({active: true});
        second.executionPanelProps.active = false;
        render(value);
        expect(activityB).toHaveBeenLastCalledWith({active: false});
    });
});
