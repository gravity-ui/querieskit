// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {QueryResults} from '../../src/modules/QueryResults';
import {QueryExecutionPanel} from '../../src/widgets/QueryExecutionPanel';
import type {QueryResultsProps} from '../../src/types/queryResults';

type Row = Record<string, unknown>;
const columns: QueryResultsProps<Row>['columns'] = [
    {name: 'name', type: ['DataType', 'String']},
    {name: 'count', type: ['OptionalType', ['DataType', 'Int64']]},
    {name: 'ratio', type: ['OptionalType', ['DataType', 'Float']]},
];
const nested = (name: string) => ({name, children: [{type: {name: 'Leaf'}}]});

describe('QueryResults Schema integration', () => {
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
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
    function render(props: Partial<QueryResultsProps<Row>> = {}, panel = false) {
        const allProps: QueryResultsProps<Row> = {
            columns,
            rows: [],
            defaultView: 'schema',
            ...props,
        };
        act(() =>
            root.render(
                <ThemeProvider>
                    {panel ? (
                        <QueryExecutionPanel
                            tabs={[{id: 'result', type: 'result', props: allProps}]}
                        />
                    ) : (
                        <QueryResults {...allProps} />
                    )}
                </ThemeProvider>,
            ),
        );
    }
    const rows = () => Array.from(container.querySelectorAll('.data-table__box tbody tr'));
    const toggles = () =>
        Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'));

    it('shows the acceptance columns with indices from one and separate optional text without result rows', () => {
        render();
        expect(rows().map((row) => row.children[0].textContent)).toEqual(['1', '2', '3']);
        expect(rows().map((row) => row.children[1].textContent)).toEqual([
            'name',
            'count',
            'ratio',
        ]);
        expect(rows()[0].children[2].textContent).toContain('String');
        expect(rows()[1].children[2].textContent).toContain('Int64');
        expect(rows()[2].children[2].textContent).toContain('Float');
        expect(
            rows()[1].children[2].querySelector('.qp-query-result-schema-type__modifier')
                ?.textContent,
        ).toBe('optional');
        expect(rows()[1].children[2].textContent).toContain('optional');
        expect(container.querySelector('.data-table_striped-rows')).not.toBeNull();
        expect(container.querySelector('.data-table__sticky_head')).not.toBeNull();
        expect(container.querySelector('[class*="sort-icon"]')).toBeNull();
    });
    it('forwards table appearance settings, including explicit disable and fixed header', () => {
        render({displayIndices: false, stripedRows: false, stickyHead: false});
        expect(rows()[0].children.length).toBe(2);
        expect(container.querySelector('.data-table_striped-rows')).toBeNull();
        expect(container.querySelector('.data-table__sticky_head')).toBeNull();
        render({displayIndices: true, stripedRows: true, stickyHead: 'fixed'});
        expect(rows()[0].children.length).toBe(3);
        expect(container.querySelector('.data-table__sticky_head')).not.toBeNull();
    });
    it('tracks toolbar height and observes table content for sticky header synchronization', () => {
        const observers = new Map<Element, ResizeObserverCallback>();
        vi.stubGlobal(
            'ResizeObserver',
            class {
                private callback: ResizeObserverCallback;
                constructor(callback: ResizeObserverCallback) {
                    this.callback = callback;
                }
                observe = (element: Element) => observers.set(element, this.callback);
                unobserve = (element: Element) => observers.delete(element);
                disconnect = () => {
                    for (const [element, callback] of observers) {
                        if (callback === this.callback) observers.delete(element);
                    }
                };
            },
        );
        let height = 40;
        const original = HTMLElement.prototype.getBoundingClientRect;
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
            const rect = original.call(this);
            return this.classList.contains('qp-query-results__toolbar') ? {...rect, height} : rect;
        });
        render();
        const toolbar = container.querySelector('.qp-query-results__toolbar') as HTMLElement;
        const table = container.querySelector('.data-table__box table') as HTMLElement;
        const head = () => container.querySelector<HTMLElement>('.data-table__sticky_head');
        expect(observers.has(toolbar)).toBe(true);
        expect(observers.has(table)).toBe(true);
        expect(head()?.style.top).toBe('40px');
        height = 72;
        act(() => observers.get(toolbar)?.([], {} as ResizeObserver));
        expect(head()?.style.top).toBe('72px');
        render({stickyHead: false});
        expect(observers.has(toolbar)).toBe(false);
        expect(observers.has(table)).toBe(false);
    });
    it('preserves expansion on equivalent rerender and resets only the replaced schema row', () => {
        const makeColumns = (first = 'Record') => [
            {...columns[0], schemaType: nested(first)},
            {...columns[1], schemaType: nested('Neighbor')},
        ];
        render({columns: makeColumns(), stickyHead: false});
        act(() => {
            toggles()[0].click();
            toggles()[1].click();
        });
        expect(toggles().map((button) => button.getAttribute('aria-expanded'))).toEqual([
            'false',
            'false',
        ]);
        render({columns: makeColumns(), stickyHead: false});
        expect(toggles().map((button) => button.getAttribute('aria-expanded'))).toEqual([
            'false',
            'false',
        ]);
        render({columns: makeColumns('Replacement'), stickyHead: false});
        expect(toggles().map((button) => button.getAttribute('aria-expanded'))).toEqual([
            'true',
            'false',
        ]);
    });
    it('prefers neutral schemaType and preserves React headers and textual titles', () => {
        render({
            columns: [
                {
                    ...columns[0],
                    schemaType: {name: 'ApplicationType'},
                    header: <strong>Custom header</strong>,
                },
                {...columns[1], header: 'A very long column title'},
            ],
        });
        expect(rows()[0].querySelector('strong')?.textContent).toBe('Custom header');
        expect(rows()[0].children[2].textContent).toBe('ApplicationType');
        expect(rows()[1].querySelector('[title]')?.getAttribute('title')).toBe(
            'A very long column title',
        );
        expect(container.textContent).not.toContain('[object Object]');
    });
    it('resets expansion when a null parameter becomes a non-finite number', () => {
        const column = {...columns[0], schemaType: {...nested('Custom'), parameters: [null]}};
        render({columns: [column], stickyHead: false});
        act(() => toggles()[0].click());
        render({
            columns: [{...column, schemaType: {...column.schemaType, parameters: [Infinity]}}],
            stickyHead: false,
        });
        expect(toggles()[0].getAttribute('aria-expanded')).toBe('true');
        expect(container.textContent).toContain('Custom(Infinity)');
    });
    it('keeps custom schema, nullish fallback, loading, empty, and error behavior', () => {
        render({renderSchema: () => <div>Custom schema</div>});
        expect(container.textContent).toContain('Custom schema');
        expect(rows()).toHaveLength(0);
        render({renderSchema: () => null});
        expect(rows()).toHaveLength(3);
        render({renderSchema: () => false});
        expect(rows()).toHaveLength(0);
        render({columns: [], loading: true});
        expect(container.querySelector('.g-skeleton')).not.toBeNull();
        render({columns: [], loading: false});
        expect(container.querySelector('.qp-empty-content')).not.toBeNull();
        render({errorContent: 'Failed to load'});
        expect(container.textContent).toContain('Failed to load');
        expect(rows()).toHaveLength(0);
    });
    it('works inside the real execution panel and supports switching views', () => {
        render({}, true);
        expect(rows()).toHaveLength(3);
        const result = Array.from(container.querySelectorAll<HTMLInputElement>('input')).find(
            (input) => input.value === 'result',
        );
        expect(result).toBeDefined();
        act(() => result?.click());
        expect(container.querySelector('.qp-query-results-schema')).toBeNull();
        const schema = Array.from(container.querySelectorAll<HTMLInputElement>('input')).find(
            (input) => input.value === 'schema',
        );
        act(() => schema?.click());
        expect(rows()).toHaveLength(3);
    });
});
