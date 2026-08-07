import {
    type CancellationToken,
    Emitter,
    type IEvent,
    type Position,
    type editor,
    languages,
} from 'monaco-editor';

interface ILang extends languages.ILanguageExtensionPoint {
    loader: () => Promise<ILangImpl>;
}

interface ILangImpl {
    conf: languages.LanguageConfiguration;
    language: languages.IMonarchLanguage;
    provideSuggestionsFunction?: (
        model: editor.ITextModel,
        monacoCursorPosition: Position,
        _context: languages.CompletionContext,
        _token: CancellationToken,
    ) =>
        | {suggestions: languages.CompletionItem[]}
        | Promise<{suggestions: languages.CompletionItem[]}>;
    provideInlineSuggestionsFunction?: (
        model: editor.ITextModel,
        monacoCursorPosition: Position,
        _context: languages.InlineCompletionContext,
        _token: CancellationToken,
    ) => Promise<{items: languages.InlineCompletion[]}>;
}

const languageDefinitions: {[languageId: string]: ILang} = {};
const lazyLanguageLoaders: {[languageId: string]: LazyLanguageLoader} = {};

class LazyLanguageLoader {
    public static getOrCreate(languageId: string): LazyLanguageLoader {
        if (!lazyLanguageLoaders[languageId]) {
            lazyLanguageLoaders[languageId] = new LazyLanguageLoader(languageId);
        }
        return lazyLanguageLoaders[languageId];
    }

    private readonly _languageId: string;
    private _loadingTriggered: boolean;
    private _lazyLoadPromise: Promise<ILangImpl>;
    private _lazyLoadPromiseResolve!: (value: ILangImpl) => void;
    private _lazyLoadPromiseReject!: (err: unknown) => void;

    constructor(languageId: string) {
        this._languageId = languageId;
        this._loadingTriggered = false;
        this._lazyLoadPromise = new Promise((resolve, reject) => {
            this._lazyLoadPromiseResolve = resolve;
            this._lazyLoadPromiseReject = reject;
        });
    }

    public whenLoaded(): Promise<ILangImpl> {
        return this._lazyLoadPromise;
    }

    public load(): Promise<ILangImpl> {
        if (!this._loadingTriggered) {
            this._loadingTriggered = true;
            languageDefinitions[this._languageId].loader().then(
                (mod) => this._lazyLoadPromiseResolve(mod),
                (err) => this._lazyLoadPromiseReject(err),
            );
        }
        return this._lazyLoadPromise;
    }
}

export function registerLanguage(def: ILang): void {
    const languageId = def.id;

    languageDefinitions[languageId] = def;
    languages.register(def);

    const lazyLanguageLoader = LazyLanguageLoader.getOrCreate(languageId);
    languages.setMonarchTokensProvider(
        languageId,
        lazyLanguageLoader.whenLoaded().then((mod) => mod.language),
    );
    languages.onLanguage(languageId, () => {
        lazyLanguageLoader.load().then((mod) => {
            languages.setLanguageConfiguration(languageId, mod.conf);
        });
    });
    lazyLanguageLoader.whenLoaded().then((mod) => {
        if (mod.provideSuggestionsFunction) {
            languages.registerCompletionItemProvider(languageId, {
                triggerCharacters: ['`', ':', '/', '', ' '],
                provideCompletionItems: mod.provideSuggestionsFunction,
            });
        }
        if (mod.provideInlineSuggestionsFunction) {
            languages.registerInlineCompletionsProvider(languageId, {
                provideInlineCompletions: mod.provideInlineSuggestionsFunction,
                disposeInlineCompletions: () => {},
            });
        }
    });
}

export interface ModeConfiguration {
    readonly completionItems?: boolean;
    readonly hovers?: boolean;
    readonly documentSymbols?: boolean;
    readonly definitions?: boolean;
    readonly references?: boolean;
    readonly documentHighlights?: boolean;
    readonly rename?: boolean;
    readonly colors?: boolean;
    readonly foldingRanges?: boolean;
    readonly diagnostics?: boolean;
    readonly selectionRanges?: boolean;
}

export interface DiagnosticsOptions {
    readonly validate?: boolean;
}

export interface LanguageServiceDefaults {
    readonly languageId: string;
    readonly onDidChange: IEvent<LanguageServiceDefaults>;
    readonly diagnosticsOptions: DiagnosticsOptions;
    readonly modeConfiguration: ModeConfiguration;
    setDiagnosticsOptions(options: DiagnosticsOptions): void;
    setModeConfiguration(modeConfiguration: ModeConfiguration): void;
}

export class LanguageServiceDefaultsImpl implements LanguageServiceDefaults {
    private _onDidChange = new Emitter<LanguageServiceDefaults>();
    private _diagnosticsOptions!: DiagnosticsOptions;
    private _modeConfiguration!: ModeConfiguration;
    private _languageId: string;

    constructor(
        languageId: string,
        diagnosticsOptions: DiagnosticsOptions,
        modeConfiguration: ModeConfiguration,
    ) {
        this._languageId = languageId;
        this.setDiagnosticsOptions(diagnosticsOptions);
        this.setModeConfiguration(modeConfiguration);
    }

    public get onDidChange(): IEvent<LanguageServiceDefaults> {
        return this._onDidChange.event;
    }

    public get languageId(): string {
        return this._languageId;
    }

    public get modeConfiguration(): ModeConfiguration {
        return this._modeConfiguration;
    }

    public get diagnosticsOptions(): DiagnosticsOptions {
        return this._diagnosticsOptions;
    }

    public setDiagnosticsOptions(options: DiagnosticsOptions): void {
        this._diagnosticsOptions = options || Object.create(null);
        this._onDidChange.fire(this);
    }

    public setModeConfiguration(modeConfiguration: ModeConfiguration): void {
        this._modeConfiguration = modeConfiguration || Object.create(null);
        this._onDidChange.fire(this);
    }
}

export const modeConfigurationDefault: Required<ModeConfiguration> = {
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    definitions: true,
    references: true,
    documentHighlights: true,
    rename: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
    selectionRanges: true,
};

export const diagnosticDefault: Required<DiagnosticsOptions> = {
    validate: true,
};
