// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {MonacoEditor} from '../../src/components/MonacoEditor';
import type {MonacoEditorProps} from '../../src/types/monacoEditor';

const mock = vi.hoisted(() => {
    let value = '';
    let listener: (() => void) | undefined;
    const change = (text: string) => {
        value = text;
        listener?.();
    };
    const contentDispose = vi.fn(() => {
        listener = undefined;
    });
    const mouseDispose = vi.fn();
    const model = {
        getValue: vi.fn(() => value),
        setValue: vi.fn(change),
        getFullModelRange: vi.fn(() => ({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 9,
        })),
        onDidChangeContent: vi.fn((callback: () => void) => {
            listener = callback;
            return {dispose: contentDispose};
        }),
        dispose: vi.fn(),
    };
    const instance = {
        getDomNode: vi.fn<() => HTMLElement | null>(() => null),
        onMouseDown: vi.fn(() => ({dispose: mouseDispose})),
        executeEdits: vi.fn((_source: string, edits: {text: string}[]) => {
            change(edits[0].text);
            return true;
        }),
        pushUndoStop: vi.fn(),
        updateOptions: vi.fn(),
        dispose: vi.fn(),
    };
    const api = {
        createModel: vi.fn((text: string) => {
            value = text;
            return model;
        }),
        create: vi.fn(() => instance),
        setModelLanguage: vi.fn(),
        setTheme: vi.fn(),
        defineTheme: vi.fn(),
    };
    return {model, instance, api, change, contentDispose, mouseDispose};
});

vi.mock('monaco-editor/editor/editor.api', () => ({editor: mock.api}));
vi.mock('../../src/components/MonacoEditor/monaco-yql-languages/monaco.contribution', () => ({}));

describe('MonacoEditor', () => {
    let container: HTMLDivElement;
    let root: Root;
    let mounted: boolean;

    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        mounted = true;
    });

    afterEach(() => {
        if (mounted) act(() => root.unmount());
        container.remove();
    });

    function render(props: Partial<MonacoEditorProps> = {}) {
        act(() => root.render(<MonacoEditor value="SELECT 1" {...props} />));
    }

    it('reports edits to the latest callback and accepts the controlled echo without replacing text', () => {
        const first = vi.fn();
        const latest = vi.fn();
        render({onChange: first});
        render({onChange: latest});
        act(() => mock.change('SELECT 2'));
        expect(first).not.toHaveBeenCalled();
        expect(latest).toHaveBeenCalledExactlyOnceWith('SELECT 2');
        render({value: 'SELECT 2', onChange: latest});
        expect(mock.instance.executeEdits).not.toHaveBeenCalled();
        expect(mock.model.setValue).not.toHaveBeenCalled();
        expect(mock.model.onDidChangeContent).toHaveBeenCalledTimes(1);
    });

    it('applies external edits with undo stops without echoing onChange', () => {
        const onChange = vi.fn();
        render({onChange});
        render({value: 'SELECT\n    1', onChange});
        expect(mock.instance.executeEdits).toHaveBeenCalledWith('external-value', [
            {range: mock.model.getFullModelRange(), text: 'SELECT\n    1'},
        ]);
        expect(mock.instance.pushUndoStop).toHaveBeenCalledTimes(2);
        expect(mock.model.setValue).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
        // A later model change (including undo) must still reach the consumer.
        act(() => mock.change('SELECT 1'));
        expect(onChange).toHaveBeenCalledExactlyOnceWith('SELECT 1');
    });

    it('preserves read-only value synchronization without callbacks', () => {
        const onChange = vi.fn();
        render({readOnly: true, onChange});
        render({value: 'SELECT 2', readOnly: true, onChange});
        expect(mock.model.setValue).toHaveBeenCalledExactlyOnceWith('SELECT 2');
        expect(mock.instance.executeEdits).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('updates language and options without recreating the editor and disposes owned resources', () => {
        render({language: 'yql'});
        render({language: 'clickhouse', readOnly: true, className: 'settings-open'});
        expect(mock.api.create).toHaveBeenCalledTimes(1);
        expect(mock.api.createModel).toHaveBeenCalledTimes(1);
        expect(mock.api.setModelLanguage).toHaveBeenLastCalledWith(mock.model, 'clickhouse');
        expect(mock.instance.updateOptions).toHaveBeenLastCalledWith({readOnly: true});
        act(() => root.unmount());
        mounted = false;
        expect(mock.contentDispose).toHaveBeenCalledTimes(1);
        expect(mock.mouseDispose).toHaveBeenCalledTimes(1);
        expect(mock.instance.dispose).toHaveBeenCalledTimes(1);
        expect(mock.model.dispose).toHaveBeenCalledTimes(1);
    });
});
