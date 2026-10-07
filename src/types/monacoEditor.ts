import type {editor} from 'monaco-editor';

export type MonacoEditorConfig = Omit<editor.IStandaloneEditorConstructionOptions, 'theme'>;

export type MonacoEditorProps = {
    value: string;
    /** Called for editor changes, including undo/redo, but not external value updates. */
    onChange?: (value: string) => void;
    readOnly?: boolean;
    language?: string;
    theme?: string;
    /** Instance-local editor and gutter background; accepts CSS colors and variables. */
    backgroundColor?: string;
    onClick?: (event: editor.IEditorMouseEvent) => void;
    monacoConfig?: MonacoEditorConfig;
    className?: string;
};
