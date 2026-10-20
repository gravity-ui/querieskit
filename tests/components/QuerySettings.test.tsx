// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QuerySettings} from '../../src/modules/QuerySettings';
import type {QuerySettingsProps, QuerySettingsValue} from '../../src/types/querySettings';
import {setLang} from '../../src/i18n';

type Custom = {yqlVersion: string};
const initialValue: QuerySettingsValue<Custom> = {
    queryName: 'Example',
    access: 'everyone',
    ytOperationTitle: 'Operation',
    tokenIds: ['first'],
    attributes: [
        {id: 'a', key: 'pool', value: 'research'},
        {id: 'b', key: 'priority', value: 'high'},
    ],
    custom: {yqlVersion: 'v1'},
};
const tokens = [
    {id: 'first', title: 'First token'},
    {id: 'second', title: 'Second token'},
];

describe('QuerySettings', () => {
    let root: Root;
    let container: HTMLDivElement;
    let onChange: ReturnType<typeof vi.fn<(value: QuerySettingsValue<Custom>) => void>>;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        setLang('en');
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

    function render(props: Partial<QuerySettingsProps<Custom>> = {}) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QuerySettings value={initialValue} onChange={onChange} {...props} />
                </ThemeProvider>,
            ),
        );
    }

    function input(label: string) {
        const element = container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`);
        if (!element) throw new Error(`Missing input: ${label}`);
        return element;
    }

    function button(label: string) {
        const element = [...container.querySelectorAll<HTMLButtonElement>('button')].find(
            (node) =>
                node.getAttribute('aria-label') === label || node.textContent?.endsWith(label),
        );
        if (!element) throw new Error(`Missing button: ${label}`);
        return element;
    }

    function lastValue() {
        const call = onChange.mock.lastCall;
        if (!call) throw new Error('Expected settings change');
        return call[0];
    }

    function change(element: HTMLInputElement, value: string) {
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                element,
                value,
            );
            element.dispatchEvent(new Event('input', {bubbles: true}));
        });
    }

    it('emits complete values for invalid input without mutating props or accepting changes itself', () => {
        const original = structuredClone(initialValue);
        render();
        expect(onChange).not.toHaveBeenCalled();
        change(input('Query name'), '');
        expect(onChange).toHaveBeenCalledExactlyOnceWith({...initialValue, queryName: ''});
        expect(input('Query name').value).toBe('Example');
        expect(initialValue).toEqual(original);
        render({value: {...initialValue, queryName: 'Accepted'}});
        expect(input('Query name').value).toBe('Accepted');
        expect(onChange).toHaveBeenCalledTimes(1);
        change(input('YT operation title'), 'New operation');
        expect(onChange).toHaveBeenLastCalledWith({
            ...initialValue,
            queryName: 'Accepted',
            ytOperationTitle: 'New operation',
        });
    });

    it('hides all standard fields without clearing values and counts only visible fields', () => {
        render({tokens, hiddenFields: ['queryName', 'access', 'ytOperationTitle', 'tokenIds']});
        expect(container.querySelector('input')).toBeNull();
        expect(container.querySelector('[aria-label="Access"]')).toBeNull();
        expect(container.querySelector('[aria-label="Tokens"]')).toBeNull();
        const general = [...container.querySelectorAll('[aria-expanded]')].find((node) =>
            node.textContent?.startsWith('General'),
        );
        expect(general?.textContent).toBe('General0');
        act(() => button('Remove attribute 1').click());
        expect(lastValue()).toEqual({...initialValue, attributes: [initialValue.attributes[1]]});
    });

    it('allows editing protected values while preventing key changes and removal', () => {
        render({getAttributePermissions: () => ({canEditKey: false, canRemove: false})});
        expect(button('Remove attribute 1').disabled).toBe(true);
        act(() => button('Edit attribute 1').click());
        expect(input('Attribute key 1').disabled).toBe(true);
        expect(document.activeElement).toBe(input('Attribute value 1'));
        change(input('Attribute value 1'), 'updated');
        act(() => button('Apply attribute 1').click());
        expect(lastValue().attributes[0]).toEqual({id: 'a', key: 'pool', value: 'updated'});
        render({getAttributePermissions: () => ({canEditKey: false, canEditValue: false})});
        expect(button('Edit attribute 1').disabled).toBe(true);
    });

    it('rejects duplicates only when requested and retains the draft until corrected or cancelled', () => {
        render({checkDuplicateAttributeKeys: true});
        act(() => button('Edit attribute 1').click());
        change(input('Attribute key 1'), 'priority');
        act(() => button('Apply attribute 1').click());
        expect(onChange).not.toHaveBeenCalled();
        expect(input('Attribute key 1').value).toBe('priority');
        expect(container.textContent).toContain('This key already exists');
        act(() => button('Cancel editing attribute 1').click());
        act(() => button('Edit attribute 1').click());
        expect(input('Attribute key 1').value).toBe('pool');
        change(input('Attribute key 1'), 'priority');
        render();
        act(() => button('Apply attribute 1').click());
        expect(lastValue().attributes[0]).toEqual({id: 'a', key: 'priority', value: 'research'});
    });

    it('validates the candidate before emitting and preserves new rows on error', () => {
        const validateAttribute = vi.fn((draft: {value: string}) =>
            draft.value === 'allowed' ? undefined : {value: 'Value is restricted'},
        );
        render({validateAttribute});
        act(() => button('Add attribute').click());
        change(input('Attribute key 3'), 'new-key');
        act(() => button('Apply attribute 3').click());
        expect(onChange).not.toHaveBeenCalled();
        expect(container.textContent).toContain('Value is restricted');
        expect(input('Attribute key 3').value).toBe('new-key');
        change(input('Attribute value 3'), 'allowed');
        act(() => button('Apply attribute 3').click());
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(validateAttribute).toHaveBeenLastCalledWith(
            expect.objectContaining({key: 'new-key', value: 'allowed'}),
            initialValue.attributes,
        );
    });

    it('validates key constraints on Enter and honors permissions revoked during editing', () => {
        render({
            validateAttribute: (draft) =>
                draft.key.includes(' ') ? {key: 'No spaces allowed'} : undefined,
        });
        act(() => button('Edit attribute 1').click());
        change(input('Attribute key 1'), 'invalid key');
        act(() =>
            input('Attribute key 1').dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}),
            ),
        );
        expect(onChange).not.toHaveBeenCalled();
        expect(input('Attribute key 1').getAttribute('aria-invalid')).toBe('true');
        render({getAttributePermissions: () => ({canEditKey: false})});
        change(input('Attribute value 1'), 'new value');
        act(() => button('Apply attribute 1').click());
        expect(lastValue().attributes[0]).toEqual({id: 'a', key: 'pool', value: 'new value'});
    });

    it('restores a cleared key when its permission is revoked and allows value-only Apply', () => {
        render();
        act(() => button('Edit attribute 1').click());
        change(input('Attribute key 1'), '');
        expect(button('Apply attribute 1').disabled).toBe(true);
        render({getAttributePermissions: () => ({canEditKey: false})});
        expect(input('Attribute key 1').value).toBe('pool');
        expect(input('Attribute key 1').disabled).toBe(true);
        change(input('Attribute value 1'), 'updated');
        expect(button('Apply attribute 1').disabled).toBe(false);
        act(() => button('Apply attribute 1').click());
        expect(lastValue().attributes[0]).toEqual({id: 'a', key: 'pool', value: 'updated'});
    });

    it('hides omitted tokens and disables an explicitly empty token list', () => {
        render();
        expect(container.querySelector('[aria-label="Tokens"]')).toBeNull();
        render({tokens: []});
        expect(button('Tokens').disabled).toBe(true);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('preserves hidden values while editing visible fields', () => {
        render({tokens, hiddenFields: ['tokens', 'attributes']});
        expect(container.querySelector('[aria-label="Tokens"]')).toBeNull();
        expect(container.querySelector('[aria-label="Attribute key 1"]')).toBeNull();
        change(input('Query name'), 'Renamed');
        expect(onChange).toHaveBeenLastCalledWith({...initialValue, queryName: 'Renamed'});
        render({tokens});
        expect(container.textContent).toContain('pool: research');
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('shows saved attributes as a list and applies or cancels local edits', () => {
        render();
        expect(container.textContent).toContain('pool: research');
        expect(container.querySelector('[aria-label="Attribute key 1"]')).toBeNull();
        act(() => button('Edit attribute 1').click());
        expect(document.activeElement).toBe(input('Attribute key 1'));
        change(input('Attribute value 1'), 'draft');
        expect(onChange).not.toHaveBeenCalled();
        act(() => button('Cancel editing attribute 1').click());
        expect(container.textContent).toContain('pool: research');
        expect(document.activeElement).toBe(button('Edit attribute 1'));
        act(() => button('Edit attribute 1').click());
        change(input('Attribute key 1'), 'new-key');
        change(input('Attribute value 1'), 'new-value');
        act(() => button('Apply attribute 1').click());
        expect(lastValue()).toEqual({
            ...initialValue,
            attributes: [{id: 'a', key: 'new-key', value: 'new-value'}, initialValue.attributes[1]],
        });
        expect(container.textContent).toContain('pool: research');
        render({value: lastValue()});
        expect(container.textContent).toContain('new-key: new-value');
    });

    it('adds drafts with unique IDs, focuses them and emits only applied rows', () => {
        render();
        act(() => button('Add attribute').click());
        expect(onChange).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(input('Attribute key 3'));
        change(input('Attribute key 3'), 'draft-key');
        act(() => button('Cancel editing attribute 3').click());
        expect(onChange).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(button('Add attribute'));
        act(() => button('Add attribute').click());
        expect(input('Attribute key 3').value).toBe('');
        change(input('Attribute key 3'), 'new');
        change(input('Attribute value 3'), 'value');
        act(() => button('Apply attribute 3').click());
        const next = lastValue();
        expect(next.attributes).toEqual([
            ...initialValue.attributes,
            {id: expect.any(String), key: 'new', value: 'value'},
        ]);
        expect(new Set(next.attributes.map(({id}) => id)).size).toBe(3);
        render({value: next});
        act(() => button('Edit attribute 2').click());
        const retainedInput = input('Attribute key 2');
        act(() => button('Remove attribute 1').click());
        expect(lastValue()).toEqual({...next, attributes: next.attributes.slice(1)});
        render({value: lastValue()});
        expect(input('Attribute key 1')).toBe(retainedInput);
    });

    it('preserves drafts across unrelated props but replaces externally changed or removed attributes', () => {
        render();
        act(() => button('Edit attribute 1').click());
        change(input('Attribute value 1'), 'draft');
        render({
            value: {
                ...initialValue,
                queryName: 'External title',
                attributes: initialValue.attributes.map((row) => ({...row})),
            },
        });
        expect(input('Attribute value 1').value).toBe('draft');
        const external = {
            ...initialValue,
            attributes: [
                {...initialValue.attributes[0], value: 'external'},
                initialValue.attributes[1],
            ],
        };
        render({value: external});
        expect(input('Attribute value 1').value).toBe('external');
        render({value: {...external, attributes: [external.attributes[1]]}});
        expect(container.querySelector('[aria-label="Attribute value 1"]')).toBeNull();
        expect(container.textContent).toContain('priority: high');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('requires a nonblank attribute key before applying a new draft', () => {
        render();
        act(() => button('Add attribute').click());
        expect(button('Apply attribute 3').disabled).toBe(true);
        change(input('Attribute key 3'), '   ');
        act(() =>
            input('Attribute key 3').dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}),
            ),
        );
        expect(onChange).not.toHaveBeenCalled();
        expect(button('Cancel editing attribute 3').disabled).toBe(false);
        change(input('Attribute key 3'), 'valid');
        expect(button('Apply attribute 3').disabled).toBe(false);
    });

    it('supports Enter to apply and Escape to discard drafts', () => {
        render();
        act(() => button('Edit attribute 1').click());
        change(input('Attribute value 1'), 'draft');
        act(() =>
            input('Attribute value 1').dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}),
            ),
        );
        expect(onChange).not.toHaveBeenCalled();
        act(() => button('Edit attribute 1').click());
        change(input('Attribute value 1'), 'applied');
        act(() =>
            input('Attribute value 1').dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}),
            ),
        );
        expect(lastValue().attributes[0]).toEqual({
            ...initialValue.attributes[0],
            value: 'applied',
        });
    });

    it('shows external errors by row ID and reports standard and attribute blur references', () => {
        const onFieldBlur = vi.fn();
        const errors = {
            fields: {queryName: 'Name required'},
            attributes: {b: {value: 'Invalid priority'}},
        };
        render({errors, onFieldBlur});
        expect(container.textContent).toContain('Name required');
        expect(container.textContent).toContain('Invalid priority');
        act(() => button('Edit attribute 2').click());
        act(() => input('Query name').focus());
        act(() => input('Attribute value 2').focus());
        expect(onFieldBlur).toHaveBeenCalledWith({section: 'fields', field: 'queryName'});
        act(() => input('Attribute value 2').blur());
        expect(onFieldBlur).toHaveBeenCalledWith({section: 'attributes', id: 'b', field: 'value'});
        render({value: {...initialValue, attributes: [initialValue.attributes[1]]}, errors});
        expect(container.textContent).toContain('Invalid priority');
        expect(input('Attribute value 1').getAttribute('aria-invalid')).toBe('true');
    });

    it('disables all built-in editing controls', () => {
        render({tokens, disabled: true});
        expect([...container.querySelectorAll('input')].every((element) => element.disabled)).toBe(
            true,
        );
        for (const label of [
            'Access',
            'Tokens',
            'Add attribute',
            'Remove attribute 1',
            'Edit attribute 1',
        ]) {
            expect(button(label).disabled).toBe(true);
            act(() => button(label).click());
        }
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps General and Attributes independently collapsible without losing input identity', () => {
        render();
        const name = input('Query name');
        const summary = (text: string) => {
            const node = [...container.querySelectorAll<HTMLElement>('[aria-expanded]')].find(
                (element) => element.textContent?.startsWith(text),
            );
            if (!node) throw new Error(`Missing section: ${text}`);
            return node;
        };
        expect(summary('General').getAttribute('aria-expanded')).toBe('true');
        expect(summary('Attributes').getAttribute('aria-expanded')).toBe('true');
        act(() => summary('General').click());
        expect(summary('General').getAttribute('aria-expanded')).toBe('false');
        expect(summary('Attributes').getAttribute('aria-expanded')).toBe('true');
        act(() => summary('General').click());
        expect(input('Query name')).toBe(name);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('changes Access and multiple Tokens using the real selectors', () => {
        render({tokens});
        const option = (title: string) => {
            const node = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
                (element) => element.textContent === title,
            );
            if (!node) throw new Error(`Missing option: ${title}`);
            return node;
        };
        act(() => button('Access').click());
        act(() => option('Only me').click());
        expect(onChange).toHaveBeenLastCalledWith({...initialValue, access: 'private'});
        act(() => button('Tokens').click());
        act(() => option('Second token').click());
        expect(onChange).toHaveBeenLastCalledWith({...initialValue, tokenIds: ['first', 'second']});
        const next = lastValue();
        render({value: next, tokens});
        act(() => option('First token').click());
        expect(onChange).toHaveBeenLastCalledWith({...next, tokenIds: ['second']});
    });

    it('renders standalone custom sections after Attributes with the same change context', () => {
        const renderCustomSections = vi.fn(
            (
                context: Parameters<
                    NonNullable<QuerySettingsProps<Custom>['renderCustomSections']>
                >[0],
            ) => (
                <button
                    onClick={() =>
                        context.onChange({...context.value, custom: {yqlVersion: 'section'}})
                    }
                >
                    Custom section
                </button>
            ),
        );
        render({renderCustomSections});
        const buttons = [...container.querySelectorAll('button')];
        expect(buttons.indexOf(button('Custom section'))).toBeGreaterThan(
            buttons.indexOf(button('Add attribute')),
        );
        act(() => button('Custom section').click());
        expect(lastValue()).toEqual({...initialValue, custom: {yqlVersion: 'section'}});
        render({renderCustomSections, disabled: true});
        onChange.mockClear();
        act(() => button('Custom section').click());
        expect(onChange).not.toHaveBeenCalled();
    });

    it('provides typed custom values, errors, blur and full changes to the custom slot', () => {
        const onFieldBlur = vi.fn();
        render({
            disabled: false,
            errors: {custom: {yqlVersion: 'Unsupported version'}},
            onFieldBlur,
            renderCustomFields: (context) => (
                <>
                    <input
                        aria-label="YQL version"
                        value={context.value.custom.yqlVersion}
                        disabled={context.disabled}
                        onBlur={() =>
                            context.onFieldBlur?.({section: 'custom', field: 'yqlVersion'})
                        }
                        onChange={(event) =>
                            context.onChange({
                                ...context.value,
                                custom: {yqlVersion: event.target.value},
                            })
                        }
                    />
                    <span>{context.errors?.custom?.yqlVersion}</span>
                </>
            ),
        });
        expect(container.textContent).toContain('Unsupported version');
        const inputs = [...container.querySelectorAll('input')];
        expect(inputs.indexOf(input('YQL version'))).toBe(inputs.indexOf(input('Query name')) + 1);
        change(input('YQL version'), 'v2');
        expect(onChange).toHaveBeenLastCalledWith({...initialValue, custom: {yqlVersion: 'v2'}});
        act(() => input('YQL version').focus());
        act(() => input('YQL version').blur());
        expect(onFieldBlur).toHaveBeenLastCalledWith({section: 'custom', field: 'yqlVersion'});
    });
});
