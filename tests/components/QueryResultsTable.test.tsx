// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {QueryResultsTable} from '../../src/components/QueryResultsTable';
import {QueryResults} from '../../src/modules/QueryResults';
import type {QueryResultsTableProps} from '../../src/types/queryResults';

const copied = vi.hoisted(() => vi.fn());
vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    return {
        ...actual,
        ClipboardButton: ({text, 'aria-label': label}: {text: string; 'aria-label': string}) => (
            <button aria-label={label} onClick={() => copied(text)}>
                Copy
            </button>
        ),
    };
});
type Row = {value: unknown};
const columns: QueryResultsTableProps<Row>['columns'] = [
    {name: 'value', type: ['DataType', 'Utf8']},
];
const initialRows = [{value: 'hello'}];
const incomplete = () => ({isIncomplete: true});
function deferred() {
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return {promise, resolve, reject};
}

describe('QueryResults standard cells', () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        copied.mockClear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });
    const button = (name: string) =>
        Array.from(container.querySelectorAll('button')).find(
            (node) => (node.getAttribute('aria-label') ?? node.textContent) === name,
        );
    function render(props: Partial<QueryResultsTableProps<Row>> = {}, module = false) {
        act(() =>
            root.render(
                <React.StrictMode>
                    <ThemeProvider>
                        {module ? (
                            <QueryResults columns={columns} rows={initialRows} {...props} />
                        ) : (
                            <QueryResultsTable
                                columns={columns}
                                rows={initialRows}
                                stickyHead={false}
                                {...props}
                            />
                        )}
                    </ThemeProvider>
                </React.StrictMode>,
            ),
        );
    }
    async function click(name: string) {
        expect(button(name)).toBeDefined();
        await act(async () => {
            button(name)!.click();
        });
    }
    it.each([5, 8, 9])(
        'collapses %i lines at threshold eight and preserves copy',
        async (lines) => {
            const value = Array.from({length: lines}, (_, i) => `line ${i}`).join('\n');
            const preview = vi.fn();
            render({
                rows: [{value}],
                maxVisibleLines: 5,
                collapseAfterLines: 8,
                onCellPreview: preview,
            });
            expect(Boolean(button('Show more'))).toBe(lines > 8);
            await click('Copy');
            const original = copied.mock.calls[0][0];
            expect(original).toContain('line 0');
            expect(original).toContain(`line ${lines - 1}`);
            if (lines > 8) {
                await click('Show more');
                expect(button('Show less')?.getAttribute('aria-expanded')).toBe('true');
                await click('Copy');
                expect(copied.mock.calls[1][0]).toBe(original);
                await click('Show less');
            }
            expect(preview).not.toHaveBeenCalled();
        },
    );
    it.each(['', 'href override'])(
        'copies literal override %j through QueryResults',
        async (copyText) => {
            render({getCellOptions: () => ({copyText})}, true);
            await click('Copy');
            expect(copied).toHaveBeenCalledWith(copyText);
        },
    );
    it('shows incomplete warning without a dead action and hides copy', () => {
        render({getCellOptions: incomplete});
        expect(container.textContent).toContain('Value is incomplete');
        expect(button('Copy')).toBeUndefined();
        expect(button('Preview')).toBeUndefined();
    });
    it('keeps copy available when omitted null fields bring a struct below the list limit', async () => {
        render({
            rows: [{value: [[], 'hello']}],
            columns: [
                {
                    name: 'value',
                    type: [
                        'StructType',
                        [
                            ['missing', ['OptionalType', ['DataType', 'String']]],
                            ['present', ['DataType', 'String']],
                        ],
                    ],
                },
            ],
            formatterSettings: {maxListSize: 1},
            onCellPreview: vi.fn(),
        });

        expect(container.textContent).not.toContain('Value is incomplete');
        expect(button('Preview')).toBeUndefined();
        await click('Copy');
        expect(copied.mock.calls[0][0]).toContain('hello');
    });
    it('replaces incomplete tagged data with warning and passes resolved context', async () => {
        const preview = vi.fn();
        render({
            getCellOptions: () => ({isIncomplete: true, tag: 'image/png'}),
            onCellPreview: preview,
        });
        expect(container.textContent).toContain("Incomplete 'image/png' type");
        expect(container.textContent).not.toContain('hello');
        await click('Preview');
        expect(preview).toHaveBeenCalledWith({
            row: initialRows[0],
            value: 'hello',
            index: 0,
            column: columns[0],
            isIncomplete: true,
            tag: 'image/png',
        });
        expect(container.textContent).toContain('Incomplete');
    });
    it('offers preview and full copy for a complete large placeholder through the module', async () => {
        const preview = vi.fn();
        render({maxInlineTextLength: 3, onCellPreview: preview}, true);
        expect(container.textContent).toContain('too large');
        await click('Preview');
        expect(preview.mock.calls[0][0].isIncomplete).toBe(false);
        await click('Copy');
        expect(copied.mock.calls[0][0]).toContain('hello');
    });
    it('locks synchronously against double clicks and retries rejected promises', async () => {
        const pending = deferred();
        const preview = vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined);
        render({getCellOptions: incomplete, onCellPreview: preview});
        act(() => {
            button('Preview')!.click();
            button('Preview')!.click();
        });
        expect(preview).toHaveBeenCalledTimes(1);
        expect(button('Preview')!.disabled).toBe(true);
        await act(async () => pending.reject(new Error('failed')));
        expect(container.querySelector('[role="alert"]')?.textContent).toContain(
            'Unable to preview',
        );
        await click('Retry preview');
        expect(preview).toHaveBeenCalledTimes(2);
        expect(container.querySelector('[role="alert"]')).toBeNull();
    });
    it('handles synchronous callback throws and supports keyboard focus', async () => {
        render({
            getCellOptions: incomplete,
            onCellPreview: () => {
                throw Error('sync');
            },
        });
        button('Preview')!.focus();
        expect(document.activeElement).toBe(button('Preview'));
        await click('Preview');
        expect(button('Retry preview')).toBeDefined();
    });
    it('preserves a pending preview and its error when equivalent columns are recreated', async () => {
        const pending = deferred();
        const preview = vi.fn().mockReturnValue(pending.promise);
        const rerender = () =>
            render({
                columns: [{name: 'value', type: ['DataType', 'Utf8']}],
                getCellOptions: incomplete,
                onCellPreview: preview,
            });

        rerender();
        await click('Preview');
        rerender();
        expect(button('Preview')?.disabled).toBe(true);
        await click('Preview');
        expect(preview).toHaveBeenCalledTimes(1);
        await act(async () => pending.reject(Error('failed')));
        expect(button('Retry preview')).toBeDefined();
        rerender();
        expect(button('Retry preview')).toBeDefined();
    });
    it('preserves expansion for equivalent types but resets it when the type changes', async () => {
        const rows = [{value: 'one\ntwo\nthree\nfour\nfive\nsix'}];
        const rerender = (type = 'Utf8') =>
            render({rows, columns: [{name: 'value', type: ['DataType', type]}]});

        rerender();
        await click('Show more');
        rerender();
        expect(button('Show less')?.getAttribute('aria-expanded')).toBe('true');
        rerender('String');
        expect(button('Show more')?.getAttribute('aria-expanded')).toBe('false');
    });
    it.each(['resolve', 'reject'] as const)(
        'ignores stale %s after a new row starts another request',
        async (completion) => {
            const old = deferred();
            const next = deferred();
            const preview = vi
                .fn()
                .mockReturnValueOnce(old.promise)
                .mockReturnValueOnce(next.promise);
            render({getCellOptions: incomplete, onCellPreview: preview});
            await click('Preview');
            render({rows: [{value: 'new'}], getCellOptions: incomplete, onCellPreview: preview});
            await click('Preview');
            await act(async () =>
                completion === 'resolve' ? old.resolve() : old.reject(Error('stale')),
            );
            expect(button('Preview')!.disabled).toBe(true);
            expect(container.querySelector('[role="alert"]')).toBeNull();
            await act(async () => next.resolve());
            expect(button('Preview')!.disabled).toBe(false);
        },
    );
    it('accepts loaded props and ignores rejection after unmount', async () => {
        const pending = deferred();
        render({getCellOptions: incomplete, onCellPreview: () => pending.promise});
        await click('Preview');
        render({rows: [{value: 'loaded'}]});
        expect(button('Copy')).toBeDefined();
        expect(button('Preview')).toBeUndefined();
        act(() => root.render(null));
        await act(async () => pending.reject(Error('late')));
        expect(container.textContent).toBe('');
    });
    it('bypasses standard options and invalid value formatting for custom render', () => {
        const options = vi.fn(() => {
            throw Error('must not run');
        });
        render({
            columns: [{...columns[0], render: () => <span>Custom</span>}],
            rows: [{value: Symbol('invalid')}],
            getCellOptions: options,
        });
        expect(container.textContent).toContain('Custom');
        expect(container.querySelector('[role="alert"]')).toBeNull();
        expect(options).not.toHaveBeenCalled();
    });
    it('isolates malformed values within their cell', () => {
        render({columns: [{name: 'value', type: ['UnsupportedType']}], rows: [{value: 'bad'}]});
        expect(container.querySelector('[role="alert"]')?.textContent).toBe(
            'Unable to format value',
        );
    });
});
