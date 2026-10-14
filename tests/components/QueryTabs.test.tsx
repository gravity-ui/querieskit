// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {TabProvider, ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryTabs} from '../../src/modules/QueryTabs';
import type {QueryTabItem, QueryTabsProps} from '../../src/types/queryTabs';
import {setLang} from '../../src/i18n';

vi.mock('../../src/components/QueryStatusIcon', () => ({
    QueryStatusIcon: ({status}: {status: string}) => <span data-query-status={status} />,
}));

const items: QueryTabItem[] = [
    {id: 'first', title: 'First query', type: 'query', status: 'draft'},
    {id: 'second', title: 'Second query', type: 'query', status: 'completed'},
    {id: 'comparison', leftTitle: 'Baseline', rightTitle: 'Candidate', type: 'comparison'},
];

describe('QueryTabs', () => {
    let container: HTMLDivElement;
    let root: Root;
    let callbacks: Pick<QueryTabsProps, 'onActiveTabChange' | 'onAddTab' | 'onCloseTab'>;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        setLang('en');
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        callbacks = {
            onActiveTabChange: vi.fn(),
            onAddTab: vi.fn(),
            onCloseTab: vi.fn(),
        };
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        setLang('en');
        vi.restoreAllMocks();
    });

    function render(props: Partial<QueryTabsProps> = {}) {
        act(() => {
            root.render(
                <ThemeProvider>
                    <QueryTabs items={items} activeTab="first" {...callbacks} {...props} />
                </ThemeProvider>,
            );
        });
    }

    function tabs() {
        return Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]'));
    }

    function button(label: string) {
        const element = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
        if (!element) throw new Error(`Button not found: ${label}`);
        return element;
    }

    function key(element: HTMLElement, value: string) {
        act(() => {
            element.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: value,
                    code: value === ' ' ? 'Space' : value,
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });
    }

    it('preserves order and delegates selection without changing controlled state', () => {
        render();
        expect(tabs().map((tab) => tab.getAttribute('aria-label') || tab.textContent)).toEqual([
            'First query',
            'Second query',
            'Compare Baseline with Candidate',
        ]);
        expect(tabs().map((tab) => tab.getAttribute('aria-selected'))).toEqual([
            'true',
            'false',
            'false',
        ]);

        act(() => tabs()[1].click());
        expect(callbacks.onActiveTabChange).toHaveBeenCalledExactlyOnceWith('second');
        expect(tabs()[0].getAttribute('aria-selected')).toBe('true');

        render({activeTab: 'second'});
        expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
        act(() => tabs()[1].click());
        expect(callbacks.onActiveTabChange).toHaveBeenCalledTimes(1);
    });

    it.each(['Enter', ' '])('activates a focused tab once with %s', (value) => {
        render();
        act(() => tabs()[1].focus());
        key(tabs()[1], value);
        expect(callbacks.onActiveTabChange).toHaveBeenCalledExactlyOnceWith('second');
    });

    it('moves focus with arrow keys, Home and End without activating tabs', () => {
        render();
        act(() => tabs()[0].focus());
        key(tabs()[0], 'ArrowRight');
        expect(document.activeElement).toBe(tabs()[1]);
        key(tabs()[1], 'End');
        expect(document.activeElement).toBe(tabs()[2]);
        key(tabs()[2], 'ArrowRight');
        expect(document.activeElement).toBe(tabs()[0]);
        key(tabs()[0], 'ArrowLeft');
        expect(document.activeElement).toBe(tabs()[2]);
        key(tabs()[2], 'Home');
        expect(document.activeElement).toBe(tabs()[0]);
        expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
    });

    it('delegates close and add without activating, removing or inserting tabs', () => {
        render();
        act(() => button('Close tab Second query').click());
        expect(callbacks.onCloseTab).toHaveBeenCalledExactlyOnceWith('second');
        expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
        act(() => button('New query').click());
        expect(callbacks.onAddTab).toHaveBeenCalledTimes(1);
        expect(tabs()).toHaveLength(3);
    });

    it('isolates controlled selection from an enclosing TabProvider without linking absent panels', () => {
        const onOuterUpdate = vi.fn();
        act(() => {
            root.render(
                <ThemeProvider>
                    <TabProvider value="outer-tab" onUpdate={onOuterUpdate}>
                        <QueryTabs items={items} activeTab="second" {...callbacks} />
                    </TabProvider>
                </ThemeProvider>,
            );
        });

        expect(tabs().map((tab) => tab.getAttribute('aria-selected'))).toEqual([
            'false',
            'true',
            'false',
        ]);
        expect(tabs().every((tab) => !tab.hasAttribute('aria-controls'))).toBe(true);
        act(() => tabs()[0].click());
        expect(callbacks.onActiveTabChange).toHaveBeenCalledExactlyOnceWith('first');
        expect(onOuterUpdate).not.toHaveBeenCalled();
        expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    });

    it.each(['Home', 'End'])('does not handle %s on a close button as tab navigation', (value) => {
        render();
        const close = button('Close tab Second query');
        act(() => close.focus());
        key(close, value);
        expect(document.activeElement).toBe(close);
        expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
        expect(callbacks.onCloseTab).not.toHaveBeenCalled();
    });

    it('renders custom actions with their own handlers', () => {
        const onAction = vi.fn();
        render({
            actions: (
                <button aria-label="Settings" onClick={onAction}>
                    Settings
                </button>
            ),
        });
        act(() => button('Settings').click());
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
        expect(callbacks.onAddTab).not.toHaveBeenCalled();
        expect(callbacks.onCloseTab).not.toHaveBeenCalled();
    });

    it('shows execution statuses, omits the draft icon, and keeps modification independent of status', () => {
        const statuses = ['draft', 'running', 'completed', 'failed', 'aborted'] as const;
        render({
            items: statuses.map((status) => ({
                id: status,
                title: status,
                type: 'query',
                status,
                isModified: true,
            })),
        });
        expect(
            Array.from(container.querySelectorAll('[data-query-status]')).map((icon) =>
                icon.getAttribute('data-query-status'),
            ),
        ).toEqual(statuses.filter((status) => status !== 'draft'));
        expect(container.querySelectorAll('[title="Query has changes"]')).toHaveLength(
            statuses.length,
        );
    });

    it('renders both comparison titles around the icon and closes by the comparison ID', () => {
        render({activeTab: 'comparison'});
        const comparison = tabs()[2];
        const heading = comparison.querySelector('.qp-query-tab__heading');
        const parts = Array.from(heading?.children ?? []);
        expect(parts).toHaveLength(3);
        expect(parts[0].textContent).toBe('Baseline');
        expect(parts[1].getAttribute('aria-hidden')).toBe('true');
        expect(parts[1].querySelector('svg')).not.toBeNull();
        expect(parts[2].textContent).toBe('Candidate');
        expect(comparison.getAttribute('title')).toBe('Compare Baseline with Candidate');
        expect(comparison.querySelector('[data-query-status]')).toBeNull();
        act(() => button('Close tab Compare Baseline with Candidate').click());
        expect(callbacks.onCloseTab).toHaveBeenCalledExactlyOnceWith('comparison');
        expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
    });

    it('keeps modified tabs closable and describes changes for assistive technology', () => {
        render({
            items: [
                {
                    id: 'modified',
                    type: 'query',
                    title: 'Changed',
                    status: 'draft',
                    isModified: true,
                },
            ],
        });
        const descriptionId = tabs()[0].getAttribute('aria-describedby');
        expect(document.getElementById(descriptionId ?? '')?.textContent).toContain(
            'Query has changes',
        );
        act(() => button('Close tab Changed').click());
        expect(callbacks.onCloseTab).toHaveBeenCalledExactlyOnceWith('modified');
        expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
    });

    it.each([items[0], items[2]])(
        'optionally hides the only close button for $type tabs',
        (item) => {
            render({items: [item], hideCloseOnLastTab: true});
            expect(container.querySelector('button[aria-label^="Close tab"]')).toBeNull();
            expect(button('New query')).toBeDefined();
            expect(callbacks.onCloseTab).not.toHaveBeenCalled();

            render({items: [item], hideCloseOnLastTab: false});
            const close = container.querySelector<HTMLButtonElement>(
                'button[aria-label^="Close tab"]',
            );
            expect(close).not.toBeNull();
            act(() => close?.click());
            expect(callbacks.onCloseTab).toHaveBeenCalledExactlyOnceWith(item.id);
        },
    );

    it('updates close availability as the list grows and shrinks, keeping the change indicator', () => {
        const modified: QueryTabItem = {
            ...items[0],
            type: 'query',
            title: 'Changed',
            status: 'draft',
            isModified: true,
        };
        render({items: [modified], hideCloseOnLastTab: true});
        expect(container.querySelector('[title="Query has changes"]')).not.toBeNull();
        expect(container.querySelector('button[aria-label^="Close tab"]')).toBeNull();

        render({items: [modified, items[1]], hideCloseOnLastTab: true});
        expect(container.querySelectorAll('button[aria-label^="Close tab"]')).toHaveLength(2);
        render({items: [modified], hideCloseOnLastTab: true});
        expect(container.querySelector('button[aria-label^="Close tab"]')).toBeNull();
        expect(container.querySelector('[title="Query has changes"]')).not.toBeNull();
    });

    it('restores focus to the tab when the optional flag hides its focused close button', () => {
        render({items: [items[0]]});
        act(() => button('Close tab First query').focus());
        render({items: [items[0]], hideCloseOnLastTab: true});
        expect(document.activeElement).toBe(tabs()[0]);
        expect(callbacks.onCloseTab).not.toHaveBeenCalled();
    });

    it.each([undefined, 'missing'])(
        'falls back to the first tab for activeTab=%s without emitting a change',
        (activeTab) => {
            render({activeTab});
            expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
            expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
        },
    );

    it('supports an empty list while keeping add and actions available', () => {
        render({items: [], actions: <button aria-label="Settings">Settings</button>});
        expect(tabs()).toHaveLength(0);
        expect(button('New query')).toBeDefined();
        expect(button('Settings')).toBeDefined();
        expect(callbacks.onActiveTabChange).not.toHaveBeenCalled();
    });

    it('restores focus to the selected tab when a focused close button is removed', () => {
        render();
        act(() => button('Close tab Second query').focus());
        render({items: [items[0], items[2]]});
        expect(document.activeElement).toBe(tabs()[0]);
    });

    it('restores focus to a remaining tab, then add, when the focused tab is removed', () => {
        render({activeTab: 'second'});
        act(() => tabs()[1].focus());
        render({items: [items[2]], activeTab: undefined});
        expect(document.activeElement).toBe(tabs()[0]);
        render({items: [], activeTab: undefined});
        expect(document.activeElement).toBe(button('New query'));
    });

    it('does not steal focus from custom actions when tabs are removed', () => {
        const actions = <button aria-label="Settings">Settings</button>;
        render({actions});
        act(() => button('Settings').focus());
        render({items: [], actions});
        expect(document.activeElement).toBe(button('Settings'));
    });
});
