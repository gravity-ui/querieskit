import type {editor} from 'monaco-editor';
import type {Ref} from 'react';
import type {
    EditorExtension,
    EditorPreset,
    EditorProviderContext,
    EditorProviders,
} from './editorProviders';

export type MonacoEditorConfig = Omit<
    editor.IStandaloneEditorConstructionOptions,
    'theme' | 'model'
> & {
    /** @deprecated External models cannot be combined with the editor integration API. */
    model?: editor.ITextModel | null;
};

export type MonacoEditorIntegrationProps = {
    editorRef?: Ref<editor.IStandaloneCodeEditor>;
    onClick?: (event: editor.IEditorMouseEvent) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    preset?: EditorPreset;
    providers?: EditorProviders;
    providerContext?: EditorProviderContext;
    extensions?: readonly EditorExtension[];
    showStatusBar?: boolean;
    diagnostics?: readonly editor.IMarkerData[];
    highlightErrorLines?: boolean;
    highlightedLine?: number;
    onLineNumberClick?: (lineNumber: number) => void;
};

export type MonacoEditorProps = MonacoEditorIntegrationProps & {
    value: string;
    /** Called for editor changes, including undo/redo, but not external value updates. */
    onChange?: (value: string) => void;
    readOnly?: boolean;
    language?: string;
    theme?: string;
    /** Instance-local editor and gutter background; accepts CSS colors and variables. */
    backgroundColor?: string;
    monacoConfig?: MonacoEditorConfig;
    className?: string;
};
