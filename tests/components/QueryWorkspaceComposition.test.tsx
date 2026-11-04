// @vitest-environment jsdom
import React, {act, useState} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryPage} from '../../src/pages/QueryPage';
import {QueryWorkspaceLayout} from '../../src/modules/QueryWorkspaceLayout';
import type {QueryPageProps} from '../../src/types/queryPage';
import type {QueryWorkspaceLayoutProps} from '../../src/types/queryWorkspaceLayout';

vi.mock('../../src/widgets/QueryEditor', () => ({QueryEditor: () => null}));
vi.mock('../../src/widgets/QueryExecutionPanel', () => ({QueryExecutionPanel: () => null}));
vi.mock('../../src/modules/QueryComparison', () => ({QueryComparison: () => null}));

function Session({id, active}: {id: string; active: boolean}) {
    const [count, setCount] = useState(0);
    return (
        <button data-session={id} data-active={active} onClick={() => setCount(count + 1)}>
            {count}
        </button>
    );
}

describe('workspace composition', () => {
    let container: HTMLDivElement;
    let root: Root;
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
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });
    const renderLayout = (props: QueryWorkspaceLayoutProps) =>
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryWorkspaceLayout {...props} />
                </ThemeProvider>,
            ),
        );
    function click(selector: string) {
        const element = container.querySelector<HTMLButtonElement>(selector);
        expect(element).not.toBeNull();
        act(() => element?.click());
    }

    it('retains independent hooked containers until their tab is removed', () => {
        const renderers = ['a', 'b'].map((id) =>
            vi.fn(({active}: {active: boolean}) => <Session id={id} active={active} />),
        );
        const items: QueryPageProps['tabsProps']['items'] = ['a', 'b'].map((id, index) => ({
            id,
            type: 'query',
            title: id,
            status: 'draft',
            renderContent: renderers[index],
        }));
        function render(activeTab: string, nextItems = items) {
            act(() =>
                root.render(
                    <ThemeProvider>
                        <QueryPage
                            sidebarProps={{
                                tabs: [
                                    {
                                        id: 'history',
                                        type: 'history',
                                        renderContent: ({active}) => (
                                            <Session id="history" active={active} />
                                        ),
                                    },
                                ],
                            }}
                            tabsProps={{
                                items: nextItems,
                                activeTab,
                                onActiveTabChange: vi.fn(),
                                onAddTab: vi.fn(),
                                onCloseTab: vi.fn(),
                            }}
                        />
                    </ThemeProvider>,
                ),
            );
        }
        render('a');
        expect(renderers[1]).not.toHaveBeenCalled();
        click('[data-session="a"]');
        const first = container.querySelector('[data-session="a"]');
        render('b');
        expect(first?.getAttribute('data-active')).toBe('false');
        click('[data-session="b"]');
        render('a');
        expect(container.querySelector('[data-session="a"]')).toBe(first);
        expect(first?.textContent).toBe('1');
        expect(first?.getAttribute('data-active')).toBe('true');
        render('b', [items[1]]);
        expect(container.contains(first)).toBe(false);
        render('a');
        expect(container.querySelector('[data-session="a"]')?.textContent).toBe('0');
    });

    it('retains slots while propagating visibility and layout controls', () => {
        const props: QueryWorkspaceLayoutProps = {
            renderEditor: ({active}) => <Session id="editor" active={active} />,
            renderExecutionPanel: ({
                active,
                expanded,
                collapsed,
                onExpandedChange,
                onCollapsedChange,
            }) => (
                <>
                    <Session id="results" active={active} />
                    <button data-expand onClick={() => onExpandedChange(!expanded)}>
                        expand
                    </button>
                    <button data-collapse onClick={() => onCollapsedChange(!collapsed)}>
                        collapse
                    </button>
                </>
            ),
        };
        renderLayout(props);
        click('[data-session="editor"]');
        const editor = container.querySelector('[data-session="editor"]');
        click('[data-expand]');
        expect(editor?.getAttribute('data-active')).toBe('false');
        expect(
            container.querySelector<HTMLElement>('.qp-query-workspace__editor-region')?.hidden,
        ).toBe(true);
        click('[data-collapse]');
        expect(editor?.getAttribute('data-active')).toBe('true');
        renderLayout({...props, showResults: false});
        expect(
            container.querySelector('[data-session="results"]')?.getAttribute('data-active'),
        ).toBe('false');
        renderLayout({...props, active: false});
        expect(editor?.getAttribute('data-active')).toBe('false');
        expect(container.querySelector('[data-session="editor"]')).toBe(editor);
        expect(editor?.textContent).toBe('1');
    });

    it('keeps controlled layout authoritative and exposes accessible resizing', () => {
        const changed = vi.fn();
        const resized = vi.fn();
        const props: QueryWorkspaceLayoutProps = {
            renderEditor: () => <div>editor</div>,
            renderExecutionPanel: ({onExpandedChange}) => (
                <button data-expand onClick={() => onExpandedChange(true)}>
                    expand
                </button>
            ),
            expanded: false,
            onExpandedChange: changed,
            executionPanelHeight: 300,
            onExecutionPanelHeightChange: resized,
        };
        renderLayout(props);
        click('[data-expand]');
        expect(changed).toHaveBeenCalledExactlyOnceWith(true);
        expect(
            container.querySelector<HTMLElement>('.qp-query-workspace__editor-region')?.hidden,
        ).toBe(false);
        const separator = container.querySelector('[role="separator"]');
        expect(separator?.getAttribute('aria-label')).toBe('Resize results');
        act(() =>
            separator?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true})),
        );
        expect(resized).toHaveBeenCalledExactlyOnceWith(316);
        expect(separator?.getAttribute('aria-valuenow')).toBe('300');
        renderLayout({...props, expanded: true});
        expect(
            container.querySelector<HTMLElement>('.qp-query-workspace__editor-region')?.hidden,
        ).toBe(true);
    });
});
