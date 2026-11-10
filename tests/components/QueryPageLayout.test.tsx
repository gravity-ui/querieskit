// @vitest-environment jsdom
import React, {act, useState} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryPageLayout, type QueryPageLayoutProps} from '../../src/modules/QueryPageLayout';

function Counter({name}: {name: string}) {
    const [count, setCount] = useState(0);
    return (
        <button data-counter={name} onClick={() => setCount(count + 1)}>
            {name}: {count}
        </button>
    );
}

describe('QueryPageLayout', () => {
    let container: HTMLDivElement;
    let root: Root;

    function render(props: Partial<QueryPageLayoutProps> = {}) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryPageLayout sidebar={<Counter name="sidebar" />} {...props}>
                        {props.children ?? <Counter name="workspace" />}
                    </QueryPageLayout>
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
    function sidebar() {
        return container.querySelector<HTMLElement>('.qp-query-page-layout__sidebar')!;
    }
    function separator() {
        return container.querySelector<HTMLElement>(
            '[role="separator"][aria-label="Resize sidebar"]',
        )!;
    }
    function key(keyName: string, shiftKey = false) {
        act(() =>
            separator().dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: keyName,
                    shiftKey,
                    bubbles: true,
                    cancelable: true,
                }),
            ),
        );
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
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
            this: HTMLElement,
        ) {
            return this.classList.contains('qp-query-page-layout') ? 1000 : 0;
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

    it('renders a single workspace without tab semantics and provides an accessible sidebar toggle', () => {
        render({className: 'consumer-layout'});
        expect(container.querySelector('.consumer-layout')).not.toBeNull();
        expect(container.textContent).toContain('workspace: 0');
        expect(
            container.querySelector('[role="tablist"], [role="tab"], [role="tabpanel"]'),
        ).toBeNull();
        expect(sidebar().hidden).toBe(false);
        expect(separator().getAttribute('aria-valuenow')).toBe('300');
        expect(separator().getAttribute('aria-orientation')).toBe('vertical');
        expect(separator().getAttribute('aria-controls')).toBe(sidebar().id);
        expect(button('Hide sidebar').getAttribute('aria-controls')).toBe(sidebar().id);
        expect(button('Hide sidebar').getAttribute('aria-expanded')).toBe('true');
        expect(button('Hide sidebar').tabIndex).toBe(0);
    });

    it('retains sidebar and workspace state while collapsing and reopening', () => {
        const onSidebarCollapsedChange = vi.fn();
        render({onSidebarCollapsedChange});
        const counters = Array.from(
            container.querySelectorAll<HTMLButtonElement>('[data-counter]'),
        );
        act(() => counters.forEach((counter) => counter.click()));
        click('Hide sidebar');
        expect(sidebar().hidden).toBe(true);
        expect(separator().closest('[hidden]')).not.toBeNull();
        expect(button('Show sidebar').getAttribute('aria-expanded')).toBe('false');
        for (const counter of counters) {
            expect(container.contains(counter)).toBe(true);
            expect(counter.textContent).toContain(': 1');
        }
        click('Show sidebar');
        expect(sidebar().hidden).toBe(false);
        expect(separator().closest('[hidden]')).toBeNull();
        expect(onSidebarCollapsedChange.mock.calls).toEqual([[true], [false]]);
    });

    it('resizes uncontrolled width within the sidebar and workspace limits', () => {
        const onSidebarWidthChange = vi.fn();
        render({onSidebarWidthChange});
        key('ArrowRight');
        expect(separator().getAttribute('aria-valuenow')).toBe('316');
        key('ArrowRight', true);
        expect(separator().getAttribute('aria-valuenow')).toBe('380');
        key('Home');
        expect(separator().getAttribute('aria-valuenow')).toBe('240');
        key('ArrowLeft');
        key('End');
        expect(separator().getAttribute('aria-valuenow')).toBe('674');
        expect(onSidebarWidthChange.mock.calls).toEqual([[316], [380], [240], [674]]);
        click('Hide sidebar');
        click('Show sidebar');
        expect(separator().getAttribute('aria-valuenow')).toBe('674');
    });

    it('leaves controlled dimensions and visibility unchanged until the parent updates props', () => {
        const onSidebarWidthChange = vi.fn();
        const onSidebarCollapsedChange = vi.fn();
        const props = {
            sidebarWidth: 350,
            sidebarCollapsed: false,
            onSidebarWidthChange,
            onSidebarCollapsedChange,
        };
        render(props);
        key('ArrowRight');
        click('Hide sidebar');
        expect(separator().getAttribute('aria-valuenow')).toBe('350');
        expect(sidebar().hidden).toBe(false);
        expect(onSidebarWidthChange).toHaveBeenCalledExactlyOnceWith(366);
        expect(onSidebarCollapsedChange).toHaveBeenCalledExactlyOnceWith(true);
        render({...props, sidebarWidth: 420, sidebarCollapsed: true});
        expect(separator().getAttribute('aria-valuenow')).toBe('420');
        expect(sidebar().hidden).toBe(true);
        render({...props, sidebarWidth: 420});
        expect(sidebar().hidden).toBe(false);
        expect(separator().getAttribute('aria-valuenow')).toBe('420');
        expect(onSidebarWidthChange).toHaveBeenCalledTimes(1);
        expect(onSidebarCollapsedChange).toHaveBeenCalledTimes(1);
    });

    it('uses uncontrolled defaults only for initialization without emitting changes', () => {
        const onSidebarWidthChange = vi.fn();
        const onSidebarCollapsedChange = vi.fn();
        render({
            defaultSidebarWidth: 400,
            defaultSidebarCollapsed: true,
            onSidebarWidthChange,
            onSidebarCollapsedChange,
        });
        expect(sidebar().hidden).toBe(true);
        expect(separator().getAttribute('aria-valuenow')).toBe('400');
        expect(onSidebarWidthChange).not.toHaveBeenCalled();
        expect(onSidebarCollapsedChange).not.toHaveBeenCalled();
        render({defaultSidebarWidth: 500, defaultSidebarCollapsed: false});
        expect(sidebar().hidden).toBe(true);
        click('Show sidebar');
        expect(separator().getAttribute('aria-valuenow')).toBe('400');
    });

    it('keeps the standard toggle alongside a custom header node', () => {
        render({header: <h1>Query editor</h1>});
        expect(container.querySelector('h1')?.textContent).toBe('Query editor');
        click('Hide sidebar');
        expect(sidebar().hidden).toBe(true);
        expect(container.querySelector('h1')?.textContent).toBe('Query editor');
    });

    it('lets the header renderer place the accessible toggle and observes collapse changes', () => {
        render({
            header: ({sidebarToggle, sidebarCollapsed}) => (
                <header data-custom-header data-collapsed={sidebarCollapsed}>
                    <h1>Workspace</h1>
                    {sidebarToggle}
                </header>
            ),
        });
        const header = container.querySelector('[data-custom-header]')!;
        expect(header.contains(button('Hide sidebar'))).toBe(true);
        expect(header.getAttribute('data-collapsed')).toBe('false');
        expect(container.querySelectorAll('[aria-label="Hide sidebar"]')).toHaveLength(1);
        click('Hide sidebar');
        expect(header.getAttribute('data-collapsed')).toBe('true');
        expect(header.contains(button('Show sidebar'))).toBe(true);
        expect(button('Show sidebar').getAttribute('aria-controls')).toBe(sidebar().id);
    });
});
