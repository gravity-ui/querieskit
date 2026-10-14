import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import type {editor} from 'monaco-editor';
import * as monaco from 'monaco-editor/editor/editor.api';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import {QueryComparison} from '../../../src/modules/QueryComparison';
import type {QueryComparisonItem} from '../../../src/types/queryComparison';
import {setLang} from '../../../src/i18n';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {getWorker: () => new EditorWorker()};
configure({lang: 'en'});
setLang('en');

let items: QueryComparisonItem[] = [
    {id: 'query', title: 'Query', language: 'sql', original: 'SELECT 1;', modified: 'SELECT 2;'},
    {id: 'config', title: 'Configuration', original: 'alpha\nbeta', modified: 'alpha\nbeta\ngamma'},
];
let mounted = true;
let readOnly = false;
let theme: 'light' | 'dark' = 'light';
const changes: {id: string; value: string | null}[] = [];
const container = document.getElementById('root');
if (!container) throw new Error('Missing fixture root');
const root = createRoot(container);
function render() {
    root.render(
        <StrictMode>
            <ThemeProvider theme={theme}>
                <div style={{height: 'calc(100vh - 16px)'}}>
                    {mounted && (
                        <QueryComparison
                            items={items}
                            readOnly={readOnly}
                            onBlockChange={(id, value) => {
                                changes.push({id, value});
                                items = items.map((item) =>
                                    item.id === id ? {...item, modified: value} : item,
                                );
                                render();
                            }}
                        />
                    )}
                </div>
            </ThemeProvider>
        </StrictMode>,
    );
}
function getEditor(id: string, side: 'original' | 'modified') {
    const title = items.find((item) => item.id === id)?.title;
    const result = monaco.editor.getEditors().find((candidate: editor.ICodeEditor) => {
        const node = candidate.getDomNode();
        return (
            node?.closest(`.${side}`) &&
            node.closest('section')?.querySelector('.qp-comparison-block__title')?.textContent ===
                title
        );
    }) as editor.ICodeEditor | undefined;
    if (!result) throw new Error(`Missing ${side} editor for ${id}`);
    return result;
}
const api = {
    replace(next: QueryComparisonItem[]) {
        items = next;
        render();
    },
    setMounted(value: boolean) {
        mounted = value;
        render();
    },
    setTheme(value: 'light' | 'dark') {
        theme = value;
        render();
    },
    setReadOnly(value: boolean) {
        readOnly = value;
        render();
    },
    focus(id: string, side: 'original' | 'modified') {
        const instance = getEditor(id, side);
        instance.focus();
        instance.setSelection(instance.getModel()!.getFullModelRange());
    },
    edit(id: string, value: string) {
        const instance = getEditor(id, 'modified');
        instance.pushUndoStop();
        instance.executeEdits('test', [
            {range: instance.getModel()!.getFullModelRange(), text: value},
        ]);
        instance.pushUndoStop();
    },
    undo(id: string) {
        getEditor(id, 'modified').trigger('test', 'undo', null);
    },
    snapshot() {
        return {
            items,
            changes,
            modelCount: monaco.editor.getModels().length,
            uris: monaco.editor.getModels().map((model: editor.ITextModel) => model.uri.toString()),
        };
    },
};
declare global {
    interface Window {
        comparisonTest: typeof api;
    }
}
window.comparisonTest = api;
render();
