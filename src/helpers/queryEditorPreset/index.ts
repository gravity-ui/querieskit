import type * as Monaco from 'monaco-editor';

import type {EditorPreset} from '../../types/editorProviders';
import type {QueryEditorPresetOptions, QueryEditorReference} from '../../types/queryEditorPreset';

export type {
    QueryEditorPresetOptions,
    QueryEditorLanguage,
    QueryCatalogRequest,
    QueryCatalogItem,
    QueryTableColumn,
    QueryEditorReference,
} from '../../types/queryEditorPreset';
export type {EditorPreset, EditorProviderContext} from '../../types/editorProviders';

import {getDialect} from './dialects';
import {
    appendCatalogSuggestions,
    appendColumnSuggestions,
    appendLocalSuggestions,
} from './suggestions';
import {completionCluster, completionTarget, tokenize, visibleTableReferences} from './syntax';

function range(model: Monaco.editor.ITextModel, start: number, end: number): Monaco.IRange {
    const from = model.getPositionAt(start);
    const to = model.getPositionAt(end);
    return {
        startLineNumber: from.lineNumber,
        startColumn: from.column,
        endLineNumber: to.lineNumber,
        endColumn: to.column,
    };
}

/** Creates opt-in SQL completion and navigation; all application I/O is injected. */
export function createQueryEditorPreset(options: QueryEditorPresetOptions = {}): EditorPreset {
    return {
        create({editor, model, monaco, context}) {
            const language = context.language ?? model.getLanguageId();
            const dialect = getDialect(language);
            if (!dialect || (options.languages && !options.languages.includes(dialect.id)))
                return {};
            const releaseLanguage = dialect.register(monaco);
            const referenceAt = (position: Monaco.Position): QueryEditorReference | undefined => {
                const offset = model.getOffsetAt(position);
                const reference = visibleTableReferences(
                    model.getValue(),
                    offset,
                    context.clusterId,
                    dialect.namespace,
                ).find((item) => item.start <= offset && offset < item.end);
                return (
                    reference && {
                        kind: 'table',
                        identifier: reference.identifier,
                        clusterId: reference.clusterId,
                        range: range(model, reference.start, reference.end),
                    }
                );
            };
            const mouse = options.onReferenceClick
                ? editor.onMouseDown((event) => {
                      if (
                          event.target.type !== monaco.editor.MouseTargetType.CONTENT_TEXT ||
                          !event.target.position ||
                          !(event.event.ctrlKey || event.event.metaKey)
                      )
                          return;
                      const reference = referenceAt(event.target.position);
                      if (reference) options.onReferenceClick?.(reference);
                  })
                : undefined;
            return {
                dispose: () => {
                    mouse?.dispose();
                    releaseLanguage();
                },
                providers: {
                    hover: options.onReferenceClick
                        ? {
                              provideHover(_model, position) {
                                  const reference = referenceAt(position);
                                  return reference
                                      ? {
                                            range: reference.range,
                                            contents: [
                                                {
                                                    value:
                                                        reference.identifier.replace(
                                                            /[\\`*_{}[\]()#+.!<>|]/g,
                                                            '\\$&',
                                                        ) +
                                                        (reference.clusterId
                                                            ? ` (${reference.clusterId.replace(/[\\`*_{}[\]()#+.!<>|]/g, '\\$&')})`
                                                            : ''),
                                                },
                                            ],
                                        }
                                      : undefined;
                              },
                          }
                        : undefined,
                    completion: {
                        triggerCharacters: ['.', '/', '`', '"'],
                        async provideCompletionItems(_model, position, _completionContext, token) {
                            const query = model.getValue();
                            const offset = model.getOffsetAt(position);
                            const target = completionTarget(query, offset);
                            const lexicalToken = tokenize(query, true).find(
                                (item) => item.start < offset && item.end >= offset,
                            );
                            if (lexicalToken && /^(?:'|--|\/\*)/.test(lexicalToken.text))
                                return {suggestions: []};
                            const replacement = range(model, target.start, target.end);
                            const suggestions: Monaco.languages.CompletionItem[] = [];
                            const analysis = await dialect.analyze(query, position, target);
                            if (token.isCancellationRequested) return {suggestions: []};
                            appendLocalSuggestions({
                                analysis,
                                target,
                                suggestions,
                                replacement,
                                monaco,
                            });
                            const {tableContext} = analysis;
                            const clusterId = completionCluster(
                                dialect.namespace,
                                query.slice(0, offset),
                                context.clusterId,
                                tableContext ? target.qualifier : undefined,
                            );
                            const request = {...context, language, clusterId, token};
                            const quoteIdentifier = (value: string) =>
                                dialect.quoteIdentifier(value, target);
                            const state = {
                                analysis,
                                namespace: dialect.namespace,
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
                                tableContext,
                            };
                            const tasks = [
                                ...appendCatalogSuggestions(state),
                                ...appendColumnSuggestions(state),
                            ];
                            await Promise.all(tasks);
                            return {suggestions: token.isCancellationRequested ? [] : suggestions};
                        },
                    },
                },
            };
        },
    };
}
