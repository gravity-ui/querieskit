import React, {FC, useEffect, useRef} from 'react';
// @ts-ignore monaco-editor ships its own types but the default resolution
// doesn't pick them up for this deep import path in this project setup.
import * as monaco from 'monaco-editor/editor/editor.api';

export type MonacoEditorConfig = Omit<monaco.editor.IStandaloneEditorConstructionOptions, 'theme'>;

type Props = {
    value: string;
    readOnly?: boolean;
    language?: string;
    onClick?: (e: monaco.editor.IEditorMouseEvent) => void;
    monacoConfig?: MonacoEditorConfig;
    className?: string;
};

export const MonacoEditor: FC<Props> = ({
    value,
    language,
    readOnly,
    onClick,
    monacoConfig,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const modelRef = useRef<monaco.editor.ITextModel | null>(null);
    // Keeps the latest `onClick` without re-subscribing the mouse listener
    // on every render (avoids stale closures without extra effect churn).
    const onClickRef = useRef(onClick);
    onClickRef.current = onClick;

    // Create the editor + model once per mount, dispose both on unmount.
    useEffect(() => {
        if (!containerRef.current) return undefined;

        const model = monaco.editor.createModel(value, language);
        modelRef.current = model;

        const editorInstance = monaco.editor.create(containerRef.current, {
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
            ...monacoConfig,
        });
        editorRef.current = editorInstance;

        const mouseDownSubscription = editorInstance.onMouseDown((e) => {
            onClickRef.current?.(e);
        });

        return () => {
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
            model.setValue(value);
        }
    }, [value]);

    // Keep the model language in sync with the `language` prop.
    useEffect(() => {
        const model = modelRef.current;
        if (model && language !== undefined) {
            monaco.editor.setModelLanguage(model, language);
        }
    }, [language]);

    // Re-apply options (e.g. `readOnly`, `monacoConfig`) when they change.
    useEffect(() => {
        editorRef.current?.updateOptions({
            readOnly,
            ...monacoConfig,
        });
    }, [readOnly, monacoConfig]);

    return <div ref={containerRef} className={className}></div>;
};
