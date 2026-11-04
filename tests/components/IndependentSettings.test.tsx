// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryAttributesEditor} from '../../src/modules/QueryAttributesEditor';
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
});
