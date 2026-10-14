// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ParameterDocument} from '../../src/modules/QueryParameters/internal/ParameterDocument';
import {setLang} from '../../src/i18n';

vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: ({value, onChange}: {value: string; onChange: (value: string) => void}) => (
        <textarea
            aria-label="JSON editor"
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    ),
}));
const {colorize} = vi.hoisted(() => ({colorize: vi.fn()}));
vi.mock('monaco-editor/editor/editor.api', () => ({
    editor: {
        colorize,
        tokenize: (value: string) =>
            value.split(/\r\n|\r|\n/).map(() => [{offset: 0, type: 'string.json'}]),
    },
}));
vi.mock('monaco-editor/languages/features/json/register', () => ({}));

describe('ParameterDocument', () => {
    let root: Root;
    let container: HTMLDivElement;
    const onUpdate = vi.fn();
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        setLang('en');
        vi.stubGlobal('matchMedia', () => ({
            matches: false,
            addListener() {},
            removeListener() {},
            addEventListener() {},
            removeEventListener() {},
        }));
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
        onUpdate.mockReset();
        colorize.mockReset().mockRejectedValue(new Error('unavailable'));
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });
    async function render(value = '{"a":1}', editing = true, disabled = false) {
        await act(async () =>
            root.render(
                <ThemeProvider>
                    <ParameterDocument
                        value={value}
                        onUpdate={onUpdate}
                        editing={editing}
                        disabled={disabled}
                        label="Document"
                    />
                </ThemeProvider>,
            ),
        );
    }
    async function click(text: string) {
        const button = [...document.querySelectorAll('button')].find(
            (node) => node.getAttribute('aria-label') === text || node.textContent === text,
        );
        if (!button) throw new Error(`Missing button ${text}`);
        await act(async () => button.click());
    }
    function change(value: string) {
        const input = document.querySelector('textarea[aria-label="JSON editor"]');
        if (!input) throw new Error('Missing editor');
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(
                input,
                value,
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });
    }
    it('applies exact text only after Apply', async () => {
        await render();
        await click('Edit document');
        const value = '{\n  "n": 12345678901234567890\n}';
        change(value);
        expect(onUpdate).not.toHaveBeenCalled();
        await click('Apply');
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith(value);
    });
    it('cancels edits and reopens with the original value', async () => {
        await render();
        await click('Edit document');
        change('{"new":true}');
        await click('Cancel');
        expect(onUpdate).not.toHaveBeenCalled();
        await click('Edit document');
        expect(
            document.querySelector<HTMLTextAreaElement>('textarea[aria-label="JSON editor"]')
                ?.value,
        ).toBe('{"a":1}');
    });
    it('blocks invalid JSON and allows correction', async () => {
        await render();
        await click('Edit document');
        change('{');
        await click('Apply');
        expect(onUpdate).not.toHaveBeenCalled();
        expect(document.body.textContent).toContain('Enter a valid JSON document.');
        change('null');
        await click('Apply');
        expect(onUpdate).toHaveBeenCalledWith('null');
    });
    it('preserves readonly text when colorization fails', async () => {
        const value = '  {"a":1}\n';
        await render(value, false);
        expect(container.textContent).toBe(value);
    });
    it('renders colorized output and immediately drops stale output on a value change', async () => {
        colorize.mockResolvedValueOnce('<span>{&quot;a&quot;:1}</span>');
        await render('{"a":1}', false);
        expect(container.querySelector('span')?.textContent).toBe('{"a":1}');
        colorize.mockImplementationOnce(() => new Promise(() => {}));
        await render('{"b":2}', false);
        expect(container.textContent).toBe('{"b":2}');
    });
    it('keeps tabs, CRLF and large numbers unchanged after highlighting', async () => {
        const value = '{\r\n\t"n": 12345678901234567890\r\n}';
        colorize.mockResolvedValueOnce('highlighted');
        await render(value, false);
        expect(container.textContent).toBe(value);
    });
    it('disables document actions for NULL', async () => {
        await render('', true, true);
        expect(container.querySelector('textarea')?.disabled).toBe(true);
        expect(container.querySelector('button')?.disabled).toBe(true);
    });
});
