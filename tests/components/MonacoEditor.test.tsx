// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {MonacoEditor} from '../../src/components/MonacoEditor';
import type {MonacoEditorProps} from '../../src/types/monacoEditor';

const mock = vi.hoisted(() => {
    let value = '';
    let readOnly = false;
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
        getLanguageId: vi.fn(() => 'yql'),
        getLineCount: vi.fn(() => value.split('\n').length),
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
        onDidFocusEditorText: vi.fn((_callback: () => void) => ({dispose: vi.fn()})),
        onDidBlurEditorText: vi.fn((_callback: () => void) => ({dispose: vi.fn()})),
        layout: vi.fn(),
        revealLineInCenterIfOutsideViewport: vi.fn(),
        createDecorationsCollection: vi.fn((_decorations?: unknown[]) => ({
            set: vi.fn(),
            clear: vi.fn(),
        })),
        executeEdits: vi.fn((_source: string, edits: {text: string}[]) => {
            if (readOnly) return false;
            change(edits[0].text);
            return true;
        }),
        pushUndoStop: vi.fn(),
        updateOptions: vi.fn((options: {readOnly?: boolean}) => {
            readOnly = options.readOnly ?? false;
        }),
        dispose: vi.fn(),
    };
    const api = {
        createModel: vi.fn((text: string) => {
            value = text;
            return model;
        }),
        create: vi.fn((_element: HTMLElement, options: {readOnly?: boolean}) => {
            readOnly = options.readOnly ?? false;
            return instance;
        }),
        setModelLanguage: vi.fn(),
        setTheme: vi.fn(),
        defineTheme: vi.fn(),
        setModelMarkers: vi.fn(),
        MouseTargetType: {GUTTER_LINE_NUMBERS: 2},
    };
    return {model, instance, api, change, contentDispose, mouseDispose};
});

const providerMock = vi.hoisted(() => ({
    attach: vi.fn(() => ({dispose: vi.fn(), update: vi.fn()})),
}));
vi.mock('../../src/helpers/editorProviders', () => ({attachEditorProviders: providerMock.attach}));

vi.mock('monaco-editor/editor/editor.api', () => ({
    editor: mock.api,
    MarkerSeverity: {Error: 8},
    Range: class {
        constructor(
            public startLineNumber: number,
            public startColumn: number,
            public endLineNumber: number,
            public endColumn: number,
        ) {}
    },
}));
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

    it('updates options before applying text when leaving read-only mode', () => {
        const onChange = vi.fn();
        render({readOnly: true, onChange});
        render({readOnly: false, value: 'SELECT 2', onChange});
        expect(mock.model.getValue()).toBe('SELECT 2');
        expect(mock.instance.executeEdits).toHaveBeenCalledTimes(1);
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

    it('publishes and clears refs, and delivers events to current callbacks', () => {
        const ref = React.createRef<import('monaco-editor').editor.IStandaloneCodeEditor>();
        const first = vi.fn();
        const latest = vi.fn();
        const line = vi.fn();
        render({editorRef: ref, onFocus: first});
        expect(ref.current).toBe(mock.instance);
        render({editorRef: ref, onFocus: latest, onBlur: latest, onLineNumberClick: line});
        mock.instance.onDidFocusEditorText.mock.calls[0][0]();
        mock.instance.onDidBlurEditorText.mock.calls[0][0]();
        expect(first).not.toHaveBeenCalled();
        expect(latest).toHaveBeenCalledTimes(2);
        const mouse = mock.instance.onMouseDown.mock.calls[0][0] as unknown as (
            event: unknown,
        ) => void;
        mouse({target: {type: 2, position: {lineNumber: 3}}});
        mouse({target: {type: 6, position: {lineNumber: 4}}});
        expect(line).toHaveBeenCalledExactlyOnceWith(3);
        act(() => root.unmount());
        mounted = false;
        expect(ref.current).toBeNull();
    });

    it('reconciles extensions by identity and cleans them before editor disposal', () => {
        const cleanup = vi.fn(() => expect(mock.instance.dispose).not.toHaveBeenCalled());
        const setup = vi.fn(() => cleanup);
        const extension = {setup};
        render({extensions: [extension]});
        render({value: 'SELECT 2', extensions: [extension]});
        expect(setup).toHaveBeenCalledTimes(1);
        expect(setup.mock.calls[0][0].statusBarElement).toBeNull();
        render({extensions: [extension], showStatusBar: true});
        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(setup).toHaveBeenCalledTimes(2);
        expect(setup.mock.calls[1][0].statusBarElement).toBe(
            container.querySelector('[role="status"]'),
        );
        act(() => root.unmount());
        mounted = false;
        expect(cleanup).toHaveBeenCalledTimes(2);
    });

    it('releases each Strict Mode setup exactly once', () => {
        const cleanups: ReturnType<typeof vi.fn>[] = [];
        const extension = {
            setup: vi.fn(() => {
                const cleanup = vi.fn();
                cleanups.push(cleanup);
                return cleanup;
            }),
        };
        act(() =>
            root.render(
                <React.StrictMode>
                    <MonacoEditor value="" extensions={[extension]} />
                </React.StrictMode>,
            ),
        );
        expect(extension.setup).toHaveBeenCalledTimes(2);
        expect(cleanups[0]).toHaveBeenCalledTimes(1);
        expect(cleanups[1]).not.toHaveBeenCalled();
        act(() => root.unmount());
        mounted = false;
        expect(cleanups[1]).toHaveBeenCalledTimes(1);
    });

    it('reconnects the preset for context changes, not text changes, and releases both layers', () => {
        const dispose = vi.fn();
        const preset = {create: vi.fn(() => ({dispose}))};
        render({preset, language: 'yql', providerContext: {clusterId: 'a'}});
        render({preset, language: 'yql', value: 'SELECT 2', providerContext: {clusterId: 'a'}});
        expect(preset.create).toHaveBeenCalledTimes(1);
        render({preset, language: 'yql', providerContext: {clusterId: 'b'}});
        expect(preset.create).toHaveBeenCalledTimes(2);
        expect(dispose).toHaveBeenCalledTimes(1);
        expect(providerMock.attach.mock.results[0].value.dispose).toHaveBeenCalledTimes(1);
        act(() => root.unmount());
        mounted = false;
        expect(dispose).toHaveBeenCalledTimes(2);
        expect(providerMock.attach.mock.results[1].value.dispose).toHaveBeenCalledTimes(1);
    });

    it('updates provider overrides without recreating the preset and disposes providers before the preset', () => {
        const dispose = vi.fn(() => {
            const registration = providerMock.attach.mock.results.at(-1)?.value;
            expect(registration?.dispose).toHaveBeenCalledOnce();
            expect(mock.instance.dispose).not.toHaveBeenCalled();
        });
        const preset = {create: vi.fn(() => ({dispose}))};
        const hover = {provideHover: vi.fn()};
        render({preset});
        const registration = providerMock.attach.mock.results[0].value;
        render({preset, providers: {hover: {mode: 'replace', provider: hover}}});
        render({preset, providers: {hover: {mode: 'replace', provider: hover}}});
        render({preset, providers: {hover: false}});
        expect(preset.create).toHaveBeenCalledOnce();
        expect(providerMock.attach).toHaveBeenCalledOnce();
        expect(registration.update).toHaveBeenLastCalledWith({hover: false});
        expect(registration.dispose).not.toHaveBeenCalled();
        expect(dispose).not.toHaveBeenCalled();
        act(() => root.unmount());
        mounted = false;
        expect(dispose).toHaveBeenCalledOnce();
    });

    it('releases preset and provider registrations exactly once in Strict Mode', () => {
        const dispose = vi.fn();
        const preset = {create: vi.fn(() => ({dispose}))};
        act(() =>
            root.render(
                <React.StrictMode>
                    <MonacoEditor value="" preset={preset} />
                </React.StrictMode>,
            ),
        );
        expect(preset.create).toHaveBeenCalledTimes(2);
        expect(providerMock.attach).toHaveBeenCalledTimes(2);
        expect(providerMock.attach.mock.results[0].value.dispose).toHaveBeenCalledOnce();
        expect(providerMock.attach.mock.results[1].value.dispose).not.toHaveBeenCalled();
        expect(dispose).toHaveBeenCalledOnce();
        act(() => root.unmount());
        mounted = false;
        expect(providerMock.attach.mock.results[1].value.dispose).toHaveBeenCalledOnce();
        expect(dispose).toHaveBeenCalledTimes(2);
    });

    it('rejects mixing external models with model-owned integrations', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            expect(() =>
                render({monacoConfig: {model: null}, providers: {completion: false}}),
            ).toThrow('component-owned model');
            expect(mock.api.create).not.toHaveBeenCalled();
        } finally {
            error.mockRestore();
        }
    });

    it('sets only owned markers and deduplicates error lines, then clears removed diagnostics', () => {
        const marker = {
            severity: 8,
            message: 'Invalid expression',
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 1,
            endColumn: 4,
        };
        render({
            diagnostics: [marker, {...marker, message: 'Another error'}],
            highlightErrorLines: true,
        });
        const owner = mock.api.setModelMarkers.mock.calls[0][1];
        expect(mock.api.setModelMarkers).toHaveBeenLastCalledWith(mock.model, owner, [
            marker,
            {...marker, message: 'Another error'},
        ]);
        const collection = mock.instance.createDecorationsCollection.mock.results[0].value;
        expect(mock.instance.createDecorationsCollection.mock.calls[0][0]).toHaveLength(1);
        render();
        expect(mock.api.setModelMarkers).toHaveBeenLastCalledWith(mock.model, owner, []);
        expect(collection.clear).toHaveBeenCalledTimes(1);
    });

    it('reveals only valid highlighted lines and clears removed highlights', () => {
        render({value: 'a\nb', highlightedLine: 2});
        expect(mock.instance.revealLineInCenterIfOutsideViewport).toHaveBeenCalledExactlyOnceWith(
            2,
        );
        const collection = mock.instance.createDecorationsCollection.mock.results[0].value;
        render({highlightedLine: 99});
        expect(collection.clear).toHaveBeenCalled();
        expect(mock.instance.revealLineInCenterIfOutsideViewport).toHaveBeenCalledTimes(1);
        render();
        expect(
            mock.instance.createDecorationsCollection.mock.results[1].value.clear,
        ).toHaveBeenCalled();
    });
});
