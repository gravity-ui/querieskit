// @vitest-environment jsdom

import React, {act, useState} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryParameters} from '../../src/modules/QueryParameters/QueryParameters';
import type {QueryParameter, QueryParametersProps} from '../../src/types/queryParameters';
import {setLang} from '../../src/i18n';
import {allTypesParameters} from '../../src/modules/QueryParameters/story/allTypes';
import type {MonacoEditorProps} from '../../src/types/monacoEditor';

vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: ({value, onChange, readOnly, monacoConfig}: MonacoEditorProps) => (
        <textarea
            aria-label={monacoConfig?.ariaLabel}
            tabIndex={monacoConfig?.tabIndex}
            value={value}
            readOnly={readOnly}
            onChange={(event) => onChange?.(event.target.value)}
        />
    ),
}));

const initial: QueryParameter[] = [{id: 'p', name: 'limit', type: {kind: 'Number'}, value: '10'}];

describe('QueryParameters', () => {
    let root: Root;
    let container: HTMLDivElement;
    let onChange: ReturnType<typeof vi.fn<QueryParametersProps['onChange']>>;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        setLang('en');
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addEventListener() {},
                removeEventListener() {},
                addListener() {},
                removeListener() {},
            })),
        );
        vi.stubGlobal(
            'ResizeObserver',
            class {
                public observe() {}
                public unobserve() {}
                public disconnect() {}
            },
        );
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        onChange = vi.fn();
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });
    function render(props: Partial<QueryParametersProps> = {}) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryParameters value={initial} onChange={onChange} {...props} />
                </ThemeProvider>,
            ),
        );
    }
    function controlled(value = initial) {
        function Controlled() {
            const [parameters, setParameters] = useState(value);
            return (
                <QueryParameters
                    value={parameters}
                    onChange={async (next) => {
                        await onChange(next);
                        setParameters(next);
                    }}
                />
            );
        }
        act(() =>
            root.render(
                <ThemeProvider>
                    <Controlled />
                </ThemeProvider>,
            ),
        );
    }
    function button(label: string, scope: ParentNode = container) {
        const result = [...scope.querySelectorAll<HTMLButtonElement>('button')].find(
            (node) =>
                node.getAttribute('aria-label') === label ||
                node.textContent?.trim().endsWith(label),
        );
        if (!result) throw new Error(`Missing button: ${label}`);
        return result;
    }
    function field(label: string) {
        const result = [
            ...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
                'input:not([type="radio"]), textarea',
            ),
        ].find((node) => node.getAttribute('aria-label') === label);
        if (!result) throw new Error(`Missing field: ${label}`);
        return result;
    }
    function change(label: string, value: string) {
        const node = field(label);
        act(() => {
            const prototype =
                node instanceof HTMLTextAreaElement
                    ? HTMLTextAreaElement.prototype
                    : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(node, value);
            node.dispatchEvent(new Event('input', {bubbles: true}));
        });
    }
    async function click(label: string, scope: ParentNode = container) {
        const menuItem = [...scope.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
            (node) => node.textContent?.trim() === label,
        );
        await act(async () => (menuItem || button(label, scope)).click());
    }
    function dialog() {
        const node = document.querySelector<HTMLElement>('[role="dialog"]');
        if (!node) throw new Error('Missing dialog');
        return node;
    }
    async function editMetadata(name: string) {
        await click(`Parameter actions: $${name}`);
        await click('Edit name and type', document);
    }
    function lastValue() {
        const value = onChange.mock.lastCall?.[0];
        if (!value) throw new Error('No saved parameters');
        return value;
    }

    it('shows optional panel controls and requests controlled expansion changes', async () => {
        const onExpandedChange = vi.fn();
        const onClose = vi.fn();
        render();
        expect(container.querySelector('button[aria-label="Expand parameters"]')).toBeNull();
        expect(container.querySelector('button[aria-label="Close parameters"]')).toBeNull();

        render({onExpandedChange});
        expect(button('Expand parameters').getAttribute('aria-pressed')).toBe('false');
        expect(container.querySelector('button[aria-label="Close parameters"]')).toBeNull();
        await click('Expand parameters');
        expect(onExpandedChange).toHaveBeenLastCalledWith(true);
        expect(button('Expand parameters').getAttribute('aria-pressed')).toBe('false');

        render({expanded: true, onExpandedChange});
        expect(button('Collapse parameters').getAttribute('aria-pressed')).toBe('true');
        await click('Collapse parameters');
        expect(onExpandedChange).toHaveBeenLastCalledWith(false);

        render({onClose});
        expect(container.querySelector('button[aria-label="Expand parameters"]')).toBeNull();
        await click('Close parameters');
        expect(onClose).toHaveBeenCalledOnce();
        expect(onChange).not.toHaveBeenCalled();
    });
    it('releases the expanded layout before notifying the parent to close', async () => {
        const onExpandedChange = vi.fn();
        const onClose = vi.fn();
        render({expanded: true, onExpandedChange, onClose});
        await click('Close parameters');
        expect(onExpandedChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(onClose).toHaveBeenCalledOnce();
        expect(onExpandedChange.mock.invocationCallOrder[0]).toBeLessThan(
            onClose.mock.invocationCallOrder[0],
        );

        onExpandedChange.mockClear();
        render({expanded: false, onExpandedChange, onClose});
        await click('Close parameters');
        expect(onExpandedChange).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });
    it.each(['List', 'Dict', 'Variant'] as const)(
        'preserves search, collapse state and invalid %s RAW drafts across expansion',
        async (kind) => {
            const parameter: QueryParameter =
                kind === 'List'
                    ? {
                          id: 'nested',
                          name: 'nested',
                          type: {kind: 'List', item: {kind: 'List', item: {kind: 'String'}}},
                          value: [{id: 'row', value: [{id: 'cell', value: 'hello'}]}],
                      }
                    : kind === 'Dict'
                      ? {
                            id: 'nested',
                            name: 'nested',
                            type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'Number'}},
                            value: [{id: 'entry', key: 'key', value: '10'}],
                        }
                      : {
                            id: 'nested',
                            name: 'nested',
                            type: {
                                kind: 'Variant',
                                options: [{id: 'text', name: 'text', type: {kind: 'String'}}],
                            },
                            value: {optionId: 'text', value: 'hello'},
                        };
            const rawLabel =
                kind === 'List'
                    ? 'RAW: $nested: 1: 1'
                    : kind === 'Dict'
                      ? 'RAW: $nested: 1'
                      : 'RAW: $nested: text';
            const collapseLabel = kind === 'List' ? '$nested: 1' : '$nested';
            const onExpandedChange = vi.fn();
            const props = {value: [parameter], onExpandedChange};
            render(props);
            await click('Edit');
            await click(rawLabel);
            change(rawLabel, 'unfinished RAW');
            const rawField = field(rawLabel);
            await click(`Collapse: ${collapseLabel}`);
            change('Search', 'missing');

            await click('Expand parameters');
            expect(onExpandedChange).toHaveBeenLastCalledWith(true);
            render({...props, expanded: true});
            expect(field('Search').value).toBe('missing');
            expect(field(rawLabel)).toBe(rawField);
            expect(field(rawLabel).value).toBe('unfinished RAW');
            expect(button(`Expand: ${collapseLabel}`).getAttribute('aria-expanded')).toBe('false');
            expect(button('Save').disabled).toBe(true);

            await click('Collapse parameters');
            expect(onExpandedChange).toHaveBeenLastCalledWith(false);
            render({...props, expanded: false});
            expect(field('Search').value).toBe('missing');
            change('Search', '');
            expect(button(`Expand: ${collapseLabel}`).getAttribute('aria-expanded')).toBe('false');
            await click(`Expand: ${collapseLabel}`);
            expect(field(rawLabel)).toBe(rawField);
            expect(field(rawLabel).value).toBe('unfinished RAW');
            expect(button('Save').disabled).toBe(true);
            expect(onChange).not.toHaveBeenCalled();
        },
    );

    it('creates a first parameter with focus and applies the controlled value on Save', async () => {
        controlled([]);
        expect(container.textContent).toContain('No parameters');
        await click('Add parameter');
        expect(document.activeElement).toBe(field('Parameter name 1'));
        change('Parameter name 1', 'message');
        await click('Apply', dialog());
        change('$message', 'hello');
        expect(onChange).not.toHaveBeenCalled();
        await click('Save');
        expect(lastValue()).toEqual([
            {id: expect.any(String), name: 'message', type: {kind: 'String'}, value: 'hello'},
        ]);
        expect(container.textContent).toContain('$message');
        expect(button('Edit')).toBeTruthy();
    });
    it('accepts names without a format restriction but rejects blank names', async () => {
        controlled([]);
        await click('Add parameter');
        change('Parameter name 1', '   ');
        await click('Apply', dialog());
        expect(dialog().textContent).toContain('Enter a parameter name.');
        change('Parameter name 1', '123-параметр');
        await click('Apply', dialog());
        change('$123-параметр', 'value');
        await click('Save');
        expect(lastValue()[0].name).toBe('123-параметр');
    });
    it('resets and cancels changes without mutating input data', async () => {
        render();
        await click('Edit');
        change('$limit', '25');
        await click('Reset value: $limit');
        expect(field('$limit').value).toBe('10');
        change('$limit', '30');
        await click('Editing actions');
        await click('Cancel', document);
        expect(container.textContent).toContain('10');
        expect(initial[0].value).toBe('10');
        expect(onChange).not.toHaveBeenCalled();
    });
    it('edits list items while retaining surviving IDs', async () => {
        const value: QueryParameter[] = [
            {
                id: 'list',
                name: 'items',
                type: {kind: 'List', item: {kind: 'String'}},
                value: [
                    {id: 'first', value: 'a'},
                    {id: 'second', value: 'b'},
                ],
            },
        ];
        controlled(value);
        await click('Edit');
        await click('Remove item: $items 1');
        change('$items: 1', 'kept');
        await click('Add');
        change('$items: 2', 'added');
        await click('Save');
        expect(lastValue()[0].value).toEqual([
            {id: 'second', value: 'kept'},
            {id: expect.any(String), value: 'added'},
        ]);
    });
    it('edits List<List<String>> and adds items at both nesting levels', async () => {
        const value: QueryParameter[] = [
            {
                id: 'matrix',
                name: 'matrix',
                type: {kind: 'List', item: {kind: 'List', item: {kind: 'String'}}},
                value: [{id: 'row', value: [{id: 'cell', value: 'original'}]}],
            },
        ];
        controlled(value);
        await click('Edit');
        change('$matrix: 1: 1', 'edited');
        const inner = field('$matrix: 1: 1').closest('.qp-parameter-value__collection');
        if (!inner) throw new Error('Missing inner list');
        await click('Add', inner);
        change('$matrix: 1: 2', 'second');
        const outer = container.querySelector('.qp-parameter-value__collection');
        const addOuter = outer?.querySelector<HTMLButtonElement>(':scope > button');
        if (!addOuter) throw new Error('Missing outer list Add button');
        await act(async () => addOuter.click());
        const emptyInner = [...container.querySelectorAll('.qp-parameter-value__collection')].at(
            -1,
        );
        if (!emptyInner) throw new Error('Missing new inner list');
        await click('Add', emptyInner);
        change('$matrix: 2: 1', 'new row');
        await click('Save');
        expect(lastValue()[0]).toEqual({
            ...value[0],
            value: [
                {
                    id: 'row',
                    value: [
                        {id: 'cell', value: 'edited'},
                        {id: expect.any(String), value: 'second'},
                    ],
                },
                {id: expect.any(String), value: [{id: expect.any(String), value: 'new row'}]},
            ],
        });
        expect(value[0].value).toEqual([{id: 'row', value: [{id: 'cell', value: 'original'}]}]);
    });
    it('creates a nested list schema through the parameter type dialog', async () => {
        controlled([]);
        await click('Add parameter');
        change('Parameter name 1', 'matrix');
        async function selectList(index: number) {
            const select = dialog().querySelectorAll<HTMLElement>('[role="combobox"]')[index];
            if (!select) throw new Error('Missing type select');
            await act(async () => select.click());
            const popup = document.getElementById(select.getAttribute('aria-controls') || '');
            if (!popup) throw new Error('Missing type options');
            const option = [...popup.querySelectorAll<HTMLElement>('[role="option"]')].find(
                (node) => node.textContent === 'List',
            );
            if (!option) throw new Error('Missing List option');
            await act(async () => option.click());
        }
        await selectList(0);
        await selectList(1);
        expect(dialog().querySelectorAll('[role="combobox"]')).toHaveLength(3);
        await click('Apply', dialog());
        await click('Add');
        await click('Add');
        change('$matrix: 1: 1', 'created');
        await click('Save');
        expect(lastValue()).toEqual([
            {
                id: expect.any(String),
                name: 'matrix',
                type: {kind: 'List', item: {kind: 'List', item: {kind: 'String'}}},
                value: [
                    {id: expect.any(String), value: [{id: expect.any(String), value: 'created'}]},
                ],
            },
        ]);
    });
    it('blocks invalid names, numbers and JSON and allows corrections', async () => {
        render({
            value: [...initial, {id: 'json', name: 'document', type: {kind: 'Json'}, value: '{}'}],
        });
        await click('Edit');
        await editMetadata('document');
        change('Parameter name 2', 'limit');
        await click('Apply', dialog());
        change('$limit', 'NaN');
        expect(button('Save').disabled).toBe(true);
        await click('Save');
        expect(onChange).not.toHaveBeenCalled();
        expect(container.textContent).toContain('Parameter names must be unique');
        const menus = [
            ...container.querySelectorAll<HTMLButtonElement>(
                'button[aria-label="Parameter actions: $limit"]',
            ),
        ];
        await act(async () => menus[1].click());
        await click('Edit name and type', document);
        change('Parameter name 2', 'document');
        await click('Apply', dialog());
        change('$limit', '12');
        change('$document', '{bad');
        expect(field('$document').value).toBe('{bad');
        expect(button('Save').disabled).toBe(true);
        await click('Save');
        expect(onChange).not.toHaveBeenCalled();
        expect(container.textContent).toContain('Enter a valid JSON');
        change('$document', '{"number":9007199254740993}');
        expect(button('Save').disabled).toBe(false);
        await click('Save');
        expect(lastValue()[1].value).toBe('{"number":9007199254740993}');
    });
    it.each(['Json', 'JsonDocument', 'Yson'] as const)(
        'keeps %s document edits in the draft until Save and discards them on Cancel',
        async (kind) => {
            controlled([{id: 'document', name: 'document', type: {kind}, value: '{}'}]);
            await click('Edit');
            change('$document', '{"cancelled":true}');
            expect(onChange).not.toHaveBeenCalled();
            await click('Editing actions');
            await click('Cancel', document);
            await click('Edit');
            expect(field('$document').value).toBe('{}');
            change('$document', '{');
            expect(button('Save').disabled).toBe(true);
            const value = '{\n  "number": 9007199254740993\n}';
            change('$document', value);
            expect(button('Save').disabled).toBe(false);
            await click('Save');
            expect(onChange).toHaveBeenCalledExactlyOnceWith([
                {id: 'document', name: 'document', type: {kind}, value},
            ]);
            await click('Edit');
            expect(field('$document').value).toBe(value);
        },
    );
    it('keeps Number and Json editors free of RAW and preserves numeric precision', async () => {
        render({
            value: [...initial, {id: 'json', name: 'document', type: {kind: 'Json'}, value: '{}'}],
        });
        await click('Edit');
        expect(container.querySelector('button[aria-label="RAW: $limit"]')).toBeNull();
        expect(container.querySelector('button[aria-label="RAW: $document"]')).toBeNull();
        expect(container.querySelector('input[aria-label="Parameter name 1"]')).toBeNull();
        change('$limit', '9007199254740993');
        await click('Save');
        expect(lastValue()[0].value).toBe('9007199254740993');
    });
    it('applies valid RAW inline and preserves invalid hidden drafts until corrected', async () => {
        render({
            value: [
                {
                    id: 'list',
                    name: 'items',
                    type: {kind: 'List', item: {kind: 'Number'}},
                    value: [],
                },
            ],
        });
        await click('Edit');
        await click('RAW: $items');
        expect(button('Save').disabled).toBe(false);
        change('RAW: $items', '[invalid');
        expect(button('Save').disabled).toBe(true);
        change('Search', 'missing');
        expect(button('Save').disabled).toBe(true);
        change('Search', '');
        expect(field('RAW: $items').value).toBe('[invalid');
        change('RAW: $items', '["9007199254740993"]');
        expect(button('Save').disabled).toBe(false);
        await click('Save');
        expect(lastValue()[0].value).toEqual([{id: expect.any(String), value: '9007199254740993'}]);
    });
    it('saves deletion then removes deleted parameters permanently', async () => {
        controlled();
        await click('Edit');
        await click('Parameter actions: $limit');
        await click('Delete parameter $limit', document);
        await click('Save');
        expect(lastValue()).toEqual([{...initial[0], deleted: true}]);
        const deleted = [...container.querySelectorAll<HTMLElement>('[role="tab"]')].find((node) =>
            node.textContent?.startsWith('Deleted'),
        );
        if (!deleted) throw new Error('Missing Deleted tab');
        await act(async () => deleted.click());
        await click('Remove all');
        expect(lastValue()).toEqual([]);
    });
    it('preserves drafts on external conflict until explicitly discarded', async () => {
        render();
        await click('Edit');
        change('$limit', 'draft');
        render({value: [{...initial[0], value: '20'}]});
        expect(field('$limit').value).toBe('draft');
        expect(button('Save').disabled).toBe(true);
        await click('Discard draft and reload');
        expect(container.textContent).toContain('20');
        expect(onChange).not.toHaveBeenCalled();
    });
    it('preserves a rejected save and allows retry', async () => {
        onChange.mockRejectedValueOnce(new Error('offline'));
        controlled();
        await click('Edit');
        change('$limit', '17');
        await click('Save');
        expect(container.textContent).toContain('Could not save parameters');
        expect(field('$limit').value).toBe('17');
        await click('Save');
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(container.textContent).toContain('17');
        expect(button('Edit')).toBeTruthy();
    });
    it('locks actions while saving asynchronously and supports synchronous callback errors', async () => {
        let resolve!: () => void;
        onChange.mockImplementationOnce(
            () =>
                new Promise<void>((done) => {
                    resolve = done;
                }),
        );
        render();
        await click('Edit');
        await click('Save');
        expect(button('Save').disabled).toBe(true);
        expect(field('$limit').disabled).toBe(true);
        await act(async () => resolve());
        await click('Edit');
        onChange.mockImplementationOnce(() => {
            throw new Error('failed');
        });
        await click('Save');
        expect(field('$limit').value).toBe('10');
        expect(container.textContent).toContain('Could not save parameters');
    });
    it('recovers from a failed refresh and confirms Update before discarding edits', async () => {
        const onUpdate = vi
            .fn()
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValue(undefined);
        render({onUpdate});
        await click('Update');
        expect(container.textContent).toContain('Could not update parameters');
        await click('Update');
        expect(onUpdate).toHaveBeenCalledTimes(2);
        expect(container.textContent).not.toContain('Could not update parameters');
        await click('Edit');
        change('$limit', '42');
        await click('Update');
        expect(dialog().textContent).toContain('Update parameters?');
        expect(onUpdate).toHaveBeenCalledTimes(2);
        await click('Cancel', dialog());
        expect(field('$limit').value).toBe('42');
        await click('Update');
        onUpdate.mockRejectedValueOnce(new Error('offline'));
        await click('Update', dialog());
        expect(onUpdate).toHaveBeenCalledTimes(3);
        expect(field('$limit').value).toBe('42');
    });
    it('cleans up pending nested RAW edits when the item is removed', async () => {
        render({
            value: [
                {
                    id: 'list',
                    name: 'items',
                    type: {kind: 'List', item: {kind: 'String'}},
                    value: [{id: 'child', value: 'text'}],
                },
            ],
        });
        await click('Edit');
        await click('RAW: $items: 1');
        change('RAW: $items: 1', 'unfinished');
        expect(button('RAW: $items').disabled).toBe(true);
        expect(button('Save').disabled).toBe(true);
        await click('Remove item: $items 1');
        expect(button('RAW: $items').disabled).toBe(false);
        expect(button('Save').disabled).toBe(false);
        await click('Save');
        expect(lastValue()[0].value).toEqual([]);
    });
    it('resets a surviving nested value by ID after deletion and a new item to its default', async () => {
        render({
            value: [
                {
                    id: 'list',
                    name: 'items',
                    type: {kind: 'List', item: {kind: 'String'}},
                    value: [
                        {id: 'a', value: 'first'},
                        {id: 'b', value: 'second'},
                    ],
                },
            ],
        });
        await click('Edit');
        await click('Remove item: $items 1');
        change('$items: 1', 'changed');
        await click('Reset value: $items: 1');
        expect(field('$items: 1').value).toBe('second');
        await click('Add');
        change('$items: 2', 'new');
        await click('Reset value: $items: 2');
        expect(field('$items: 2').value).toBe('');
        await click('Save');
        expect(lastValue()[0].value).toEqual([
            {id: 'b', value: 'second'},
            {id: expect.any(String), value: ''},
        ]);
    });
    it('shows all Variant options, disables inactive editors and retains their drafts', async () => {
        render({
            value: [
                {
                    id: 'variant',
                    name: 'choice',
                    type: {
                        kind: 'Variant',
                        options: [
                            {id: 'number', name: 'Number option', type: {kind: 'Number'}},
                            {id: 'text', name: 'Text option', type: {kind: 'String'}},
                        ],
                    },
                    value: {optionId: 'number', value: '10'},
                },
            ],
        });
        await click('Edit');
        expect(field('$choice: Number option').disabled).toBe(false);
        expect(field('$choice: Text option').disabled).toBe(true);
        change('$choice: Number option', '42');
        const radios = () => [
            ...container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
        ];
        expect(radios()).toHaveLength(2);
        await act(async () => radios()[1].click());
        expect(field('$choice: Number option').disabled).toBe(true);
        expect(field('$choice: Text option').disabled).toBe(false);
        change('$choice: Text option', 'remember me');
        await act(async () => radios()[0].click());
        expect(field('$choice: Number option').value).toBe('42');
        await act(async () => radios()[1].click());
        expect(field('$choice: Text option').value).toBe('remember me');
        await click('Save');
        expect(lastValue()[0].value).toEqual({optionId: 'text', value: 'remember me'});
    });
    it('edits a dictionary pair through one RAW control and resets both fields together', async () => {
        render({
            value: [
                {
                    id: 'dict',
                    name: 'mapping',
                    type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'Number'}},
                    value: [{id: 'entry', key: 'original', value: '10'}],
                },
            ],
        });
        await click('Edit');
        expect(button('Escaped string: $mapping: 1: Key')).toBeDefined();
        expect(
            container.querySelector('button[aria-label="Escaped string: $mapping: 1: Value"]'),
        ).toBeNull();
        expect(container.querySelector('button[aria-label="RAW: $mapping: 1: Value"]')).toBeNull();
        await click('RAW: $mapping: 1');
        change('RAW: $mapping: 1', '["changed", "20"]');
        await click('RAW: $mapping: 1');
        expect(field('$mapping: 1: Key').value).toBe('changed');
        expect(field('$mapping: 1: Value').value).toBe('20');
        await click('Reset value: $mapping: 1');
        expect(field('$mapping: 1: Key').value).toBe('original');
        expect(field('$mapping: 1: Value').value).toBe('10');
        await click('Save');
        expect(lastValue()[0].value).toEqual([{id: 'entry', key: 'original', value: '10'}]);
    });
    it('edits escaped strings inline and blocks saving malformed escapes until reset', async () => {
        render({value: [{id: 'string', name: 'message', type: {kind: 'String'}, value: 'hello'}]});
        await click('Edit');
        await click('Escaped string: $message');
        change('Escaped string: $message', String.raw`hello\x21world`);
        await click('Escaped string: $message');
        expect(field('$message').value).toBe('hello!world');
        await click('Escaped string: $message');
        change('Escaped string: $message', String.raw`\xZZ`);
        expect(button('Save').disabled).toBe(true);
        await click('Reset value: $message');
        expect(field('$message').value).toBe('hello');
        expect(button('Save').disabled).toBe(false);
        await click('Save');
        expect(lastValue()[0].value).toBe('hello');
    });
    it('shows multiline strings escaped and preserves line endings when editing and saving', async () => {
        render({
            value: [
                {id: 'string', name: 'message', type: {kind: 'String'}, value: 'first\r\nsecond'},
            ],
        });
        await click('Edit');
        expect(field('Escaped string: $message').value).toBe(String.raw`first\x0d\x0asecond`);
        expect(button('Escaped string: $message').disabled).toBe(true);
        change('Escaped string: $message', String.raw`changed\x0d\x0asecond`);
        await click('Save');
        expect(lastValue()[0].value).toBe('changed\r\nsecond');
    });
    it.each(['Dict', 'Variant'] as const)(
        'retains invalid nested RAW when %s is collapsed',
        async (kind) => {
            const parameter: QueryParameter =
                kind === 'Dict'
                    ? {
                          id: 'nested',
                          name: 'nested',
                          type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'Number'}},
                          value: [{id: 'entry', key: 'key', value: '10'}],
                      }
                    : {
                          id: 'nested',
                          name: 'nested',
                          type: {
                              kind: 'Variant',
                              options: [{id: 'text', name: 'text', type: {kind: 'String'}}],
                          },
                          value: {optionId: 'text', value: 'hello'},
                      };
            const rawLabel = kind === 'Dict' ? 'RAW: $nested: 1' : 'RAW: $nested: text';
            render({value: [parameter]});
            await click('Edit');
            await click(rawLabel);
            change(rawLabel, 'invalid');
            expect(button('Save').disabled).toBe(true);
            await click('Collapse: $nested');
            expect(button('Save').disabled).toBe(true);
            await click('Expand: $nested');
            expect(field(rawLabel).value).toBe('invalid');
            change(rawLabel, kind === 'Dict' ? '["key", "20"]' : '"corrected"');
            expect(button('Save').disabled).toBe(false);
            await click('Save');
            expect(lastValue()[0].value).toEqual(
                kind === 'Dict'
                    ? [{id: 'entry', key: 'key', value: '20'}]
                    : {optionId: 'text', value: 'corrected'},
            );
        },
    );
    it('cancels a new parameter and preserves an existing value when only its name changes', async () => {
        render();
        await click('Add parameter');
        change('Parameter name 2', 'temporary');
        await click('Cancel', dialog());
        expect(container.textContent).not.toContain('$temporary');
        await editMetadata('limit');
        change('Parameter name 1', 'count');
        await click('Apply', dialog());
        expect(field('$count').value).toBe('10');
        change('$count', '20');
        await click('Reset value: $count');
        expect(field('$count').value).toBe('10');
        await click('Save');
        expect(lastValue()).toEqual([{...initial[0], name: 'count'}]);
    });
    it('disables mutations when disabled or loading', async () => {
        render({disabled: true});
        expect(button('Edit').disabled).toBe(true);
        expect(button('Add parameter').disabled).toBe(true);
        render();
        await click('Edit');
        render({loading: true});
        expect(button('Save').disabled).toBe(true);
        expect(field('$limit').disabled).toBe(true);
        expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
        expect(onChange).not.toHaveBeenCalled();
    });
    it('localizes empty search results after the locale changes', () => {
        render();
        setLang('ru');
        configure({lang: 'ru'});
        render();
        change('Поиск', 'missing');
        expect(container.textContent).toContain('Ничего не найдено');
        expect(container.textContent).toContain('Попробуйте изменить поисковый запрос.');
        expect(container.textContent).not.toContain('Nothing found');
        setLang('en');
        configure({lang: 'en'});
    });
    it('cancels schema changes without resetting the value and applies an explicit type reset', async () => {
        render();
        await click('Edit');
        await editMetadata('limit');
        await click('Cancel', dialog());
        expect(field('$limit').value).toBe('10');
        await editMetadata('limit');
        const select = dialog().querySelector<HTMLElement>('[role="combobox"]');
        if (!select) throw new Error('Missing type select');
        await act(async () => select.click());
        const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
            (node) => node.textContent === 'String',
        );
        if (!option) throw new Error('Missing String option');
        await act(async () => option.click());
        await click('Apply', dialog());
        expect(field('$limit').value).toBe('');
        change('$limit', 'text');
        await click('Save');
        expect(lastValue()[0]).toEqual({...initial[0], type: {kind: 'String'}, value: 'text'});
    });

    it('renders and saves every design field without changing its value or precision', async () => {
        render({value: allTypesParameters});
        expect(container.querySelector('[role="alert"]')).toBeNull();
        await click('Edit');
        expect(container.querySelector('[role="alert"]')).toBeNull();
        expect(field('$' + allTypesParameters.find(({id}) => id === 'Timestamp')!.name).value).toBe(
            '2025-01-01T12:30:00.123456Z',
        );
        await click('Save');
        expect(lastValue()).toEqual(allTypesParameters);
    });

    it('preserves multiline dictionary keys and values during editing', async () => {
        render({
            value: [
                {
                    id: 'dict',
                    name: 'dict',
                    type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'String'}},
                    value: [{id: 'entry', key: 'first\nsecond', value: 'one\r\ntwo'}],
                },
            ],
        });
        await click('Edit');
        expect(field('Escaped string: $dict: 1: Key').value).toBe(String.raw`first\x0asecond`);
        expect(field('Escaped string: $dict: 1: Value').value).toBe(String.raw`one\x0d\x0atwo`);
        change('Escaped string: $dict: 1: Value', String.raw`changed\x0d\x0atwo`);
        await click('Save');
        expect(lastValue()[0].value).toEqual([
            {id: 'entry', key: 'first\nsecond', value: 'changed\r\ntwo'},
        ]);
    });

    it('retains nullable drafts across NULL toggles and resets to the original NULL', async () => {
        render({
            value: [
                {
                    id: 'p',
                    name: 'optional',
                    type: {kind: 'Optional', item: {kind: 'String'}},
                    value: null,
                },
            ],
        });
        await click('Edit');
        const toggle = () => act(() => field('NULL: $optional').click());
        toggle();
        change('$optional', 'kept');
        toggle();
        expect(field('$optional').disabled).toBe(true);
        expect(field('$optional').value).toBe('');
        toggle();
        expect(field('$optional').value).toBe('kept');
        await click('Reset value: $optional');
        expect((field('NULL: $optional') as HTMLInputElement).checked).toBe(true);
        await click('Save');
        expect(lastValue()[0].value).toBeNull();
    });

    it('edits Bool and named Struct fields while preserving their public shapes', async () => {
        render({
            value: [
                {id: 'bool', name: 'bool', type: {kind: 'Bool'}, value: false},
                {
                    id: 'struct',
                    name: 'struct',
                    type: {
                        kind: 'Struct',
                        fields: [
                            {id: 'count', name: 'count', type: {kind: 'Uint64'}},
                            {id: 'text', name: 'text', type: {kind: 'Utf8'}},
                        ],
                    },
                    value: [
                        {id: 'count', value: '18446744073709551615'},
                        {id: 'text', value: 'old'},
                    ],
                },
            ],
        });
        await click('Edit');
        const radio = container.querySelector<HTMLInputElement>(
            'input[type="radio"][value="true"]',
        );
        expect(radio).not.toBeNull();
        act(() => radio!.click());
        change('$struct: text', 'new');
        await click('Save');
        expect(lastValue()[0].value).toBe(true);
        expect(lastValue()[1].value).toEqual([
            {id: 'count', value: '18446744073709551615'},
            {id: 'text', value: 'new'},
        ]);
    });

    it('distinguishes empty strings and displays the selected variant type in view mode', () => {
        render({
            value: [
                {id: 's', name: 'empty', type: {kind: 'String'}, value: ''},
                {
                    id: 'v',
                    name: 'variant',
                    type: {
                        kind: 'Variant',
                        options: [{id: 'text', name: '1', type: {kind: 'String'}}],
                    },
                    value: {optionId: 'text', value: 'hello'},
                },
            ],
        });
        expect(container.textContent).toContain('""');
        expect(container.textContent).toContain('1 [String]:');
        expect(container.textContent).toContain('"hello"');
    });

    it('keeps dictionary RAW open when a pair becomes multiline', async () => {
        render({
            value: [
                {
                    id: 'dict',
                    name: 'dict',
                    type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'String'}},
                    value: [{id: 'entry', key: 'key', value: 'old'}],
                },
            ],
        });
        await click('Edit');
        await click('RAW: $dict: 1');
        change('RAW: $dict: 1', JSON.stringify(['key', 'first\nsecond']));
        expect(field('RAW: $dict: 1').value).toBe(JSON.stringify(['key', 'first\nsecond']));
        await click('RAW: $dict: 1');
        expect(field('Escaped string: $dict: 1: Value').value).toBe(String.raw`first\x0asecond`);
        await click('Save');
        expect(lastValue()[0].value).toEqual([{id: 'entry', key: 'key', value: 'first\nsecond'}]);
    });

    it.each([
        ['Date', '2025-01-01', '2025-01-02'],
        ['Datetime', '2025-01-01T12:30:00Z', '2025-01-02T12:30:00Z'],
    ])('selects and saves a %s with the date picker', async (kind, value, expected) => {
        render({value: [{id: 'date', name: 'date', type: {kind}, value}]});
        await click('Edit');
        expect(field('$date').getAttribute('role')).toBe('combobox');
        await click('Calendar');
        const secondDay = [
            ...dialog().querySelectorAll<HTMLElement>('[role="gridcell"] [role="button"]'),
        ].find((node) => node.textContent === '2');
        expect(secondDay).toBeDefined();
        await act(async () => secondDay!.click());
        expect(field('$date').value.replace(/[\u2066-\u2069]/g, '')).toBe(expected);
        await click('Save');
        expect(lastValue()[0].value).toBe(expected);
    });

    it('blocks saving a cleared date and accepts a new calendar selection', async () => {
        render({value: [{id: 'date', name: 'date', type: {kind: 'Date'}, value: '2025-01-01'}]});
        await click('Edit');
        change('$date', '');
        await click('Save');
        expect(onChange).not.toHaveBeenCalled();
        expect(field('$date').getAttribute('role')).toBe('combobox');
        await click('Calendar');
        const day = [
            ...dialog().querySelectorAll<HTMLElement>('[role="gridcell"] [role="button"]'),
        ].find((node) => node.textContent === '15');
        expect(day).toBeDefined();
        await act(async () => day!.click());
        const selected = field('$date').value.replace(/[\u2066-\u2069]/g, '');
        expect(selected).toMatch(/^\d{4}-\d{2}-15$/);
        await click('Save');
        expect(lastValue()[0].value).toBe(selected);
    });

    it('keeps an invalid incoming date editable without normalizing it', async () => {
        render({value: [{id: 'date', name: 'date', type: {kind: 'Date'}, value: '2025-02-30'}]});
        await click('Edit');
        expect(field('$date').value).toBe('2025-02-30');
        expect(field('$date').getAttribute('role')).not.toBe('combobox');
    });

    it('chooses a calendar date without changing microseconds or the UTC suffix', async () => {
        render({
            value: [
                {
                    id: 'date',
                    name: 'date',
                    type: {kind: 'Timestamp'},
                    value: '2025-01-01T12:30:00.123456Z',
                },
            ],
        });
        await click('Edit');
        await click('Open calendar');
        const secondDay = [
            ...dialog().querySelectorAll<HTMLElement>('[role="gridcell"] [role="button"]'),
        ].find((node) => node.textContent === '2');
        expect(secondDay).toBeDefined();
        await act(async () => secondDay!.click());
        expect(field('$date').value).toBe('2025-01-02T12:30:00.123456Z');
        await click('Save');
        expect(lastValue()[0].value).toBe('2025-01-02T12:30:00.123456Z');
    });
    it.each(['escaped', 'raw'] as const)(
        'suspends and restores invalid nullable %s drafts',
        async (mode) => {
            render({
                value: [
                    {
                        id: 'p',
                        name: 'p',
                        type: {kind: 'Optional', item: {kind: 'String'}},
                        value: 'kept',
                    },
                ],
            });
            await click('Edit');
            const editor = mode === 'raw' ? 'RAW: $p' : 'Escaped string: $p';
            await click(editor);
            const unfinished = mode === 'raw' ? '{' : String.raw`\x`;
            change(editor, unfinished);
            expect(button('Save').disabled).toBe(true);
            act(() => field('NULL: $p').click());
            expect(field(editor).disabled).toBe(true);
            expect(field(editor).value).toBe('');
            expect(button('Save').disabled).toBe(false);
            act(() => field('NULL: $p').click());
            expect(field(editor).value).toBe(unfinished);
            expect(button('Save').disabled).toBe(true);
            act(() => field('NULL: $p').click());
            await click('Save');
            expect(lastValue()[0].value).toBeNull();
        },
    );

    it('retains invalid child RAW when a nullable container is disabled then restored', async () => {
        render({
            value: [
                {
                    id: 'p',
                    name: 'p',
                    type: {kind: 'Optional', item: {kind: 'List', item: {kind: 'String'}}},
                    value: [{id: 'a', value: 'kept'}],
                },
            ],
        });
        await click('Edit');
        await click('RAW: $p: 1');
        change('RAW: $p: 1', '{');
        expect(button('Save').disabled).toBe(true);
        act(() => field('NULL: $p').click());
        expect(button('Save').disabled).toBe(false);
        expect(field('RAW: $p: 1').closest('[hidden]')).not.toBeNull();
        act(() => field('NULL: $p').click());
        expect(field('RAW: $p: 1').value).toBe('{');
        expect(button('Save').disabled).toBe(true);
        await click('Reset value: $p');
        expect(button('Save').disabled).toBe(false);
        await click('Save');
        expect(lastValue()[0].value).toEqual([{id: 'a', value: 'kept'}]);
    });

    it('restores an internal NULL level and its original marker on reset', async () => {
        const marker = {kind: 'optional-null', depth: 1} as const;
        render({
            value: [
                {
                    id: 'p',
                    name: 'p',
                    type: {kind: 'Optional', item: {kind: 'Optional', item: {kind: 'String'}}},
                    value: marker,
                },
            ],
        });
        await click('Edit');
        expect(container.querySelector('[aria-label="NULL level: $p"]')).not.toBeNull();
        act(() => field('NULL: $p').click());
        change('$p', 'kept');
        act(() => field('NULL: $p').click());
        act(() => field('NULL: $p').click());
        expect(field('$p').value).toBe('kept');
        await click('Reset value: $p');
        expect((field('NULL: $p') as HTMLInputElement).checked).toBe(true);
        await click('Save');
        expect(lastValue()[0].value).toEqual(marker);
    });

    it('uses unchecked text for timezone types and escaped mode for Pg', async () => {
        render({
            value: [
                {id: 'tz', name: 'tz', type: {kind: 'TzTimestamp64'}, value: 'raw timezone value'},
                {id: 'pg', name: 'pg', type: {kind: 'Pg', name: 'text'}, value: 'hello'},
            ],
        });
        await click('Edit');
        expect(container.querySelector('button[aria-label="Open calendar"]')).toBeNull();
        await click('Escaped string: $pg');
        change('Escaped string: $pg', String.raw`hello\x21`);
        await click('Save');
        expect(lastValue().map((p) => p.value)).toEqual(['raw timezone value', 'hello!']);
    });

    it('validates Unknown JSON while retaining its name, whitespace and large numbers', async () => {
        render({
            value: [{id: 'p', name: 'p', type: {kind: 'Unknown', name: 'FutureType'}, value: '{}'}],
        });
        expect(container.textContent).toContain('FutureType');
        await click('Edit');
        change('RAW: $p', '{');
        await click('Save');
        expect(onChange).not.toHaveBeenCalled();
        const raw = '{ "n": 900719925474099312345 }';
        change('RAW: $p', raw);
        await click('Save');
        expect(lastValue()[0].value).toBe(raw);
    });

    it('blocks dictionary pair RAW for invalid child drafts and clears them on pair reset', async () => {
        render({
            value: [
                {
                    id: 'p',
                    name: 'p',
                    type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'Number'}},
                    value: [{id: 'a', key: 'original', value: '10'}],
                },
            ],
        });
        await click('Edit');
        await click('Escaped string: $p: 1: Key');
        change('Escaped string: $p: 1: Key', String.raw`\x`);
        expect(button('RAW: $p: 1').disabled).toBe(true);
        expect(button('Save').disabled).toBe(true);
        await click('Reset value: $p: 1');
        expect(button('Save').disabled).toBe(false);
        expect(field('$p: 1: Key').value).toBe('original');
        expect(button('RAW: $p: 1').disabled).toBe(false);
        await click('Save');
        expect(lastValue()[0].value).toEqual([{id: 'a', key: 'original', value: '10'}]);
    });

    it('collapses Tuple without losing its fixed elements', async () => {
        render({
            value: [
                {
                    id: 'p',
                    name: 'p',
                    type: {kind: 'Tuple', items: [{kind: 'String'}]},
                    value: [{id: 'a', value: 'kept'}],
                },
            ],
        });
        await click('Edit');
        await click('Collapse: $p');
        expect(field('$p: 1').closest('[hidden]')).not.toBeNull();
        await click('Expand: $p');
        expect(field('$p: 1').value).toBe('kept');
        expect(container.querySelector('button[aria-label="Remove item: $p 1"]')).toBeNull();
        await click('Save');
        expect(lastValue()[0].value).toEqual([{id: 'a', value: 'kept'}]);
    });
    it('selects the intrinsic Pg NULL level inside Optional', async () => {
        render({
            value: [
                {
                    id: 'p',
                    name: 'p',
                    type: {kind: 'Optional', item: {kind: 'Pg', name: 'text'}},
                    value: null,
                },
            ],
        });
        await click('Edit');
        await click('NULL level: $p');
        const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
            (node) => node.textContent === '2',
        );
        expect(option).toBeDefined();
        await act(async () => option?.click());
        await click('Save');
        expect(lastValue()[0].value).toEqual({kind: 'optional-null', depth: 1});
    });

    it('shows application document errors in view mode', () => {
        render({
            value: [{id: 'p', name: 'p', type: {kind: 'Json'}, value: '{}'}],
            errors: {p: {value: {$: 'Readable server error'}}},
        });
        expect(container.querySelector('[role="alert"]')?.textContent).toBe(
            'Readable server error',
        );
    });
});
