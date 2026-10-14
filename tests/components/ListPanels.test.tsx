// @vitest-environment jsdom
import React, {act, useState} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueriesHistory} from '../../src/modules/QueriesHistory';
import {SavedQueries} from '../../src/modules/SavedQueries';
import {TutorialsHistory} from '../../src/modules/TutorialsHistory';
import {QueriesList} from '../../src/modules/QueriesList';
import {RowsList} from '../../src/modules/RowsList';
import {HistoryHeader} from '../../src/modules/HistoryHeader';
import {HistoryLayout} from '../../src/modules/HistoryLayout';
import {EmptyContent} from '../../src/components/EmptyContent';
import type {QueryListFilterConfig, QueryListSearchConfig} from '../../src/types/queryList';

// The filter popup imports date-picker CSS outside Vitest's pipeline.
vi.mock('../../src/components/HistoryFilter', () => ({HistoryFilter: () => null}));
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: () => null,
    MonacoLanguage: {YQL: 'yql'},
}));

const search = {onUpdate: vi.fn()};
const noopRow = () => null;
const modules = [
    {Component: QueriesHistory, title: 'No queries', hidesSearch: true},
    {Component: SavedQueries, title: 'No saved queries', hidesSearch: true},
    {Component: TutorialsHistory, title: 'No tutorials', hidesSearch: false},
];

describe('shared list panels', () => {
    let container: HTMLDivElement;
    let root: Root;
    const render = (content: React.ReactNode) =>
        act(() => {
            root.render(<ThemeProvider>{content}</ThemeProvider>);
        });
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

    it.each(modules)(
        '$title: keeps uncontrolled search available after no results',
        ({Component}) => {
            const onUpdate = vi.fn<QueryListSearchConfig['onUpdate']>();
            const Example = () => {
                const [value, setValue] = useState('');
                return (
                    <Component
                        items={value ? [] : [{header: 'Results', height: 28}]}
                        renderRowItem={() => <span>Result row</span>}
                        search={{
                            onUpdate: (data) => {
                                onUpdate(data);
                                setValue(data.value);
                            },
                        }}
                    />
                );
            };
            render(<Example />);
            const updateInput = (value: string) => {
                const input = container.querySelector('input');
                expect(input).not.toBeNull();
                const setValue = Object.getOwnPropertyDescriptor(
                    HTMLInputElement.prototype,
                    'value',
                )?.set;
                if (!input || !setValue) throw new Error('Search input is unavailable');
                act(() => {
                    setValue.call(input, value);
                    input.dispatchEvent(new Event('input', {bubbles: true}));
                });
            };
            const toggle = container.querySelector('button[aria-label="Search in query text"]');
            act(() => toggle?.dispatchEvent(new MouseEvent('click', {bubbles: true})));
            updateInput('missing');
            expect(container.textContent).toContain('Nothing found');
            expect(container.querySelector('input')?.value).toBe('missing');
            expect(onUpdate).toHaveBeenLastCalledWith({value: 'missing', fullSearch: true});
            updateInput('still missing');
            expect(onUpdate).toHaveBeenLastCalledWith({value: 'still missing', fullSearch: true});
            updateInput('');
            expect(container.querySelector('.qp-empty-content')).toBeNull();
            expect(container.querySelector('input')?.value).toBe('');
            expect(onUpdate).toHaveBeenLastCalledWith({value: '', fullSearch: true});
        },
    );

    it.each(modules)(
        '$title: distinguishes an empty catalogue from filtered results and loading',
        ({Component, title, hidesSearch}) => {
            const show = (filter?: QueryListFilterConfig, value = '', loading = false) =>
                render(
                    <Component
                        items={[]}
                        search={{...search, value}}
                        filter={filter}
                        loading={loading}
                    />,
                );
            show({isChanged: false});
            expect(container.textContent).toContain(title);
            expect(container.textContent).not.toContain('Nothing found');
            expect(Boolean(container.querySelector('input'))).toBe(!hidesSearch);

            show(undefined, '   ');
            expect(container.textContent).toContain(title);
            show(undefined, 'select');
            expect(container.textContent).toContain('Nothing found');
            expect(container.querySelector('input')).not.toBeNull();
            show({isChanged: true});
            expect(container.textContent).toContain('Nothing found');
            expect(container.querySelector('input')).not.toBeNull();

            show(undefined, '', true);
            expect(container.querySelector('.qp-list-spinner')).not.toBeNull();
            expect(container.querySelector('.qp-empty-content')).toBeNull();
            expect(container.querySelector('input')).not.toBeNull();
        },
    );

    it('respects explicit null and custom empty content while keeping legacy fallbacks', () => {
        render(<RowsList items={[]} renderRow={noopRow} emptyContent={null} />);
        expect(container.querySelector('.qp-empty-content')).toBeNull();
        render(
            <RowsList
                items={[]}
                renderRow={noopRow}
                emptyContent={<p>Custom</p>}
                showFiltersHint
            />,
        );
        expect(container.textContent).toBe('Custom');
        render(<RowsList items={[]} renderRow={noopRow} showFiltersHint />);
        expect(container.textContent).toContain('Nothing found');
        render(<RowsList items={[]} renderRow={noopRow} />);
        expect(container.textContent).toContain('No files');
    });

    it('preserves the default QueriesList appearance and supports panel empty overrides', () => {
        render(
            <QueriesList title="List" items={[]} search={search} renderRow={noopRow} filter={{}} />,
        );
        expect(container.querySelector('.qp-queries-list_panel')).toBeNull();
        expect(container.querySelector('.qp-history-layout__controls')).toBeNull();
        expect(container.querySelector('input')?.getAttribute('placeholder')).toBeNull();
        expect(container.textContent).toContain('Nothing found');
        render(
            <QueriesList
                variant="panel"
                title="List"
                items={[]}
                search={search}
                renderRow={noopRow}
                filter={{}}
            />,
        );
        expect(container.textContent).toContain('No data');
        render(
            <QueriesList
                variant="panel"
                title="List"
                items={[]}
                search={search}
                renderRow={noopRow}
                emptyContent={null}
            />,
        );
        expect(container.querySelector('.qp-empty-content')).toBeNull();
        render(
            <QueriesList
                variant="panel"
                title="List"
                items={[]}
                search={{...search, value: 'query'}}
                renderRow={noopRow}
                emptyContent={null}
            />,
        );
        expect(container.textContent).toContain('Nothing found');
    });

    it('keeps the tutorials alias equivalent to panel and retains search mode interactions', () => {
        const onUpdate = vi.fn<QueryListSearchConfig['onUpdate']>();
        for (const variant of ['panel', 'tutorials'] as const) {
            render(
                <HistoryLayout
                    variant={variant}
                    title="Title"
                    header={<HistoryHeader variant={variant} search="select" onUpdate={onUpdate} />}
                >
                    <div>Body</div>
                </HistoryLayout>,
            );
            expect(container.querySelector('.qp-history-layout__controls')).not.toBeNull();
            expect(container.querySelector('input')?.placeholder).toBe('Search');
            const toggle = container.querySelector('button[aria-label="Search in query text"]');
            expect(toggle?.classList.contains('g-button_view_flat-secondary')).toBe(true);
            act(() => toggle?.dispatchEvent(new MouseEvent('click', {bubbles: true})));
            expect(onUpdate).toHaveBeenLastCalledWith({value: 'select', fullSearch: true});
            render(null);
        }
    });

    it('allows placeholder text overrides including an explicitly hidden description', () => {
        render(<EmptyContent variant="nothing-found" title="Custom title" description={null} />);
        expect(container.textContent).toBe('Custom title');
        render(<EmptyContent variant="nothing-found" />);
        expect(container.textContent).toContain('Try to change filters');
    });
});
