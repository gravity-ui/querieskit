import React, {useEffect, useRef} from 'react';
import {useThemeValue} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {editor} from 'monaco-editor';
// @ts-ignore Monaco's deep entrypoint does not expose its bundled declarations.
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/languages/features/json/register';
import '../MonacoEditor/monaco-yql-languages/monaco.contribution';
import {MONACO_THEME_BY_UI} from '../MonacoEditor/MonacoEditorThemes';
import type {MonacoDiffEditorProps} from '../../types/monacoDiffEditor';
import './MonacoDiffEditor.scss';

const block = cn('qp-monaco-diff-editor');

// Monaco 0.56 exposes this at runtime but omits it from its public declarations.
// Fail closed if a later version removes it: incomplete diffs must not look complete.
type DiffResultEditor = editor.IStandaloneDiffEditor & {
    getDiffComputationResult?: () => {quitEarly: boolean} | null;
};

const diffTokens: Record<string, string> = {
    'editor-background': 'base-background',
    'editorGutter-background': 'base-generic-ultralight',
    'diffEditor-insertedLineBackground': 'base-positive-light',
    'diffEditor-insertedTextBackground': 'base-positive-medium',
    'diffEditor-removedLineBackground': 'base-danger-light',
    'diffEditor-removedTextBackground': 'base-danger-medium',
    'diffEditorGutter-insertedLineBackground': 'base-positive-light',
    'diffEditorGutter-removedLineBackground': 'base-danger-light',
    'diffEditor-diagonalFill': 'line-generic',
};

export function MonacoDiffEditor({
    original,
    modified,
    language = 'plaintext',
    theme,
    mode = 'split',
    readOnly,
    onChange,
    onDiffChange,
    maxHeight = 600,
    className,
}: MonacoDiffEditorProps) {
    const themeValue = useThemeValue();
    const resolvedTheme = MONACO_THEME_BY_UI[theme ?? themeValue] ?? theme ?? themeValue;
    const isReadOnly = readOnly ?? !onChange;
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
    const modelsRef = useRef<editor.IDiffEditorModel | null>(null);
    const syncingRef = useRef(false);
    const callbacksRef = useRef({onChange, onDiffChange});
    callbacksRef.current = {onChange, onDiffChange};
    const heightRef = useRef(maxHeight);
    heightRef.current = Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : 600;
    const resizeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;
        const models: editor.IDiffEditorModel = {
            original: monaco.editor.createModel(original, language),
            modified: monaco.editor.createModel(modified, language),
        };
        const instance: editor.IStandaloneDiffEditor = monaco.editor.createDiffEditor(container, {
            theme: resolvedTheme,
            readOnly: isReadOnly,
            originalEditable: false,
            renderSideBySide: mode === 'split',
            enableSplitViewResizing: false,
            useInlineViewWhenSpaceIsLimited: false,
            automaticLayout: true,
            ignoreTrimWhitespace: false,
            renderMarginRevertIcon: !isReadOnly,
            glyphMargin: true,
            renderGutterMenu: !isReadOnly && mode === 'unified',
            renderOverviewRuler: false,
            minimap: {enabled: false},
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            padding: {top: 8, bottom: 8},
        });
        editorRef.current = instance;
        modelsRef.current = models;
        // Own the view model explicitly so pending worker computations are cancelled
        // before either text model is released, including during StrictMode cleanup.
        const viewModel = instance.createViewModel(models);
        instance.setModel(viewModel);

        // Apply tokens directly to both Monaco roots: theme variables are defined there,
        // so inherited wrapper variables would lose to Monaco's generated theme rules.
        for (const node of [
            instance.getOriginalEditor().getDomNode(),
            instance.getModifiedEditor().getDomNode(),
            instance.getContainerDomNode(),
        ]) {
            for (const [token, gravityToken] of Object.entries(diffTokens)) {
                node?.style.setProperty(`--vscode-${token}`, `var(--g-color-${gravityToken})`);
            }
        }

        let frame = 0;
        const resize = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const contentHeight = Math.max(
                    instance.getOriginalEditor().getContentHeight(),
                    instance.getModifiedEditor().getContentHeight(),
                );
                const height = Math.min(heightRef.current, Math.max(120, contentHeight));
                if (container.style.height !== `${height}px`)
                    container.style.height = `${height}px`;
                instance.layout();
            });
        };
        resizeRef.current = resize;
        callbacksRef.current.onDiffChange?.(null);
        const subscriptions = [
            models.original.onDidChangeContent(() => callbacksRef.current.onDiffChange?.(null)),
            models.modified.onDidChangeContent(() => {
                callbacksRef.current.onDiffChange?.(null);
                if (!syncingRef.current)
                    callbacksRef.current.onChange?.(models.modified.getValue());
            }),
            instance.getOriginalEditor().onDidContentSizeChange(resize),
            instance.getModifiedEditor().onDidContentSizeChange(resize),
            instance.onDidUpdateDiff(() => {
                const result = (instance as DiffResultEditor).getDiffComputationResult?.();
                const changes = instance.getLineChanges();
                callbacksRef.current.onDiffChange?.(
                    !result || result.quitEarly || !changes
                        ? null
                        : changes.reduce(
                              (stats, change) => ({
                                  added:
                                      stats.added +
                                      (change.modifiedEndLineNumber === 0
                                          ? 0
                                          : change.modifiedEndLineNumber -
                                            change.modifiedStartLineNumber +
                                            1),
                                  removed:
                                      stats.removed +
                                      (change.originalEndLineNumber === 0
                                          ? 0
                                          : change.originalEndLineNumber -
                                            change.originalStartLineNumber +
                                            1),
                              }),
                              {added: 0, removed: 0},
                          ),
                );
                resize();
            }),
        ];
        resize();
        return () => {
            cancelAnimationFrame(frame);
            resizeRef.current = null;
            subscriptions.forEach((subscription) => subscription.dispose());
            instance.dispose();
            viewModel.dispose();
            models.original.dispose();
            models.modified.dispose();
            editorRef.current = null;
            modelsRef.current = null;
        };
        // Models and the editor live for the lifetime of the component.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        editorRef.current?.updateOptions({
            readOnly: isReadOnly,
            renderMarginRevertIcon: !isReadOnly,
            renderGutterMenu: !isReadOnly && mode === 'unified',
            renderSideBySide: mode === 'split',
        });
        resizeRef.current?.();
    }, [isReadOnly, mode, maxHeight]);

    useEffect(() => {
        const models = modelsRef.current;
        if (!models) return;
        syncingRef.current = true;
        try {
            if (models.original.getValue() !== original) models.original.setValue(original);
            if (models.modified.getValue() !== modified) {
                const modifiedEditor = editorRef.current?.getModifiedEditor();
                modifiedEditor?.pushUndoStop();
                modifiedEditor?.executeEdits('external-value', [
                    {range: models.modified.getFullModelRange(), text: modified},
                ]);
                modifiedEditor?.pushUndoStop();
            }
        } finally {
            syncingRef.current = false;
        }
    }, [original, modified]);

    useEffect(() => {
        const models = modelsRef.current;
        if (!models) return;
        monaco.editor.setModelLanguage(models.original, language);
        monaco.editor.setModelLanguage(models.modified, language);
    }, [language]);

    useEffect(() => {
        monaco.editor.setTheme(resolvedTheme);
    }, [resolvedTheme]);

    return <div ref={containerRef} className={block(null, className)} />;
}
