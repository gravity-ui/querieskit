// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryResults} from '../../src/modules/QueryResults';
import type {QueryResultsProps} from '../../src/types/queryResults';

type Row = {first: string; second: string};
const columns: QueryResultsProps<Row>['columns'] = [
    {name: 'first', type: ['DataType', 'Utf8']},
    {name: 'second', type: ['DataType', 'Utf8']},
];

describe('QueryResults controls', () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });
    function render(props: Partial<QueryResultsProps<Row>> = {}) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryResults
                        columns={columns}
                        rows={[{first: 'alpha', second: 'beta'}]}
                        displayIndices={false}
                        stickyHead={false}
                        {...props}
                    />
                </ThemeProvider>,
            ),
        );
    }
    const button = (label: string) =>
        Array.from(document.querySelectorAll('button')).find(
            (node) => node.getAttribute('aria-label') === label || node.textContent === label,
        );
    it('preserves selected order, ignores missing IDs and keeps the full schema', () => {
        const onChange = vi.fn();
        const columnVisibility = {value: ['second', 'missing', 'first', 'second'], onChange};
        render({columnVisibility});
        expect(container.querySelector('thead')?.textContent).toBe('secondfirst');
        expect(onChange).not.toHaveBeenCalled();
        render({columnVisibility, view: 'schema'});
        expect(container.textContent).toContain('first');
        expect(container.textContent).toContain('second');
        expect(button('Configure visible fields')).toBeUndefined();
        expect(onChange).not.toHaveBeenCalled();
    });
    it('distinguishes an empty selection from all current columns', () => {
        const onChange = vi.fn();
        render({columnVisibility: {value: [], onChange}});
        expect(container.textContent).not.toContain('alpha');
        expect(container.textContent).not.toContain('beta');
        render({columns: columns.slice(0, 1), columnVisibility: {onChange}});
        expect(container.textContent).toContain('alpha');
        render({columnVisibility: {onChange}});
        expect(container.textContent).toContain('beta');
        render({columns: columns.slice(0, 1), columnVisibility: {value: ['second'], onChange}});
        expect(container.textContent).not.toContain('alpha');
        render({columnVisibility: {value: ['second'], onChange}});
        expect(container.textContent).toContain('beta');
        expect(onChange).not.toHaveBeenCalled();
    });
    it('loads only on demand, blocks while loading and retains rows and custom actions', () => {
        const onLoadMore = vi.fn();
        const pagination = {hasMore: true, onLoadMore, buttonLabel: 'Next page'};
        render({pagination, totalRows: 100, actions: <span>Download</span>});
        act(() => button('Next page')!.click());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        render({pagination: {...pagination, loading: true}});
        expect(button('Next page')?.disabled).toBe(true);
        act(() => button('Next page')!.click());
        expect(onLoadMore).toHaveBeenCalledTimes(1);
        expect(container.textContent).toContain('alpha');
        render({pagination: {...pagination, hasMore: false}, totalRows: 100});
        expect(button('Next page')).toBeUndefined();
        render({pagination, view: 'schema'});
        expect(button('Next page')).toBeUndefined();
    });
    it('applies visibility only after explicit Apply', () => {
        const onChange = vi.fn();
        render({columnVisibility: {onChange, buttonLabel: 'Choose columns'}});
        act(() => button('Choose columns')!.click());
        const checkbox = document.querySelector<HTMLElement>(
            '[role="checkbox"][aria-label="first"]',
        );
        expect(checkbox).not.toBeNull();
        act(() => checkbox!.click());
        expect(onChange).not.toHaveBeenCalled();
        act(() => button('Apply')!.click());
        expect(onChange).toHaveBeenCalledWith(['second']);
    });
});
