// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ParameterDocument} from '../../src/modules/QueryParameters/internal/ParameterDocument';
import {setLang} from '../../src/i18n';
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
    async function render(value = '{"a":1}', editing = true, disabled = false, error?: string) {
        await act(async () =>
            root.render(
                <ThemeProvider>
                    <ParameterDocument
                        value={value}
                        onUpdate={onUpdate}
                        editing={editing}
                        disabled={disabled}
                        label="Document"
                        error={error}
                    />
                </ThemeProvider>,
            ),
        );
    }
    function change(value: string) {
        const input = container.querySelector('textarea[aria-label="Document"]');
        if (!input) throw new Error('Missing editor');
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(
                input,
                value,
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });
    }
    it('updates the form draft immediately and preserves exact document text', async () => {
        await render();
        const value = '{\n  "n": 12345678901234567890\n}';
        change(value);
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith(value);
    });
    it('follows controlled value changes without emitting another update', async () => {
        await render();
        change('{"new":true}');
        await render('{"new":true}');
        onUpdate.mockClear();
        await render('{"a":1}');
        expect(onUpdate).not.toHaveBeenCalled();
        expect(
            container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Document"]')?.value,
        ).toBe('{"a":1}');
    });
    it('forwards invalid drafts and displays validation supplied by the form', async () => {
        await render();
        change('{');
        expect(onUpdate).toHaveBeenLastCalledWith('{');
        await render('{', true, false, 'Enter a valid JSON document.');
        expect(container.querySelector('[role="alert"]')?.textContent).toBe(
            'Enter a valid JSON document.',
        );
        expect(container.querySelector('textarea')?.value).toBe('{');
        change('null');
        expect(onUpdate).toHaveBeenLastCalledWith('null');
        await render('null');
        expect(container.querySelector('[role="alert"]')).toBeNull();
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
    it('makes the NULL editor read-only and ignores updates until enabled', async () => {
        await render('', true, true);
        expect(container.querySelector('textarea')?.readOnly).toBe(true);
        expect(container.querySelector('textarea')?.tabIndex).toBe(-1);
        change('{"ignored":true}');
        expect(onUpdate).not.toHaveBeenCalled();
        await render('{}');
        expect(container.querySelector('textarea')?.readOnly).toBe(false);
        expect(container.querySelector('textarea')?.tabIndex).toBe(0);
        change('{"enabled":true}');
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('{"enabled":true}');
    });
});
