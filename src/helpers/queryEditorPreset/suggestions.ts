import type * as Monaco from 'monaco-editor';

import type {EditorMonaco, EditorProviderContext} from '../../types/editorProviders';
import type {QueryCatalogRequest, QueryEditorPresetOptions} from '../../types/queryEditorPreset';

import type {CompletionTarget, DialectAnalysis, QueryNamespace} from './dialects/types';
import {activeCluster, tokenize, visibleTableReferences} from './syntax';

type SuggestionState = {
    analysis: DialectAnalysis;
    target: CompletionTarget;
    suggestions: Monaco.languages.CompletionItem[];
    replacement: Monaco.IRange;
    monaco: EditorMonaco;
};
type AdapterState = SuggestionState & {
    namespace: QueryNamespace;
    query: string;
    offset: number;
    context: EditorProviderContext;
    options: QueryEditorPresetOptions;
    request: Omit<QueryCatalogRequest, 'path'>;
    quoteIdentifier: (value: string) => string;
    tableContext: boolean;
};

export function appendLocalSuggestions({
    analysis,
    target,
    suggestions,
    replacement,
    monaco,
}: SuggestionState) {
    const kind = monaco.languages.CompletionItemKind;
    if (!target.quoted) {
        suggestions.push(
            ...analysis.keywords.map((word) => ({
                label: word,
                insertText: word,
                kind: kind.Keyword,
                range: replacement,
            })),
        );
        suggestions.push(
            ...analysis.operators.map((word) => ({
                label: word,
                insertText: word,
                kind: kind.Operator,
                range: replacement,
            })),
            ...analysis.types.map((word) => ({
                label: word,
                insertText: word,
                kind: kind.TypeParameter,
                range: replacement,
            })),
            ...analysis.functions.map((word) => ({
                label: word,
                insertText: word + '(${1})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: kind.Function,
                range: replacement,
            })),
        );
        suggestions.push(
            ...analysis.aliases.map((name) => ({
                label: name,
                insertText: name,
                kind: kind.Variable,
                range: replacement,
            })),
        );
    }
}
export function appendCatalogSuggestions({
    namespace,
    query,
    offset,
    target,
    suggestions,
    replacement,
    monaco,
    options,
    request,
    quoteIdentifier,
    tableContext,
}: AdapterState) {
    const kind = monaco.languages.CompletionItemKind;
    const tasks: Promise<void>[] = [];
    const listPathChildren = options.listPathChildren;
    if (tableContext && listPathChildren) {
        const slash = target.prefix.lastIndexOf('/');
        const databaseNamespace = namespace === 'database';
        const database = target.qualifier ?? activeCluster(query.slice(0, offset));
        let path = slash >= 0 ? target.prefix.slice(0, slash + 1) : '';
        if (databaseNamespace) path = database ? database + '.' : '';
        tasks.push(
            Promise.resolve()
                .then(() => listPathChildren({...request, path}))
                .then((items) => {
                    for (const item of items) {
                        const identifier = item.path ?? path + item.name;
                        // The qualifier is already in the document (or selected by USE).
                        const insertIdentifier =
                            databaseNamespace && path && identifier.startsWith(path)
                                ? identifier.slice(path.length)
                                : identifier;
                        suggestions.push({
                            label: item.name,
                            insertText: quoteIdentifier(
                                insertIdentifier +
                                    (item.kind === 'directory' && !identifier.endsWith('/')
                                        ? '/'
                                        : ''),
                            ),
                            filterText: insertIdentifier,
                            detail: item.detail,
                            kind: item.kind === 'directory' ? kind.Folder : kind.Struct,
                            range: replacement,
                        });
                    }
                })
                .catch(() => {}),
        );
    }

    return tasks;
}
export function appendColumnSuggestions({
    analysis,
    namespace,
    target,
    suggestions,
    replacement,
    monaco,
    query,
    offset,
    context,
    options,
    request,
    quoteIdentifier,
}: AdapterState) {
    const kind = monaco.languages.CompletionItemKind;
    const tasks: Promise<void>[] = [];
    if (analysis.columnContext) {
        const references = currentReferences(query, offset, context.clusterId, namespace);
        const selected = target.qualifier
            ? references.filter(
                  (item) =>
                      item.alias === target.qualifier ||
                      item.identifier === target.qualifier ||
                      (namespace === 'database' &&
                          item.identifier.split('.').pop() === target.qualifier),
              )
            : references;
        for (const table of selected) {
            if (!target.qualifier && table.alias)
                suggestions.push({
                    label: table.alias,
                    insertText: table.alias + '.',
                    kind: kind.Variable,
                    range: replacement,
                });
            const getTableSchema = options.getTableSchema;
            if (getTableSchema)
                tasks.push(
                    Promise.resolve()
                        .then(() =>
                            getTableSchema({
                                ...request,
                                path: table.identifier,
                                clusterId: table.clusterId,
                            }),
                        )
                        .then((columns) => {
                            suggestions.push(
                                ...columns.map((column) => ({
                                    label: column.name,
                                    insertText: quoteIdentifier(column.name),
                                    detail: column.detail ?? column.type,
                                    kind: kind.Field,
                                    range: replacement,
                                })),
                            );
                        })
                        .catch(() => {}),
                );
        }
        suggestions.push(
            ...analysis.columns.map((name) => ({
                label: name,
                insertText: quoteIdentifier(name),
                kind: kind.Field,
                range: replacement,
            })),
        );
    }

    return tasks;
}

function currentReferences(
    query: string,
    offset: number,
    clusterId: string | undefined,
    namespace: QueryNamespace,
) {
    const separators = tokenize(query).filter((item) => item.text === ';');
    const statementStart = [...separators].reverse().find((item) => item.end <= offset)?.end ?? 0;
    const statementEnd = separators.find((item) => item.start >= offset)?.start ?? query.length;
    return visibleTableReferences(query, offset, clusterId, namespace).filter(
        (item) => item.start >= statementStart && item.end <= statementEnd,
    );
}
