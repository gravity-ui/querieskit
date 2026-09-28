// @vitest-environment jsdom
import React, {act, useState} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {QueryExecutionPanel} from '../../src/widgets/QueryExecutionPanel';
import type {
    QueryExecutionPanelProps,
    QueryExecutionTab,
} from '../../src/types/queryExecutionPanel';
import {getMessagesSeverity} from '../../src/widgets/QueryExecutionPanel/helpers/getMessagesSeverity';

vi.mock('../../src/modules/QueryResults', () => ({
    QueryResults: ({rows}: {rows: unknown[]}) => <div>Rows: {rows.length}</div>,
}));
vi.mock('../../src/modules/QueryProgress', () => ({
    QueryProgress: ({active}: {active: boolean}) => <div data-progress={String(active)} />,
}));
vi.mock('../../src/modules/QueryStatistics', () => ({
    QueryStatistics: () => <div>Statistics content</div>,
}));
vi.mock('../../src/modules/NavigationMeta', () => ({
    NavigationMeta: () => <div>Meta content</div>,
}));
vi.mock('../../src/components/ErrorTree', () => ({ErrorTree: () => <Counter />}));

function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
}
const custom = (id: string): QueryExecutionTab => ({
    id,
    type: 'custom',
    title: id,
    renderContent: ({active}) => (
        <div data-active={String(active)}>
            <Counter />
        </div>
    ),
});

describe('QueryExecutionPanel', () => {
    let container: HTMLDivElement;
    let root: Root;
    const changes = vi.fn();
    function render(props: Partial<QueryExecutionPanelProps> = {}, key = 'execution') {
        act(() =>
            root.render(
                <React.StrictMode>
                    <ThemeProvider>
                        <QueryExecutionPanel
                            key={key}
                            tabs={[custom('a'), custom('b'), custom('c')]}
                            onActiveTabChange={changes}
                            {...props}
                        />
                    </ThemeProvider>
                </React.StrictMode>,
            ),
        );
    }
    function tab(title: string) {
        const item = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
            (node) => node.textContent === title,
        );
        expect(item, `tab ${title}`).toBeDefined();
        return item!;
    }
    function click(title: string) {
        act(() => tab(title).click());
    }
    function selected() {
        return container.querySelector('[role="tab"][aria-selected="true"]')?.textContent;
    }
    function panel() {
        return container.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')!;
    }

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        changes.mockClear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
    });

    it('honors the initial default, follows preferred changes, and locks after manual selection', () => {
        render({defaultActiveTab: 'a', preferredActiveTab: 'b'});
        expect(selected()).toBe('a');
        expect(changes).not.toHaveBeenCalled();
        render({defaultActiveTab: 'a', preferredActiveTab: 'b'});
        expect(selected()).toBe('a');
        render({preferredActiveTab: 'c'});
        expect(selected()).toBe('c');
        expect(changes.mock.calls).toEqual([['c']]);
        click('b');
        render({preferredActiveTab: 'a'});
        expect(selected()).toBe('b');
        expect(changes.mock.calls).toEqual([['c'], ['b']]);
    });
    it('locks even when the active tab is selected with the keyboard', () => {
        render({preferredActiveTab: 'a'});
        act(() =>
            tab('a').dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}),
            ),
        );
        render({preferredActiveTab: 'b'});
        expect(selected()).toBe('a');
        expect(changes).not.toHaveBeenCalled();
    });
    it('uses accessible tab and panel associations and keyboard navigation', () => {
        render();
        const first = tab('a');
        expect(first.getAttribute('aria-controls')).toBe(panel().id);
        expect(panel().getAttribute('aria-labelledby')).toBe(first.id);
        act(() => {
            first.focus();
            first.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'ArrowRight',
                    code: 'ArrowRight',
                    bubbles: true,
                }),
            );
        });
        expect(document.activeElement).toBe(tab('b'));
        act(() =>
            tab('b').dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}),
            ),
        );
        expect(selected()).toBe('b');
        expect(container.querySelectorAll('[role="tabpanel"][hidden]')).toHaveLength(2);
    });
    it('follows a preferred tab when it becomes available, but retains a valid selection when it disappears', () => {
        render({tabs: [custom('a')], preferredActiveTab: 'b'});
        expect(selected()).toBe('a');
        render({preferredActiveTab: 'b'});
        expect(selected()).toBe('b');
        render({preferredActiveTab: 'missing'});
        expect(selected()).toBe('b');
    });
    it('falls back after removal/disable without restoring automatic navigation', () => {
        render();
        click('b');
        render({
            tabs: [custom('a'), {...custom('b'), disabled: true}, custom('c')],
            preferredActiveTab: 'c',
        });
        expect(selected()).toBe('c');
        render({preferredActiveTab: 'a'});
        expect(selected()).toBe('c');
        render({tabs: [custom('a')], preferredActiveTab: 'missing'});
        expect(selected()).toBe('a');
        expect(changes.mock.calls).toEqual([['b'], ['c'], ['a']]);
    });
    it('handles empty/all-disabled tabs and ignores invalid IDs', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        render({tabs: [custom(''), custom('a'), custom('a'), {...custom('b'), disabled: true}]});
        expect(container.querySelectorAll('[role="tab"]')).toHaveLength(2);
        expect(warn).toHaveBeenCalled();
        click('b');
        expect(selected()).toBe('a');
        render({tabs: [{...custom('a'), disabled: true}], emptyContent: <div>Unavailable</div>});
        expect(selected()).toBeUndefined();
        expect(container.textContent).toContain('Unavailable');
        render({tabs: []});
        expect(container.textContent).toContain('No available tabs');
        expect(changes).not.toHaveBeenCalled();
        render({tabs: [custom('b')]});
        expect(changes.mock.calls).toEqual([['b']]);
    });
    it('leaves controlled selection to its parent and falls back without callbacks', () => {
        render({activeTab: 'b', preferredActiveTab: 'a'});
        click('c');
        expect(selected()).toBe('b');
        expect(changes.mock.calls).toEqual([['c']]);
        render({activeTab: 'c'});
        expect(selected()).toBe('c');
        render({activeTab: 'missing', preferredActiveTab: 'c'});
        expect(selected()).toBe('a');
        expect(changes.mock.calls).toEqual([['c']]);
    });
    it('requests controlled keyboard selection once and cancels the native button click', () => {
        render({activeTab: 'a'});
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
            cancelable: true,
        });
        act(() => tab('b').dispatchEvent(event));
        expect(event.defaultPrevented).toBe(true);
        expect(changes.mock.calls).toEqual([['b']]);
        expect(selected()).toBe('a');
    });

    it('mounts lazily and keeps state through reorder, rename and disabling', () => {
        render();
        expect(container.querySelectorAll('[data-active]')).toHaveLength(1);
        act(() => panel().querySelector('button')!.click());
        click('b');
        expect(container.querySelectorAll('[data-active]')).toHaveLength(2);
        expect(container.querySelector('[hidden] [data-active="false"]')).not.toBeNull();
        render({tabs: [custom('b'), {...custom('a'), title: 'Renamed', disabled: true}]});
        render({tabs: [custom('b'), {...custom('a'), title: 'Renamed'}]});
        click('Renamed');
        expect(panel().textContent).toContain('Count 1');
        render({tabs: [custom('b')]});
        render({tabs: [custom('a'), custom('b')]});
        click('a');
        expect(panel().textContent).toContain('Count 0');
    });
    it('remounts changed types and resets on a new execution', () => {
        render();
        act(() => panel().querySelector('button')!.click());
        const chart: QueryExecutionTab = {
            ...custom('a'),
            type: 'charts',
            renderContent: () => <Counter />,
        };
        render({tabs: [chart]});
        expect(panel().textContent).toContain('Count 0');
        render({preferredActiveTab: 'b'}, 'new-execution');
        expect(selected()).toBe('b');
        expect(changes).not.toHaveBeenCalled();
    });
    it('computes severity across the tree and changes the title without remounting Info', () => {
        const info = (severity: 'info' | 'warning' | 'error'): QueryExecutionTab => ({
            id: 'messages',
            type: 'info',
            props: {
                root: {
                    id: 'root',
                    severity: 'info',
                    message: 'root',
                    children: [{id: 'child', severity, message: 'child'}],
                },
            },
        });
        render({tabs: [info('info')]});
        act(() => panel().querySelector('button')!.click());
        render({tabs: [info('warning')]});
        expect(selected()).toBe('Warning');
        render({tabs: [info('error')]});
        expect(selected()).toBe('Error');
        expect(panel().textContent).toContain('Count 1');
        expect(changes).not.toHaveBeenCalled();
        render({tabs: [{id: 'messages', type: 'info'}]});
        expect(selected()).toBe('Info');
        expect(panel().textContent).toContain('No messages');
        expect(getMessagesSeverity()).toBe('info');
    });
    it('renders multiple result/chart tabs in array order and pauses hidden progress', () => {
        const tabs: QueryExecutionTab[] = [
            {
                id: 'result/1',
                type: 'result',
                title: 'Second',
                props: {columns: [], rows: [{id: 1}]},
            },
            {id: 'result/0', type: 'result', title: 'First', props: {columns: [], rows: []}},
            {id: 'p', type: 'progress', props: {graphProps: {nodes: [], edges: []}}},
            {id: 'chart/0', type: 'charts', renderContent: () => <Counter />},
            {id: 'chart/1', type: 'charts', title: 'Chart 2', renderContent: () => <Counter />},
        ];
        render({tabs});
        expect(
            Array.from(container.querySelectorAll('[role="tab"]'), (node) => node.textContent),
        ).toEqual(['Second', 'First', 'Progress', 'Charts', 'Chart 2']);
        expect(panel().textContent).toContain('Rows: 1');
        click('First');
        expect(panel().textContent).toContain('Rows: 0');
        click('Progress');
        expect(container.querySelector('[data-progress="true"]')).not.toBeNull();
        click('Charts');
        expect(container.querySelector('[data-progress="false"]')).not.toBeNull();
        act(() => panel().querySelector('button')!.click());
        click('Chart 2');
        expect(panel().textContent).toContain('Count 0');
        click('Charts');
        expect(panel().textContent).toContain('Count 1');
    });
    it('preserves visited content through loading and retry, and pauses hidden content', () => {
        const onRetry = vi.fn();
        render();
        act(() => panel().querySelector('button')!.click());
        render({loading: true, error: true, onRetry});
        expect(container.querySelector('[role="status"]')).not.toBeNull();
        expect(container.querySelector('[role="alert"]')).toBeNull();
        expect(panel()).toBeNull();
        expect(container.querySelector('[data-active="false"]')).not.toBeNull();
        expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
        render({error: true, onRetry});
        expect(container.querySelector('[role="alert"]')?.textContent).toContain('Error loading');
        act(() => container.querySelector<HTMLButtonElement>('[role="alert"] button')!.click());
        expect(onRetry).toHaveBeenCalledOnce();
        render();
        expect(panel().textContent).toContain('Count 1');
        expect(selected()).toBe('a');
        expect(changes).not.toHaveBeenCalled();
    });
    it('does not mount unvisited content while loading', () => {
        const renderContent = vi.fn(() => <Counter />);
        const tabs: QueryExecutionTab[] = [
            {id: 'result', type: 'custom', title: 'Result', renderContent},
        ];
        render({tabs, loading: true});
        expect(renderContent).not.toHaveBeenCalled();
        render({tabs});
        expect(renderContent).toHaveBeenCalled();
        expect(panel().textContent).toContain('Count 0');
    });
    it('renders metadata and delegates expand/close without remounting content', () => {
        const onClose = vi.fn();
        const onExpandedChange = vi.fn();
        render({
            execution: {startedAt: '12:00', author: <a href="/user">admin</a>},
            onClose,
            onExpandedChange,
        });
        act(() => panel().querySelector('button')!.click());
        act(() =>
            container.querySelector<HTMLButtonElement>('[aria-label="Expand panel"]')!.click(),
        );
        expect(onExpandedChange).toHaveBeenCalledWith(true);
        render({expanded: true, onClose, onExpandedChange});
        expect(panel().textContent).toContain('Count 1');
        act(() =>
            container.querySelector<HTMLButtonElement>('[aria-label="Collapse panel"]')!.click(),
        );
        expect(onExpandedChange).toHaveBeenLastCalledWith(false);
        act(() =>
            container.querySelector<HTMLButtonElement>('[aria-label="Close panel"]')!.click(),
        );
        expect(onClose).toHaveBeenCalledOnce();
    });
});
