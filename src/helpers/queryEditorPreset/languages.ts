import type * as Monaco from 'monaco-editor';

import type {EditorMonaco} from '../../types/editorProviders';

const ownedLanguages = new WeakMap<EditorMonaco, Set<string>>();

const registrations = new WeakMap<
    EditorMonaco,
    Map<string, {count: number; dispose: () => void}>
>();

export function registerFallbackLanguage(
    monaco: EditorMonaco,
    language: string,
    vocabulary: {keywords: readonly string[]; types: readonly string[]},
) {
    let entries = registrations.get(monaco);
    if (!entries) {
        entries = new Map();
        registrations.set(monaco, entries);
    }
    let entry = entries.get(language);
    if (!entry) {
        // Respect a language definition supplied by the application.
        const existing = monaco.languages.getLanguages().some(({id}) => id === language);
        const disposables: Monaco.IDisposable[] = [];
        if (!existing || ownedLanguages.get(monaco)?.has(language)) {
            if (!existing) {
                monaco.languages.register({id: language});
                let owned = ownedLanguages.get(monaco);
                if (!owned) {
                    owned = new Set();
                    ownedLanguages.set(monaco, owned);
                }
                owned.add(language);
            }
            disposables.push(
                monaco.languages.setMonarchTokensProvider(language, {
                    ignoreCase: true,
                    keywords: [...vocabulary.keywords],
                    typeKeywords: [...vocabulary.types],
                    tokenizer: {
                        root: [
                            [/--.*$/, 'comment'],
                            [/\/\*/, 'comment', '@comment'],
                            [/'(?:''|[^'])*'/, 'string'],
                            [/`(?:``|[^`])*`/, 'identifier'],
                            [
                                /[a-z_$][\w$]*/,
                                {
                                    cases: {
                                        '@keywords': 'keyword',
                                        '@typeKeywords': 'type',
                                        '@default': 'identifier',
                                    },
                                },
                            ],
                            [/\d+(?:\.\d+)?/, 'number'],
                            [/[+*/%=<>!-]+/, 'operator'],
                        ],
                        comment: [
                            [/[^/*]+/, 'comment'],
                            [/\*\//, 'comment', '@pop'],
                            [/[/*]/, 'comment'],
                        ],
                    },
                }),
            );
            disposables.push(
                monaco.languages.setLanguageConfiguration(language, {
                    comments: {lineComment: '--', blockComment: ['/*', '*/']},
                    brackets: [
                        ['(', ')'],
                        ['[', ']'],
                    ],
                    autoClosingPairs: [
                        {open: '(', close: ')'},
                        {open: "'", close: "'", notIn: ['string', 'comment']},
                        {open: '`', close: '`', notIn: ['string', 'comment']},
                    ],
                }),
            );
        }
        entry = {count: 0, dispose: () => disposables.reverse().forEach((item) => item.dispose())};
        entries.set(language, entry);
    }
    entry.count += 1;
    return () => {
        if (--entry.count === 0) {
            entry.dispose();
            entries.delete(language);
        }
    };
}
