import type * as Monaco from 'monaco-editor';

/** Standalone Monaco API used by the component, without bundled language services. */
export type EditorMonaco = Omit<typeof Monaco, 'lsp' | 'css' | 'html' | 'json' | 'typescript'>;

export type EditorProviderContext = {
    language?: string;
    engineId?: string;
    clusterId?: string;
    data?: unknown;
};

export type EditorProviderSet = {
    completion?: Monaco.languages.CompletionItemProvider;
    inlineCompletion?: Monaco.languages.InlineCompletionsProvider;
    hover?: Monaco.languages.HoverProvider;
    definition?: Monaco.languages.DefinitionProvider;
    documentFormatting?: Monaco.languages.DocumentFormattingEditProvider;
};

export type EditorProviderOverride<T, Mode = 'replace' | 'append'> =
    false | {mode: Mode; provider: T};

export type EditorProviders = {
    [K in keyof EditorProviderSet]?: EditorProviderOverride<
        NonNullable<EditorProviderSet[K]>,
        K extends 'documentFormatting' ? 'replace' : 'replace' | 'append'
    >;
};

export type EditorSetupContext = {
    editor: Monaco.editor.IStandaloneCodeEditor;
    model: Monaco.editor.ITextModel;
    monaco: EditorMonaco;
};

export type EditorPreset = {
    create: (context: EditorSetupContext & {context: EditorProviderContext}) => {
        providers?: EditorProviderSet;
        dispose?: () => void;
    };
};

export type EditorExtension = {
    setup: (context: EditorSetupContext & {statusBarElement: HTMLDivElement | null}) => () => void;
};
