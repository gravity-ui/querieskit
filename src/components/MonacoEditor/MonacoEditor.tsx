import React, {FC, useEffect, useRef} from 'react';
import type {editor} from 'monaco-editor';
// @ts-ignore monaco-editor ships its own types but the default resolution
// doesn't pick them up for this deep import path in this project setup.
import * as monaco from 'monaco-editor/editor/editor.api';
import './monaco-yql-languages/monaco.contribution';
import {MONACO_THEME_BY_UI, MonacoThemeName, YT_LIGHT_MONACO_THEME} from './MonacoEditorThemes';
import type {MonacoEditorProps} from '../../types/monacoEditor';

export type {MonacoEditorConfig, MonacoEditorProps} from '../../types/monacoEditor';

const resolveTheme = (theme?: string): MonacoThemeName => {
    if (!theme) {
        return YT_LIGHT_MONACO_THEME;
    }
    return (MONACO_THEME_BY_UI[theme] ?? theme) as MonacoThemeName;
};

export const MonacoEditor: FC<MonacoEditorProps> = ({
    value,
    onChange,
    language,
    theme,
    backgroundColor,
    readOnly,
    onClick,
    monacoConfig,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const modelRef = useRef<editor.ITextModel | null>(null);
    const syncingValueRef = useRef(false);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // Keeps the latest `onClick` without re-subscribing the mouse listener
    // on every render (avoids stale closures without extra effect churn).
    const onClickRef = useRef(onClick);
    onClickRef.current = onClick;

    // Create the editor + model once per mount, dispose both on unmount.
    useEffect(() => {
        if (!containerRef.current) return undefined;

        const model: editor.ITextModel = monaco.editor.createModel(value, language);
        modelRef.current = model;

        const editorInstance: editor.IStandaloneCodeEditor = monaco.editor.create(
            containerRef.current,
            {
                model,
                renderLineHighlight: 'none',
                colorDecorators: true,
                automaticLayout: true,
                readOnly,
                minimap: {
                    enabled: false,
                },
                lineNumbers: 'on',
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: 'off',
                theme: resolveTheme(theme),
                ...monacoConfig,
            },
        );
        editorRef.current = editorInstance;

        const mouseDownSubscription = editorInstance.onMouseDown((e) => {
            onClickRef.current?.(e);
        });
        const contentSubscription = model.onDidChangeContent(() => {
            if (!syncingValueRef.current) onChangeRef.current?.(model.getValue());
        });

        return () => {
            contentSubscription.dispose();
            mouseDownSubscription.dispose();
            editorInstance.dispose();
            model.dispose();
            editorRef.current = null;
            modelRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the model text in sync with the `value` prop after the initial mount.
    useEffect(() => {
        const model = modelRef.current;
        if (model && model.getValue() !== value) {
            syncingValueRef.current = true;
            try {
                const instance = editorRef.current;
                if (instance && !(monacoConfig?.readOnly ?? readOnly)) {
                    // External edits (such as formatting) remain undoable.
                    instance.pushUndoStop();
                    instance.executeEdits('external-value', [
                        {range: model.getFullModelRange(), text: value},
                    ]);
                    instance.pushUndoStop();
                } else {
                    model.setValue(value);
                }
            } finally {
                syncingValueRef.current = false;
            }
        }
    }, [value, readOnly, monacoConfig?.readOnly]);

    // Keep the model language in sync with the `language` prop.
    useEffect(() => {
        const model = modelRef.current;
        if (model && language !== undefined) {
            monaco.editor.setModelLanguage(model, language);
        }
    }, [language]);

    // Keep the editor theme in sync with the `theme` prop.
    useEffect(() => {
        monaco.editor.setTheme(resolveTheme(theme));
    }, [theme]);

    // Override Monaco's color tokens on this editor only, without changing the
    // shared Monaco theme or selecting its internal markup. CSS variables also
    // follow the surrounding UI theme without recreating the editor.
    useEffect(() => {
        const element = editorRef.current?.getDomNode();
        if (!element || backgroundColor === undefined) return undefined;
        const tokens = ['--vscode-editor-background', '--vscode-editorGutter-background'];
        for (const token of tokens) element.style.setProperty(token, backgroundColor);
        return () => {
            for (const token of tokens) element.style.removeProperty(token);
        };
    }, [backgroundColor]);

    // Re-apply options (e.g. `readOnly`, `monacoConfig`) when they change.
    useEffect(() => {
        editorRef.current?.updateOptions({
            readOnly,
            ...monacoConfig,
        });
    }, [readOnly, monacoConfig]);

    return <div ref={containerRef} className={className}></div>;
};
