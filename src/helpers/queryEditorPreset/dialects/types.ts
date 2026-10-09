import type * as Monaco from 'monaco-editor';

import type {EditorMonaco} from '../../../types/editorProviders';
import type {QueryEditorLanguage} from '../../../types/queryEditorPreset';

export type QueryNamespace = 'cluster' | 'database';
export type CompletionTarget = {
    start: number;
    end: number;
    prefix: string;
    quoted: boolean;
    closed: boolean;
    quote: string;
    qualifier?: string;
    before: string;
};

/** Parser-neutral data consumed by the shared completion and adapter pipeline. */
export type DialectAnalysis = {
    keywords: readonly string[];
    functions: readonly string[];
    operators: readonly string[];
    types: readonly string[];
    aliases: readonly string[];
    columns: readonly string[];
    tableContext: boolean;
    columnContext: boolean;
};

export type DialectVocabulary = {
    keywords: readonly string[];
    functions?: readonly string[];
    operators?: readonly string[];
    types?: readonly string[];
};

export type QueryDialect = {
    id: QueryEditorLanguage;
    namespace: QueryNamespace;
    register: (monaco: EditorMonaco) => () => void;
    quoteIdentifier: (value: string, target: CompletionTarget) => string;
    analyze: (
        query: string,
        position: Monaco.Position,
        target: CompletionTarget,
    ) => Promise<DialectAnalysis>;
};
