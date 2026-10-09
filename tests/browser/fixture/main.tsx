import React, {StrictMode, createRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ThemeProvider} from '@gravity-ui/uikit';
import * as monaco from 'monaco-editor/editor/editor.api';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import {MonacoEditor} from '../../../src/components/MonacoEditor';
import type {EditorPreset, EditorProviders} from '../../../src/types/editorProviders';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {getWorker: () => new EditorWorker()};

type Id = 'first' | 'second';
type Settings = {
    clusterId: string;
    language: string;
    mounted: boolean;
    providers?: EditorProviders;
};
const ids: Id[] = ['first', 'second'];
const refs = {
    first: createRef<monaco.editor.IStandaloneCodeEditor>(),
    second: createRef<monaco.editor.IStandaloneCodeEditor>(),
};
const settings: Record<Id, Settings> = {
    first: {clusterId: 'alpha', language: 'yql', mounted: true},
    second: {clusterId: 'beta', language: 'yql', mounted: true},
};
const stats = {
    first: {created: 0, disposed: 0, cancelled: 0, pending: 0, listsDisposed: 0},
    second: {created: 0, disposed: 0, cancelled: 0, pending: 0, listsDisposed: 0},
};
const held = new Set<Id>();
const pending: Record<Id, (() => void)[]> = {first: [], second: []};

function completion(label: string, model: monaco.editor.ITextModel, position: monaco.Position) {
    const word = model.getWordUntilPosition(position);
    return {
        label,
        insertText: label,
        kind: monaco.languages.CompletionItemKind.Text,
        range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn,
        ),
    };
}

function preset(id: Id): EditorPreset {
    return {
        create({context}) {
            stats[id].created++;
            const prefix = `${id}_${context.clusterId}`;
            return {
                dispose: () => {
                    stats[id].disposed++;
                },
                providers: {
                    completion: {
                        provideCompletionItems(model, position, _context, token) {
                            const item = completion(`${prefix}_completion`, model, position);
                            const result = () => ({
                                suggestions: [item],
                                dispose: () => {
                                    stats[id].listsDisposed++;
                                },
                            });
                            if (!held.has(id)) return result();
                            stats[id].pending++;
                            const subscription = token.onCancellationRequested(() => {
                                stats[id].cancelled++;
                            });
                            return new Promise((resolve) =>
                                pending[id].push(() => {
                                    subscription.dispose();
                                    stats[id].pending--;
                                    resolve(result());
                                }),
                            );
                        },
                    },
                    inlineCompletion: {
                        provideInlineCompletions(_model, position) {
                            return {
                                items: [
                                    {
                                        insertText: `${prefix}_inline`,
                                        range: new monaco.Range(
                                            position.lineNumber,
                                            position.column,
                                            position.lineNumber,
                                            position.column,
                                        ),
                                    },
                                ],
                            };
                        },
                        disposeInlineCompletions() {},
                    },
                    documentFormatting: {
                        provideDocumentFormattingEdits(model) {
                            return [
                                {range: model.getFullModelRange(), text: `${prefix}_formatted`},
                            ];
                        },
                    },
                },
            };
        },
    };
}
const presets = {first: preset('first'), second: preset('second')};
const editorOptions = {
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    inlineSuggest: {enabled: true},
};

function Example({id, config}: {id: Id; config: Settings}) {
    const [value, setValue] = useState('');
    return (
        <div data-testid={id} style={{height: 240, width: 800}}>
            <MonacoEditor
                value={value}
                onChange={setValue}
                editorRef={refs[id]}
                preset={presets[id]}
                language={config.language}
                providerContext={{clusterId: config.clusterId}}
                providers={config.providers}
                monacoConfig={editorOptions}
            />
        </div>
    );
}
const container = document.getElementById('root');
if (!container) throw new Error('Missing fixture root');
const root = createRoot(container);
function render() {
    flushSync(() =>
        root.render(
            <StrictMode>
                <ThemeProvider>
                    {ids.map(
                        (id) =>
                            settings[id].mounted && (
                                <Example key={id} id={id} config={{...settings[id]}} />
                            ),
                    )}
                </ThemeProvider>
            </StrictMode>,
        ),
    );
}

function getEditor(id: Id) {
    const editor = refs[id].current;
    if (!editor) throw new Error(`Editor ${id} is not mounted`);
    return editor;
}

async function runAction(id: Id, actionId: string) {
    const action = getEditor(id).getAction(actionId);
    if (!action) throw new Error(`Missing Monaco action ${actionId}`);
    await action.run();
}

const api = {
    update(id: Id, patch: Partial<Pick<Settings, 'clusterId' | 'language' | 'mounted'>>) {
        Object.assign(settings[id], patch);
        render();
    },
    replaceHover(id: Id) {
        settings[id].providers = {
            ...settings[id].providers,
            hover: {
                mode: 'replace',
                provider: {provideHover: () => ({contents: [{value: 'custom hover'}]})},
            },
        };
        render();
    },
    replaceCompletion(id: Id) {
        settings[id].providers = {
            ...settings[id].providers,
            completion: {
                mode: 'replace',
                provider: {
                    provideCompletionItems: (model, position) => ({
                        suggestions: [completion(`${id}_replacement`, model, position)],
                    }),
                },
            },
        };
        render();
    },
    hold(id: Id) {
        held.add(id);
    },
    release(id: Id) {
        held.delete(id);
        pending[id].splice(0).forEach((resolve) => resolve());
    },
    suggest(id: Id) {
        const editor = getEditor(id);
        editor.focus();
        editor.trigger('test', 'editor.action.triggerSuggest', {});
    },
    async inline(id: Id) {
        const editor = getEditor(id);
        editor.focus();
        editor.trigger('test', 'hideSuggestWidget', {});
        await runAction(id, 'editor.action.inlineSuggest.trigger');
    },
    async format(id: Id) {
        await runAction(id, 'editor.action.formatDocument');
    },
    snapshot() {
        return Object.fromEntries(
            ids.map((id) => [
                id,
                {
                    ...stats[id],
                    ready: Boolean(refs[id].current),
                    value: refs[id].current?.getValue(),
                    uri: refs[id].current?.getModel()?.uri.toString(),
                    language: refs[id].current?.getModel()?.getLanguageId(),
                },
            ]),
        );
    },
    modelCount: () => monaco.editor.getModels().length,
};
declare global {
    interface Window {
        editorTest: typeof api;
    }
}
window.editorTest = api;
render();
