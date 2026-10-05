// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NavigationPreview, filterPreviewRows} from '../../src/modules/NavigationPreview';
import {createTableDetailConfig} from '../../src/modules/QueriesNavigation/helpers/createTableDetailConfig';
import type {NavigationPreviewConfig} from '../../src/types/navigation';

const data: NavigationPreviewConfig = {
    columns: [
        {name: 'name', type: ['DataType', 'Utf8']},
        {name: 'count', type: ['DataType', 'Int32']},
    ],
    rows: [
        {name: 'Alpha record', count: 42},
        {name: 'Beta record', count: 7, hidden: 'alpha'},
    ],
};

describe('NavigationPreview integration', () => {
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
    function render(content: React.ReactNode) {
        act(() => root.render(<ThemeProvider>{content}</ThemeProvider>));
    }
    it('searches displayed columns only and restores rows when cleared', () => {
        const show = (search: string, visibleColumns = ['name', 'count']) =>
            render(
                <NavigationPreview data={data} search={search} visibleColumns={visibleColumns} />,
            );
        show(' ALPHA ');
        expect(container.textContent).toContain('Alpha record');
        expect(container.textContent).not.toContain('Beta record');
        show('42', ['name']);
        expect(container.textContent).toContain('Nothing found');
        show('42');
        expect(container.textContent).toContain('Alpha record');
        show('');
        expect(container.textContent).toContain('Beta record');
        expect(container.textContent).toContain('Alpha record');
    });
    it('keeps the default visible columns and accepts controlled visibility updates', () => {
        render(<NavigationPreview data={data} defaultVisibleColumns={['name']} />);
        expect(container.querySelector('thead')?.textContent).toContain('name');
        expect(container.querySelector('thead')?.textContent).not.toContain('count');
        render(<NavigationPreview data={data} visibleColumns={['count']} />);
        expect(container.querySelector('thead')?.textContent).toContain('count');
        expect(container.querySelector('thead')?.textContent).not.toContain('name');
        expect(container.textContent).not.toContain('Alpha record');
    });
    it.each<NavigationPreviewConfig>([
        {
            columns: [{name: 'value', type: ['DataType', 'Utf8']}],
            rows: [{value: {val: 'Alpha record', inc: true}}, {value: {val: 'Beta record'}}],
        },
        {
            columns: [{name: 'value', type: ['ListType', ['DataType', 'Utf8']]}],
            rows: [{value: [{val: 'Alpha record', inc: true}]}, {value: ['Beta record']}],
        },
    ])('searches typed wire values and restores rows when cleared', (wireData) => {
        const show = (search: string) =>
            render(
                <NavigationPreview
                    data={wireData}
                    search={search}
                    view={{formatterSettings: {treatValAsData: true}}}
                />,
            );
        show(' ALPHA ');
        expect(container.textContent).toContain('Alpha record');
        expect(container.textContent).not.toContain('Beta record');
        show('');
        expect(container.textContent).toContain('Beta record');
    });
    it('uses cell formatting settings, ignores copy overrides and isolates invalid values', () => {
        const rows = [{value: ['Alpha record']}, {value: 'invalid list'}];
        const columns: NavigationPreviewConfig['columns'] = [
            {name: 'value', type: ['ListType', ['DataType', 'Utf8']]},
        ];
        const settings = {
            formatterSettings: {maxStringSize: 2},
            getCellOptions: () => ({
                formatterSettings: {maxStringSize: undefined},
                copyText: 'Clipboard only',
            }),
        };
        expect(filterPreviewRows(rows, columns, 'Alpha', settings)).toEqual([rows[0]]);
        expect(filterPreviewRows(rows, columns, 'Clipboard', settings)).toEqual([]);
        expect(filterPreviewRows(data.rows, ['name'], 'Alpha')).toEqual([data.rows[0]]);
    });
    it('shows initial loading, empty data, unmatched search and error states', () => {
        render(<NavigationPreview search="" data={{...data, rows: [], loading: true}} />);
        expect(container.querySelector('.g-skeleton')).not.toBeNull();
        expect(container.textContent).not.toContain('No data');
        render(<NavigationPreview search="" data={{...data, rows: []}} />);
        expect(container.querySelector('.g-skeleton')).toBeNull();
        expect(container.textContent).toContain('No data');
        render(<NavigationPreview data={data} search="missing" />);
        expect(container.textContent).toContain('Nothing found');
        render(<NavigationPreview search="" data={{...data, errorContent: 'Preview failed'}} />);
        expect(container.textContent).toBe('Preview failed');
        expect(container.querySelector('table')).toBeNull();
    });
    it('forwards preview settings and controlled search through the detail factory', async () => {
        const item = {path: '/table', title: 'table'};
        const onCellPreview = vi.fn();
        const resolvePreviewView = vi.fn(() => ({
            getCellOptions: () => ({isIncomplete: true}),
            onCellPreview,
            displayIndices: true,
            stickyHead: false as const,
        }));
        const config = createTableDetailConfig({
            resolvePreview: () => data,
            resolvePreviewView,
        })(item);
        const tab = config.tabs.find(({id}) => id === 'preview');
        const onSearchUpdate = vi.fn();
        render(
            tab?.renderContent?.({search: 'Beta', onSearchUpdate, searchPlaceholder: 'Find rows'}),
        );
        expect(resolvePreviewView).toHaveBeenCalledWith(item);
        expect(container.querySelector('input')?.placeholder).toBe('Find rows');
        expect(container.querySelector('input')?.value).toBe('Beta');
        expect(container.textContent).not.toContain('Alpha record');
        const preview = container.querySelector<HTMLButtonElement>('[aria-label="Preview"]');
        expect(preview).not.toBeNull();
        await act(async () => preview?.click());
        expect(onCellPreview.mock.calls[0][0].row).toBe(data.rows[1]);
        const input = container.querySelector('input');
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                'Alpha',
            );
            input?.dispatchEvent(new Event('input', {bubbles: true}));
        });
        expect(onSearchUpdate).toHaveBeenLastCalledWith('Alpha');
    });
});
