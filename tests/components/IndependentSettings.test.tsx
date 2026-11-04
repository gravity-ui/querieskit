// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QuerySettings} from '../../src/modules/QuerySettings';
import {QueryAttributesEditor} from '../../src/modules/QueryAttributesEditor';
import {BuiltinEngineSettingsFields} from '../../src/widgets/QueryEditor/presets/builtin';
import {setLang} from '../../src/i18n';

vi.mock('../../src/components/MonacoEditor', () => ({MonacoEditor: () => null}));

describe('independent settings composition', () => {
    let root: Root;
    let container: HTMLDivElement;
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
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });
    const render = (content: React.ReactNode) =>
        act(() => root.render(<ThemeProvider>{content}</ThemeProvider>));
    const change = (label: string, value: string) =>
        act(() => {
            const input = container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`);
            if (!input) throw new Error(`Missing input: ${label}`);
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                value,
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });
    const click = (label: string) =>
        act(() => {
            const button = [...container.querySelectorAll('button')].find(
                (element) =>
                    element.getAttribute('aria-label') === label ||
                    element.textContent?.endsWith(label),
            );
            expect(button).toBeDefined();
            if (!button) throw new Error(`Missing button: ${label}`);
            button.click();
        });
    it('only emits the independently bound field and needs no omitted values', () => {
        const name = vi.fn();
        const operation = vi.fn();
        render(
            <QuerySettings
                mode="sections"
                general={{
                    queryName: {value: 'Report', onChange: name},
                    ytOperationTitle: {value: 'Job', onChange: operation},
                }}
            />,
        );
        change('Query name', 'Edited');
        expect(name).toHaveBeenCalledExactlyOnceWith('Edited');
        expect(operation).not.toHaveBeenCalled();
        expect(container.querySelector('[aria-label="Access"]')).toBeNull();
        expect(container.querySelector('[aria-label="Tokens"]')).toBeNull();
    });
    it('renders controlled updates, errors and custom sections without a general form', () => {
        const update = vi.fn();
        render(
            <QuerySettings
                mode="sections"
                general={{queryName: {value: 'First', onChange: update}}}
            />,
        );
        render(
            <QuerySettings
                mode="sections"
                general={{
                    queryName: {value: 'Second', onChange: update, error: 'Name unavailable'},
                }}
            />,
        );
        expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('Second');
        expect(container.textContent).toContain('Name unavailable');
        expect(update).not.toHaveBeenCalled();
        render(
            <QuerySettings
                mode="sections"
                sections={[{id: 'limits', title: 'Limits', content: <span>Custom limits</span>}]}
            />,
        );
        expect(container.textContent).toContain('Custom limits');
        expect(container.textContent).not.toContain('General');
    });
    it('keeps standalone typed attribute drafts private and applies rename/value atomically', () => {
        const update = vi.fn();
        render(
            <QueryAttributesEditor<number>
                items={[{id: 'stable', key: 'limit', value: 2}]}
                onChange={update}
                attributeCodec={{
                    format: String,
                    parse: (text) =>
                        Number.isFinite(Number(text))
                            ? {value: Number(text)}
                            : {error: 'Invalid number'},
                }}
            />,
        );
        click('Edit attribute 1');
        change('Attribute key 1', 'max');
        change('Attribute value 1', 'bad');
        click('Apply attribute 1');
        expect(update).not.toHaveBeenCalled();
        expect(container.textContent).toContain('Invalid number');
        change('Attribute value 1', '3');
        click('Apply attribute 1');
        expect(update).toHaveBeenCalledExactlyOnceWith(
            [{id: 'stable', key: 'max', value: 3}],
            [
                {operation: 'rename', id: 'stable'},
                {operation: 'update-value', id: 'stable'},
            ],
        );
    });
    it('renders built-in engine controls without aggregate query settings', () => {
        const update = vi.fn();
        render(
            <BuiltinEngineSettingsFields
                engineId="yql"
                options={{yql: {versions: ['stable']}}}
                value={{yqlVersion: 'stable'}}
                onChange={update}
                disabled
            />,
        );
        expect(container.querySelector('[aria-label="YQL version"]')).not.toBeNull();
        expect(container.textContent).not.toContain('Query name');
        expect(update).not.toHaveBeenCalled();
    });
    it.each(['aggregate', 'sections'] as const)(
        'preserves controlled field behavior and attribute drafts in %s mode',
        (mode) => {
            const onName = vi.fn();
            const onAttributes = vi.fn();
            const onBlur = vi.fn();
            const attributes = [{id: 'stable', key: 'pool', value: 'initial'}];
            const show = (title: string) => {
                if (mode === 'aggregate') {
                    render(
                        <QuerySettings
                            value={{
                                queryName: title,
                                access: 'private',
                                ytOperationTitle: '',
                                tokenIds: [],
                                attributes,
                                custom: {},
                            }}
                            onChange={(next, details) => {
                                if (details?.changes.some((item) => item.section === 'fields'))
                                    onName(next.queryName);
                                else onAttributes(next.attributes);
                            }}
                            errors={{fields: {queryName: 'Name unavailable'}}}
                            onFieldBlur={(field) => {
                                if (field.section === 'fields' && field.field === 'queryName')
                                    onBlur();
                            }}
                        />,
                    );
                    return;
                }
                render(
                    <QuerySettings
                        mode="sections"
                        general={{
                            queryName: {
                                value: title,
                                onChange: onName,
                                onBlur,
                                error: 'Name unavailable',
                            },
                        }}
                        attributes={{items: attributes, onChange: onAttributes}}
                    />,
                );
            };
            show('First');
            expect(container.textContent).toContain('Name unavailable');
            change('Query name', 'Edited');
            expect(onName).toHaveBeenCalledExactlyOnceWith('Edited');
            const titleInput = container.querySelector<HTMLInputElement>(
                '[aria-label="Query name"]',
            );
            act(() => titleInput?.dispatchEvent(new FocusEvent('focusout', {bubbles: true})));
            expect(onBlur).toHaveBeenCalledOnce();
            click('Edit attribute 1');
            change('Attribute value 1', 'Unapplied');
            const draftInput = container.querySelector<HTMLInputElement>(
                '[aria-label="Attribute value 1"]',
            );
            show('External');
            expect(container.querySelector('[aria-label="Query name"]')).toBe(titleInput);
            expect(titleInput?.value).toBe('External');
            expect(container.querySelector('[aria-label="Attribute value 1"]')).toBe(draftInput);
            expect(draftInput?.value).toBe('Unapplied');
            expect(onAttributes).not.toHaveBeenCalled();
            click('Apply attribute 1');
            expect(onAttributes).toHaveBeenCalledExactlyOnceWith(
                [{id: 'stable', key: 'pool', value: 'Unapplied'}],
                ...(mode === 'sections' ? [[{id: 'stable', operation: 'update-value'}]] : []),
            );
        },
    );

    it('keeps legacy required text fields and disclosure counters', () => {
        render(
            <QuerySettings
                value={{
                    queryName: 'Query',
                    access: 'private',
                    ytOperationTitle: 'Operation',
                    tokenIds: [],
                    attributes: [{id: 'x', key: 'pool', value: 'research'}],
                    custom: {},
                }}
                onChange={() => {}}
                tokens={[]}
            />,
        );
        for (const label of ['Query name', 'YT operation title']) {
            expect(
                container.querySelector(`[aria-label="${label}"]`)?.getAttribute('aria-required'),
            ).toBe('true');
        }
        for (const label of ['Access', 'Tokens']) {
            expect(
                container.querySelector(`[aria-label="${label}"]`)?.getAttribute('aria-required'),
            ).not.toBe('true');
        }
        const summaries = [...container.querySelectorAll('[aria-expanded]')].map(
            (node) => node.textContent,
        );
        expect(summaries).toContain('General4');
        expect(summaries).toContain('Attributes1');
    });

    it('renders explicit required indicators for independently bound text and select fields', () => {
        render(
            <QuerySettings
                mode="sections"
                general={{
                    queryName: {value: '', onChange: () => {}, required: true},
                    ytOperationTitle: {value: '', onChange: () => {}},
                    access: {value: 'private', onChange: () => {}, required: true},
                    tokens: {
                        value: [],
                        onChange: () => {},
                        items: [{id: 'token', title: 'Token'}],
                        required: true,
                    },
                }}
            />,
        );
        for (const label of ['Query name', 'Access', 'Tokens']) {
            expect(
                container.querySelector(`[aria-label="${label}"]`)?.getAttribute('aria-required'),
            ).toBe('true');
        }
        expect(
            container
                .querySelector('[aria-label="YT operation title"]')
                ?.getAttribute('aria-required'),
        ).not.toBe('true');
        expect(
            [...container.querySelectorAll('label')].filter((label) =>
                label.textContent?.includes('*'),
            ),
        ).toHaveLength(3);
        const accessControl = container.querySelector('[aria-label="Access"]');
        const tokensControl = container.querySelector('[aria-label="Tokens"]');
        render(
            <QuerySettings
                mode="sections"
                general={{
                    access: {value: 'private', onChange: () => {}, required: false},
                    tokens: {value: [], onChange: () => {}, items: [{id: 'token', title: 'Token'}]},
                }}
            />,
        );
        expect(container.querySelector('[aria-label="Access"]')).toBe(accessControl);
        expect(container.querySelector('[aria-label="Tokens"]')).toBe(tokensControl);
        expect(accessControl?.hasAttribute('aria-required')).toBe(false);
        expect(tokensControl?.hasAttribute('aria-required')).toBe(false);
    });
});
