import React, {FC, useCallback, useEffect, useId, useMemo, useRef} from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {editor} from 'monaco-editor';
// @ts-ignore monaco-editor ships its own types but the default resolution
// doesn't pick them up for this deep import path in this project setup.
import * as monaco from 'monaco-editor/editor/editor.api';
import './monaco-yql-languages/monaco.contribution';
import {MONACO_THEME_BY_UI, MonacoThemeName, YT_LIGHT_MONACO_THEME} from './MonacoEditorThemes';
import type {MonacoEditorProps} from '../../types/monacoEditor';
import type {EditorExtension} from '../../types/editorProviders';
import {attachEditorProviders} from '../../helpers/editorProviders';
import './MonacoEditor.scss';

export type {MonacoEditorConfig, MonacoEditorProps} from '../../types/monacoEditor';

const resolveTheme = (theme?: string): MonacoThemeName => {
    if (!theme) {
        return YT_LIGHT_MONACO_THEME;
    }
    return (MONACO_THEME_BY_UI[theme] ?? theme) as MonacoThemeName;
};

const block = cn('qp-monaco-editor');

export const MonacoEditor: FC<MonacoEditorProps> = ({
    value,
    onChange,
    language,
    theme,
    backgroundColor,
    readOnly,
    onClick,
    onFocus,
    onBlur,
    editorRef: externalEditorRef,
    preset,
    providers,
    providerContext,
    extensions,
    showStatusBar = false,
    diagnostics,
    highlightErrorLines = false,
    highlightedLine,
    onLineNumberClick,
    monacoConfig,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const statusBarRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const modelRef = useRef<editor.ITextModel | null>(null);
    const syncingValueRef = useRef(false);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // Keeps the latest `onClick` without re-subscribing the mouse listener
    // on every render (avoids stale closures without extra effect churn).
    const onClickRef = useRef(onClick);
    onClickRef.current = onClick;
    const eventCallbacks = useRef({onFocus, onBlur, onLineNumberClick});
    eventCallbacks.current = {onFocus, onBlur, onLineNumberClick};
    const providerRegistration = useRef<ReturnType<typeof attachEditorProviders> | null>(null);
    const providersRef = useRef(providers);
    providersRef.current = providers;
    const markerOwner = useId();
    const cleanups = useRef(new Set<() => void>());
    const activeExtensions = useRef(new Map<EditorExtension, () => void>());
    const extensionContainer = useRef<HTMLDivElement | null>(null);
    const context = useMemo(
        () => ({
            language: language ?? providerContext?.language,
            engineId: providerContext?.engineId,
            clusterId: providerContext?.clusterId,
            data: providerContext?.data,
        }),
        [
            language,
            providerContext?.language,
            providerContext?.engineId,
            providerContext?.clusterId,
            providerContext?.data,
        ],
    );

    // All integrations are released before the editor, regardless of React's effect cleanup order.
    const own = useCallback((cleanup: () => void) => {
        const release = () => {
            if (cleanups.current.delete(release)) cleanup();
        };
        cleanups.current.add(release);
        return release;
    }, []);

    if (
        monacoConfig?.model !== undefined &&
        [
            externalEditorRef,
            preset,
            providers,
            providerContext,
            extensions,
            showStatusBar,
            diagnostics,
            highlightErrorLines,
            highlightedLine !== undefined,
            onLineNumberClick,
            onFocus,
            onBlur,
        ].some(Boolean)
    ) {
        throw new Error(
            'MonacoEditor integrations require the component-owned model; omit monacoConfig.model.',
        );
    }

    // Create the editor + model once per mount, dispose both on unmount.
    useEffect(() => {
        if (!containerRef.current) return undefined;
        const ownedCleanups = cleanups.current;
        const mountedExtensions = activeExtensions.current;

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
            if (
                e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS &&
                e.target.position
            ) {
                eventCallbacks.current.onLineNumberClick?.(e.target.position.lineNumber);
            }
        });
        const focusSubscription = editorInstance.onDidFocusEditorText(() =>
            eventCallbacks.current.onFocus?.(),
        );
        const blurSubscription = editorInstance.onDidBlurEditorText(() =>
            eventCallbacks.current.onBlur?.(),
        );
        const contentSubscription = model.onDidChangeContent(() => {
            if (!syncingValueRef.current) onChangeRef.current?.(model.getValue());
        });

        return () => {
            for (const release of [...ownedCleanups]) {
                try {
                    release();
                } catch (error) {
                    // A faulty external plugin must not prevent other integrations from being disposed.
                    console.error('MonacoEditor cleanup failed', error);
                }
            }
            mountedExtensions.clear();
            contentSubscription.dispose();
            mouseDownSubscription.dispose();
            focusSubscription.dispose();
            blurSubscription.dispose();
            editorInstance.dispose();
            model.dispose();
            editorRef.current = null;
            modelRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-apply options (e.g. `readOnly`, `monacoConfig`) when they change.
    useEffect(() => {
        editorRef.current?.updateOptions({
            readOnly,
            ...monacoConfig,
        });
    }, [readOnly, monacoConfig]);

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

    useEffect(() => {
        const instance = editorRef.current;
        if (!instance || !externalEditorRef) return undefined;
        if (typeof externalEditorRef === 'function') {
            const cleanup = externalEditorRef(instance);
            return own(() => {
                if (typeof cleanup === 'function') cleanup();
                else externalEditorRef(null);
            });
        }
        const objectRef = externalEditorRef;
        objectRef.current = instance;
        return own(() => {
            objectRef.current = null;
        });
    }, [externalEditorRef, own]);

    useEffect(() => {
        const instance = editorRef.current;
        const model = modelRef.current;
        if (!instance || !model) return undefined;
        const created = preset?.create({editor: instance, model, monaco, context});
        try {
            // Opt-in languages may only become available after the preset is created.
            if (context.language && model.getLanguageId() !== context.language) {
                monaco.editor.setModelLanguage(model, context.language);
            }
            const registration = attachEditorProviders(
                monaco,
                model,
                created?.providers,
                providersRef.current,
            );
            providerRegistration.current = registration;
            return own(() => {
                providerRegistration.current = null;
                try {
                    registration.dispose();
                } finally {
                    created?.dispose?.();
                }
            });
        } catch (error) {
            created?.dispose?.();
            throw error;
        }
    }, [preset, context, own]);

    useEffect(() => {
        providerRegistration.current?.update(providers);
    }, [providers]);

    useEffect(() => {
        const instance = editorRef.current;
        const model = modelRef.current;
        if (!instance || !model) return;
        const element = statusBarRef.current;
        const next = new Set(extensions);
        for (const [extension, release] of activeExtensions.current) {
            if (!next.has(extension) || extensionContainer.current !== element) {
                activeExtensions.current.delete(extension);
                release();
            }
        }
        extensionContainer.current = element;
        for (const extension of next) {
            if (!activeExtensions.current.has(extension)) {
                const cleanup = extension.setup({
                    editor: instance,
                    model,
                    monaco,
                    statusBarElement: element,
                });
                activeExtensions.current.set(extension, own(cleanup));
            }
        }
        instance.layout();
    }, [extensions, showStatusBar, own]);

    useEffect(() => {
        const instance = editorRef.current;
        const model = modelRef.current;
        if (!instance || !model || diagnostics === undefined) return undefined;
        monaco.editor.setModelMarkers(model, markerOwner, [...diagnostics]);
        const lines = new Set<number>();
        if (highlightErrorLines) {
            for (const marker of diagnostics) {
                if (marker.severity !== monaco.MarkerSeverity.Error) continue;
                for (
                    let line = Math.max(1, marker.startLineNumber);
                    line <= Math.min(model.getLineCount(), marker.endLineNumber);
                    line++
                ) {
                    lines.add(line);
                }
            }
        }
        const decorations = instance.createDecorationsCollection(
            [...lines].map((line) => ({
                range: new monaco.Range(line, 1, line, 1),
                options: {isWholeLine: true, className: block('error-line')},
            })),
        );
        return own(() => {
            monaco.editor.setModelMarkers(model, markerOwner, []);
            decorations.clear();
        });
    }, [diagnostics, highlightErrorLines, markerOwner, own]);

    useEffect(() => {
        const instance = editorRef.current;
        const model = modelRef.current;
        if (!instance || !model || highlightedLine === undefined) return undefined;
        const decorations = instance.createDecorationsCollection();
        const update = () => {
            if (
                !Number.isInteger(highlightedLine) ||
                highlightedLine < 1 ||
                highlightedLine > model.getLineCount()
            ) {
                decorations.clear();
                return;
            }
            decorations.set([
                {
                    range: new monaco.Range(highlightedLine, 1, highlightedLine, 1),
                    options: {isWholeLine: true, className: block('highlighted-line')},
                },
            ]);
        };
        update();
        if (
            Number.isInteger(highlightedLine) &&
            highlightedLine >= 1 &&
            highlightedLine <= model.getLineCount()
        ) {
            instance.revealLineInCenterIfOutsideViewport(highlightedLine);
        }
        const subscription = model.onDidChangeContent(update);
        return own(() => {
            subscription.dispose();
            decorations.clear();
        });
    }, [highlightedLine, own]);

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

    return (
        <Flex direction="column" className={block(null, className)}>
            <div ref={containerRef} className={block('surface')} />
            {showStatusBar && (
                <div ref={statusBarRef} className={block('status-bar')} role="status" />
            )}
        </Flex>
    );
};
