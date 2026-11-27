// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {SearchRowLayout} from '../../src/components/SearchRowLayout';
import {HistorySearchRow} from '../../src/modules/HistorySearchRow';
import type {QueryHistoryRow} from '../../src/types/history';
import type {MonacoEditorProps} from '../../src/types/monacoEditor';

vi.mock('@gravity-ui/uikit', () => ({
    Flex: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    Text: ({children}: {children: React.ReactNode}) => <span>{children}</span>,
}));
vi.mock('../../src/components/QueryStatusIcon', () => ({QueryStatusIcon: () => null}));
vi.mock('../../src/components/HistoryPrivateIcon', () => ({HistoryPrivateIcon: () => null}));
vi.mock('../../src/components/QueryDuration', () => ({QueryDuration: () => null}));
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: ({value, monacoConfig}: MonacoEditorProps) => (
        <div data-testid="editor">
            <pre>{value}</pre>
            <span data-testid="numbers">
                {value
                    .split('\n')
                    .map((_, index) =>
                        typeof monacoConfig?.lineNumbers === 'function'
                            ? monacoConfig.lineNumbers(index + 1)
                            : String(index + 1),
                    )
                    .join(',')}
            </span>
        </div>
    ),
}));

const query = Array.from({length: 20}, (_, index) => `SELECT ${index + 1};`).join('\n');

describe('SearchRowLayout preview', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    const preview = () => container.querySelector('pre')?.textContent;
    const numbers = () => container.querySelector('[data-testid="numbers"]')?.textContent;

    it('preserves the existing first-four-lines preview without a position', async () => {
        await act(async () => {
            root.render(<SearchRowLayout header="Query" query={query} language="sql" />);
        });
        expect(preview()).toBe('SELECT 1;\nSELECT 2;\nSELECT 3;\nSELECT 4;');
        expect(numbers()).toBe('1,2,3,4');
    });

    it('passes the history position through and updates text and original line numbers', async () => {
        const item: QueryHistoryRow = {
            id: 1,
            title: 'Query',
            height: 100,
            status: 'completed',
            query,
            previewLineNumber: 12,
        };
        await act(async () => {
            root.render(<HistorySearchRow item={item} />);
        });
        expect(preview()).toBe('SELECT 11;\nSELECT 12;\nSELECT 13;\nSELECT 14;');
        expect(numbers()).toBe('11,12,13,14');
        const editor = container.querySelector('[data-testid="editor"]');
        await act(async () => {
            root.render(<HistorySearchRow item={{...item, previewLineNumber: 20}} />);
        });
        expect(preview()).toBe('SELECT 17;\nSELECT 18;\nSELECT 19;\nSELECT 20;');
        expect(numbers()).toBe('17,18,19,20');
        expect(container.querySelector('[data-testid="editor"]')).toBe(editor);
        expect(item.query).toBe(query);
        await act(async () => {
            root.render(<HistorySearchRow item={{...item, previewLineNumber: undefined}} />);
        });
        expect(numbers()).toBe('1,2,3,4');
        expect(preview()).toBe('SELECT 1;\nSELECT 2;\nSELECT 3;\nSELECT 4;');
    });

    it('updates line numbers even when the next fragment has identical text', async () => {
        const repeatedQuery = Array.from({length: 20}, () => 'SELECT 1;').join('\n');
        const render = async (position: number) => {
            await act(async () => {
                root.render(
                    <SearchRowLayout
                        header="Query"
                        query={repeatedQuery}
                        language="sql"
                        previewLineNumber={position}
                    />,
                );
            });
        };
        await render(2);
        const text = preview();
        expect(numbers()).toBe('1,2,3,4');
        await render(12);
        expect(preview()).toBe(text);
        expect(numbers()).toBe('11,12,13,14');
    });
});
